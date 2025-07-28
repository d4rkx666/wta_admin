import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Contract } from '@/types/contract';
import { firestoreService } from '@/lib/services/firestore-service';

export async function POST(req: Request) {
  const contract:Contract = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  try {
    const updatedContract:Partial<Contract> = {
      id: contract.id,
      status: "Permanent",
    }
    
    await firestoreService.setDocument("contracts", contract.id, updatedContract)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success:false, error: String(error) },
      { status: 500 }
    );
  }
}