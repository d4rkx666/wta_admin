
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
import { getSignatureFile } from '@/utils/cloudinaryActions';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  const formData = await req.formData();

  const tenant = JSON.parse(formData.getAll('tenant')[0] as string) as Tenant;
  const contract = JSON.parse(formData.getAll('contract')[0] as string) as Contract;
  const currentContract = JSON.parse(formData.getAll('currentContract')[0] as string) as Contract;
  const modifiedLeaseEnd = JSON.parse(formData.getAll('modifiedLeaseEnd')[0] as string) as Date;
  const deposit = JSON.parse(formData.getAll('deposit')[0] as string) as Payment;
  const pastRents = JSON.parse(formData.getAll('pastRents')[0] as string) as Payment[];
  const futureRents = JSON.parse(formData.getAll('futureRents')[0] as string) as Payment[];
  const contractFile = formData.getAll('contractFile')[0] as string
  const idFile = formData.getAll('idFile')[0] as string
  const additionalFile = formData.getAll('additionalFile')[0] as string

  // Check auth
  if(!await getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  let userIdRollback = "";
  try {
    
    const signatureFiles = {contract: {}, id: {}, additional: {}};

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
        signatureFiles.contract = await getSignatureFile(tenant.id + "/" + contract.id, contract.contract_file_id, contract.id);
      }
      if(idFile){
        signatureFiles.id = await getSignatureFile(tenant.id, tenant.identification_file_id, tenant.id);
      }
      if(additionalFile){
        signatureFiles.additional = await getSignatureFile(tenant.id + "/" + contract.id, contract.aditional_file_id, contract.id);
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

      if(modifiedLeaseEnd){
        const c = await firestoreService.getDocument("contracts", currentContract.id) as Contract;
        const current = (c.lease_end as Timestamp).toDate();
        const modified = new Date(modifiedLeaseEnd);

        const currentMonth = current.getMonth();
        const modifiedMonth = modified.getUTCMonth();

        const currentYear = current.getFullYear();
        const modifiedYear = modified.getFullYear();

        if (currentYear === modifiedYear && currentMonth === modifiedMonth) {
          console.log("do nothing")
        }else if (modifiedYear < currentYear || (currentYear === modifiedYear && modifiedMonth < currentMonth)) {
          // delete future rents
          const allRents = await firestoreService.getDocumentsBy("payments", "contract_id", currentContract.id) as Payment[];
          const rentsToDelete:MultipleDoc[] = allRents.filter(r => r.type === "rent" && r.status === "Pending").filter(r => {
            const dueDate = (r.dueDate as Timestamp).toDate();
            const dueDateMonth = dueDate.getMonth();
            const dueDateYear = dueDate.getFullYear();

            if(dueDateYear > modifiedYear || (dueDateYear === modifiedYear && dueDateMonth > modifiedMonth)){
              return true;
            }
            return false;
          }).map(r => {
            return {
              collection: "payments",
              data: r,
              docId: r.id
            }
          })

          console.log("deleting ", rentsToDelete)

          await firestoreService.deleteMultipleDocuments(rentsToDelete);
          await firestoreService.updateDocument("contracts", currentContract.id, "lease_end", modified);
        } else {
          const newRents: MultipleDoc[] = [];
          const currentRoom = await firestoreService.getDocument("rooms", currentContract.room_id) as Room;
          let addCurrentYear = currentYear;
          let addCurrentMonth = currentMonth + 1; // skip current one
          while (addCurrentYear < modifiedYear || (addCurrentYear === modifiedYear && addCurrentMonth <= modifiedMonth)) {
            const idRent = uuidv4();
            const newRent: Partial<Payment> = {
              id: idRent,
              contract_id: currentContract.id,
              type: "rent",
              amount_payment: currentRoom.price,
              status: "Pending",
              is_current: false,
              createdAt: new Date(),
              dueDate: new Date(addCurrentYear, addCurrentMonth, 1),
            }

            newRents.push({
              collection: "payments",
              data: newRent,
              docId: idRent
            })

            if (addCurrentMonth === 11) {
              addCurrentMonth = 0;
              addCurrentYear++;
            } else {
              addCurrentMonth++;
            }
          }

          console.log(newRents)
          await firestoreService.setMultipleDocuments(newRents);
          await firestoreService.updateDocument("contracts", currentContract.id, "lease_end", modified);
        }
      }

      if(contractFile){
        signatureFiles.contract = await getSignatureFile(tenant.id + "/" + tenant.current_contract_id, currentContract.contract_file_id, tenant.current_contract_id);
      }
      if(idFile){
        signatureFiles.id = await getSignatureFile(tenant.id, tenant.identification_file_id, tenant.id);
      }
      if(additionalFile){
        signatureFiles.additional = await getSignatureFile(tenant.id + "/" + tenant.current_contract_id, currentContract.aditional_file_id, tenant.current_contract_id);
      }
      await firestoreService.setDocument("tenants", tenant.id, tenantToUpdate);
    }

    
    return NextResponse.json({ success: true, signatureFiles});
  } catch (error) {
    console.error(error);
    if(userIdRollback !== ""){
      await getAuth().deleteUser(userIdRollback)
    }
    return NextResponse.json(
      { success:false, message: String(error) },
      { status: 500 }
    );
  }
}