import { Tenant } from '@/types/tenant';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { Contract } from '@/types/contract';
import { firestoreService } from '@/lib/services/firestore-service';
import { Payment } from '@/types/payment';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { getSignatureFile } from '@/utils/cloudinaryActions';
import { Room } from '@/types/room';

export async function POST(req: Request) {
  const formData = await req.formData();

  const contract = JSON.parse(formData.getAll('contract')[0] as string) as Contract;
  const tenant = JSON.parse(formData.getAll('currentTenant')[0] as string) as Tenant;
  const deposit = JSON.parse(formData.getAll('deposit')[0] as string) as Payment;
  const contractFile = formData.getAll('contractFile')[0] as string;
  const additionalFile = formData.getAll('additionalFile')[0] as string;
  const pastRents = JSON.parse(formData.getAll('pastRents')[0] as string) as Payment[];
  const futureRents = JSON.parse(formData.getAll('futureRents')[0] as string) as Payment[];

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  try {
    const signatureFiles = {contract: {}, additional: {}};

    //Inactivate current contract:
    const currentContract = await firestoreService.getDocument("contracts",tenant.current_contract_id) as Contract;
    currentContract.status = "Terminated";
    currentContract.is_current = false;

    //Delete future rents from old contract
    const multipleDocsToDelete: MultipleDoc[] = []
    const payments = await firestoreService.getDocumentsBy("payments", "contract_id", tenant.current_contract_id) as Payment[];
    payments.filter(p => p.status === "Pending").map(p => {
      multipleDocsToDelete.push({
        collection: "payments",
        data: p,
        docId: p.id
      })
    })

    contract.id = uuidv4();
    contract.tenant_id = tenant.id;
    contract.lease_start = new Date(contract.lease_start as Date);
    contract.lease_end = new Date(contract.lease_end as Date);
    contract.status = "Active";
    contract.is_current = true;
    contract.createdAt = new Date();

    if(contractFile){
      signatureFiles.contract = await getSignatureFile(tenant.id + "/" + contract.id, contract.contract_file_id, contract.id);
    }
    if(additionalFile){
      signatureFiles.additional = await getSignatureFile(tenant.id + "/" + contract.id, contract.aditional_file_id, contract.id);
    }

    deposit.id = uuidv4();
    deposit.amount_paid = deposit.amount_payment
    deposit.payment_method = "Other"
    deposit.contract_id = contract.id
    deposit.is_current = true;
    deposit.status = "Paid"
    deposit.type = "deposit"
    deposit.paidDate = new Date();
    deposit.createdAt = new Date();

    const pastRentsToInsert:Partial<Payment>[] = []
    for(const rent of pastRents){
      if(!rent.amount_paid) return;
      rent.id = uuidv4();
      rent.contract_id = contract.id;
      rent.payment_method = "Other";
      rent.type = "rent";
      rent.amount_payment = rent.amount_paid;
      rent.status = "Paid";
      rent.is_current = false;
      rent.dueDate = new Date(rent.dueDate as Date);
      rent.paidDate = new Date(rent.dueDate as Date);
      rent.createdAt = new Date(Date.now());

      pastRentsToInsert.push(rent)
    }

    const room:Room = await firestoreService.getDocument("rooms", contract.room_id) as Room;
    if(!room){
      return NextResponse.json({ success: false, message:"Room not found"});
    }
    
    const futureRentsToInsert:Partial<Payment>[] = []
    let isCurrent = true;
    
    for(const rent of futureRents){
      rent.id = uuidv4();
      rent.contract_id = contract.id;
      rent.type = "rent";
      rent.amount_payment = room.price;
      rent.status = "Pending";
      rent.is_current = isCurrent;
      rent.dueDate = new Date(rent.dueDate as Date);
      rent.createdAt = new Date();

      isCurrent = false;

      futureRentsToInsert.push(rent)
    }

    const updatedTenant:Partial<Tenant> = {
      current_contract_id: contract.id
    }

    const multipleDocsToInsert: MultipleDoc[] = [
      {
        collection: "tenants",
        docId: tenant.id,
        data: updatedTenant
      },{
        collection: "contracts",
        docId: currentContract.id,
        data: currentContract
      },{
        collection: "contracts",
        docId: contract.id,
        data: contract
      },{
        collection: "payments",
        docId: deposit.id,
        data: deposit
      },
    ]

    //Detect if there is a room change
    if(currentContract.room_id !== contract.room_id){
      const previousRoomToUpdate:Partial<Room> = {
        id: currentContract.room_id,
        available: true
      }
      const currentRoomToUpdate:Partial<Room> = {
        id: contract.room_id,
        available: false
      }

      multipleDocsToInsert.push({
        collection: "rooms",
        data: previousRoomToUpdate,
        docId: currentContract.room_id
      });
      multipleDocsToInsert.push({
        collection: "rooms",
        data: currentRoomToUpdate,
        docId: contract.room_id
      });
    }

    // insert all rents in the transaction
    for(const rent of pastRentsToInsert){
      if(!rent.id) return;

      const r:MultipleDoc = {
        collection:"payments",
        docId: rent.id,
        data: rent,
      }

      multipleDocsToInsert.push(r);
    }
    for(const rent of futureRentsToInsert){
      if(!rent.id) return;

      const r:MultipleDoc = {
        collection:"payments",
        docId: rent.id,
        data: rent,
      }

      multipleDocsToInsert.push(r);
    }

    await firestoreService.setMultipleDocuments(multipleDocsToInsert);
    await firestoreService.deleteMultipleDocuments(multipleDocsToDelete);
    
    return NextResponse.json({ success: true, signatureFiles });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success:false, error: String(error) },
      { status: 500 }
    );
  }
}