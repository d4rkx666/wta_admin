import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { firestoreService } from '@/lib/services/firestore-service';
import { Payment } from '@/types/payment';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const fee:Payment = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  try {
    const id = uuidv4();
    const newFee:Partial<Payment> = {
      id: id,
      contract_id: fee.contract_id,
      comments: fee.comments,
      type: "fee",
      amount_payment: fee.amount_payment,
      status: "Pending",
      createdAt: new Date(),
      is_current: true,
    }
    
    await firestoreService.setDocument("payments", id, newFee)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success:false, error: String(error) },
      { status: 500 }
    );
  }
}