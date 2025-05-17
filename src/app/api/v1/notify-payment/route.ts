
import { getSession } from '@/lib/auth';
import { firestoreService } from '@/lib/services/firestore-service';
import { Bill } from '@/types/bill';
import { Payment } from '@/types/payment';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const payment:Payment = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {

    if(payment.id){
      // detect if it's bill
      if(payment.bill_id){
        const bill: Bill = await firestoreService.getDocument("bills", payment.bill_id) as Bill;
        const newBalance = bill.balance - payment.amount_paid
        await firestoreService.updateDocument("bills",payment.bill_id,"balance", newBalance);
      }
      // Inserting individually because we want to ONLY UPDATE, not insert in case payment.id is changed to another uniexistent one
      await firestoreService.updateDocument("payments",payment.id,"paymentVerifiedDate", new Date(Date.now()));
      await firestoreService.updateDocument("payments",payment.id,"status", "Paid");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false});
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}