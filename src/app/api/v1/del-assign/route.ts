
import { firestoreService } from '@/lib/services/firestore-service';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Payment } from '@/types/payment';

export async function POST(req: Request) {
  const payment:Payment = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {
    
    await firestoreService.deleteDocument("payments", payment.id)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(String(error))
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}