
import { getSession } from '@/lib/auth';
import { firestoreService } from '@/lib/services/firestore-service';
import { Bill } from '@/types/bill';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { Payment } from '@/types/payment';
import { Tenant } from '@/types/tenant';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const {bill, tenantsAndPayments}: {bill: Bill, tenantsAndPayments:{tenant: Tenant; payment: Payment }[]} = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {
    if (bill.id == "") {
      bill.id = uuidv4();
      bill.createdAt = new Date(Date.now());
    }

    const payments:Payment[] = tenantsAndPayments.map(split=>{
      split.payment.id = uuidv4();
      split.payment.bill_id = bill.id;
      split.payment.is_current=true;
      split.payment.status = "Pending";
      split.payment.tenant_id = split.tenant.id
      split.payment.type="bills";
      split.payment.dueDate = new Date(new Date(new Date().setMonth(new Date().getMonth() + 1))); // one month after
      split.payment.createdAt = new Date(Date.now());
      return split.payment;
    })

    const dataToInsert: MultipleDoc[] = [
      {collection: "bills", docId: bill.id, data: bill}
    ]

    // add payments to insertion
    for(const p of payments){
      const toInsert = {
        collection: "payments", docId: p.id, data: p
      }
      dataToInsert.push(toInsert);
    }
    
    await firestoreService.setMultipleDocuments(dataToInsert);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}