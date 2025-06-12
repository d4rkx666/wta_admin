
import { firestoreService } from '@/lib/services/firestore-service';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Bill } from '@/types/bill';

export async function POST(req: Request) {
  const bill:Bill = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {
    
    await firestoreService.deleteDocument("bills", bill.id)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(String(error))
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}