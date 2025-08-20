
import { firestoreService } from '@/lib/services/firestore-service';
import { getAuth } from 'firebase-admin/auth';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { Payment } from '@/types/payment';
import { Room } from '@/types/room';
import { Tenant } from '@/types/tenant';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types/user';
import { getSession } from '@/lib/auth';
import { Contract } from '@/types/contract';
import { insertFile, updateFile } from '@/utils/cloudinaryActions';

export async function POST(req: Request) {
  const formData = await req.formData();

  const tenant = JSON.parse(formData.getAll('tenant')[0] as string) as Tenant;
  const contract = JSON.parse(formData.getAll('contract')[0] as string) as Contract;
  const currentContract = JSON.parse(formData.getAll('currentContract')[0] as string) as Contract;
  const deposit = JSON.parse(formData.getAll('deposit')[0] as string) as Payment;
  const pastRents = JSON.parse(formData.getAll('pastRents')[0] as string) as Payment[];
  const futureRents = JSON.parse(formData.getAll('futureRents')[0] as string) as Payment[];
  const contractFile = formData.getAll('contractFile')[0] as File
  const idFile = formData.getAll('idFile')[0] as File

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  let userIdRollback = "";
  try {

    if (!tenant.id) { // New tenant

      // Create User
      const userRecord = await getAuth().createUser({
        email:tenant.email,
        password: tenant.email,
        displayName: tenant.name,
      });

      const userId = userRecord.uid;
      tenant.id = userId; // asign same id to tenant
      userIdRollback = userId; // asigns to rollback in case the insertion fails 

      // Verify dates & setup Contract
      contract.id = uuidv4();
      contract.tenant_id = tenant.id;
      contract.lease_start = new Date(contract.lease_start as Date);
      contract.lease_end = new Date(contract.lease_end as Date);
      contract.status = "Active";
      contract.is_current = true;
      contract.createdAt = new Date();

      // 1- setup user
      const user: User = {
        id: userId,
        email: tenant.email,
        name: tenant.name,
        role: "user",
        isActive: true,
        firstTime: true,
        createdAt: new Date(Date.now()),
      }
      tenant.current_contract_id = contract.id;
      tenant.createdAt = new Date();
      
      // 2- setup deposit
      deposit.id = uuidv4();
      deposit.contract_id = contract.id;
      deposit.payment_method = "Other";
      deposit.type = "deposit";
      deposit.status = "Paid";
      deposit.amount_paid = deposit.amount_payment;
      deposit.paidDate = new Date(deposit.paidDate as Date);
      deposit.is_current = true;
      deposit.createdAt = new Date(Date.now());
      
      // mark deposit paid
      tenant.has_paid_deposit = true;

      // 3- setup past rents
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

      // 4- Get room to get price:
      const room:Room = await firestoreService.getDocument("rooms", contract.room_id) as Room;
      if(!room){
        return NextResponse.json({ success: false, message:"Room not found"});
      }
      
      // 5- Create future rents depending on the month
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

      // update room to available false
      const roomToUpdate: Partial<Room> ={
        available: false,
        date_availability: contract.lease_end
      }
      
      // INSERT FILES IF EXISTS
      if(contractFile){
        const public_id = await insertFile(contractFile, tenant.current_contract_id, true)
        if(public_id){
          contract.contract_file_id = public_id; // insert the public_id
        }
      }
      if(idFile){
        const public_id = await insertFile(idFile, tenant.current_contract_id, true);
        if(public_id){
          tenant.identification_file_id = public_id; // insert the public_id
        }
      }

      const dataToInsert: MultipleDoc[] = [
        {collection: "users", docId: user.id, data: user},
        {collection: "tenants", docId: tenant.id, data: tenant},
        {collection: "contracts", docId: contract.id, data: contract},
        {collection: "rooms", docId: contract.room_id, data: roomToUpdate},
        {collection: "payments", docId: deposit.id, data: deposit},
      ]

      
      // insert all past rents in the transaction
      for(const rent of pastRentsToInsert){
        if(!rent.id) return;

        const r:MultipleDoc = {
          collection:"payments",
          docId: rent.id,
          data: rent,
        }

        dataToInsert.push(r);
      }

      // insert all rents in the transaction
      for(const rent of futureRentsToInsert){
        if(!rent.id) return;

        const r:MultipleDoc = {
          collection:"payments",
          docId: rent.id,
          data: rent,
        }

        dataToInsert.push(r);
      }
      console.log(dataToInsert)
      await firestoreService.setMultipleDocuments(dataToInsert);
    }else{ // update tenant
      const tenantToUpdate: Partial<Tenant> = {id:tenant.id, name: tenant.name, email: tenant.email, phone: tenant.phone, couple_name: tenant.couple_name};
      const contractToUpdate: Partial<Contract> = {id: currentContract.id}

      if(contractFile){
        if(contract.contract_file_id){
          await updateFile(contractFile, contract.contract_file_id, true)
        }else{
          const public_id = await insertFile(contractFile, tenant.current_contract_id, true)

          if(public_id){
            contractToUpdate.contract_file_id = public_id; // insert the public_id
          }
        }
      }
      if(idFile){
        if(tenant.identification_file_id){
          await updateFile(idFile, tenant.identification_file_id, true)
        }else{
          const public_id = await insertFile(idFile, tenant.current_contract_id, true)

          if(public_id){
            tenantToUpdate.identification_file_id = public_id; // insert the public_id
          }
        }
      }
      await firestoreService.setDocument("tenants", tenant.id, tenantToUpdate);
      await firestoreService.setDocument("contracts", currentContract.id, contractToUpdate);
    }

    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if(userIdRollback !== ""){
      await getAuth().deleteUser(userIdRollback)
    }
    return NextResponse.json(
      { success:false, error: String(error) },
      { status: 500 }
    );
  }
}