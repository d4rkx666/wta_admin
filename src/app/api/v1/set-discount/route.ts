
import { getSession } from '@/lib/auth';
import { firestoreService } from '@/lib/services/firestore-service';
import { Payment } from '@/types/payment';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const payment:Payment = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {

    if(payment.id && payment.amount_discount){
      await firestoreService.updateDocument("payments",payment.id, "amount_discount", payment.amount_discount);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}