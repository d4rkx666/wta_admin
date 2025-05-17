
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

export async function POST(req: Request) {
  const { tenant, deposit, rent }: { tenant: Tenant, deposit: Payment, rent: Partial<Payment> } = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  let userIdRollback = "";
  try {
    if (tenant.id == "") { // New tenant

      // Create User
      const userRecord = await getAuth().createUser({
        email:tenant.email,
        password: tenant.email,
        displayName: tenant.name,
      });

      const userId = userRecord.uid;
      tenant.id = userId; // asign same id to tenant
      userIdRollback = userId; // asigns to rollback in case the insertion fails 

      // user
      const user: User = {
        id: userId,
        email: tenant.email,
        name: tenant.name,
        role: "user",
        isActive: true,
        firstTime: true,
        createdAt: new Date(Date.now()),
      }

      // deposit
      deposit.id = uuidv4();
      deposit.tenant_id = tenant.id;
      deposit.payment_method = "E-Transfer";
      deposit.type = "deposit";
      deposit.status = "Pending";
      deposit.is_current = true;
      deposit.createdAt = new Date(Date.now());


      // get room to get price:
      const room:Room = await firestoreService.getDocument("rooms", tenant.room_id) as Room;
      if(!room){
        return NextResponse.json({ success: true, message:"Room not found"});
      }

      // rent
      rent.id = uuidv4();
      rent.tenant_id = tenant.id;
      rent.payment_method = "E-Transfer";
      rent.amount_payment = room.price;
      rent.type = "rent";
      rent.status = "Pending";
      rent.is_current = true;
      rent.createdAt = new Date(Date.now());
      rent.dueDate = new Date(new Date(new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth() + 1, 0)); // get the last day of this month

      if(deposit.amount_payment && deposit.amount_payment > 0){
        tenant.has_paid_deposit = true;
        deposit.status = "Paid";
        deposit.amount_paid = deposit.amount_payment;
        deposit.paidDate = new Date(Date.now());
      }
      
      if(rent.amount_paid && rent.amount_paid > 0){
        rent.status = "Paid"
        rent.amount_paid = rent.amount_paid;
        rent.paidDate = new Date(Date.now());
      }

      const roomToUpdate: Partial<Room> ={
        available: false
      }

      const dataToInsert: MultipleDoc[] = [
        {collection: "users", docId: user.id, data: user},
        {collection: "tenants", docId: tenant.id, data: tenant},
        {collection: "rooms", docId: tenant.room_id, data: roomToUpdate},
        {collection: "payments", docId: deposit.id, data: deposit},
        {collection: "payments", docId: rent.id, data: rent},
      ]
      
      await firestoreService.setMultipleDocuments(dataToInsert);
    }else{ // update tenant
      const tenantToUpdate: Partial<Tenant> = {id:tenant.id, name: tenant.name, email: tenant.email, phone: tenant.phone, couple_name: tenant.couple_name};
      await firestoreService.setDocument("tenants", tenant.id, tenantToUpdate);
    }

    
    return NextResponse.json({ success: true });
  } catch (error) {
    await getAuth().deleteUser(userIdRollback)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}