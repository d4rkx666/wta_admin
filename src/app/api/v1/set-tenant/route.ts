
import { firestoreService } from '@/lib/services/firestore-service';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { Payment } from '@/types/payment';
import { Room } from '@/types/room';
import { Tenant } from '@/types/tenant';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const { tenant, deposit, rent }: { tenant: Tenant, deposit: Payment, rent: Partial<Payment> } = await req.json();

  try {
    if (tenant.id == "") { // New tenant
      tenant.id = uuidv4();

      // deposit
      deposit.id = uuidv4();
      deposit.tenant_id = tenant.id;
      deposit.payment_method = "E-Transfer";
      deposit.type = "deposit";
      deposit.status = "Pending";
      deposit.is_current = true;
      deposit.createdAt = new Date(Date.now());

      // rent
      rent.id = uuidv4();
      rent.tenant_id = tenant.id;
      rent.payment_method = "E-Transfer";
      rent.type = "rent";
      rent.status = "Pending";
      rent.is_current = true;
      rent.createdAt = new Date(Date.now());

      if(deposit.amount_payment && deposit.amount_payment > 0){
        tenant.has_paid_deposit = true;
        deposit.status = "Paid"
      }
      
      if(rent.amount_payment && rent.amount_payment > 0){
        deposit.status = "Paid"
      }

      const room: Partial<Room> ={
        available: false
      }

      const dataToInsert: MultipleDoc[] = [
        {collection: "tenants", docId: tenant.id, data: tenant},
        {collection: "rooms", docId: tenant.room_id, data: room},
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
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}