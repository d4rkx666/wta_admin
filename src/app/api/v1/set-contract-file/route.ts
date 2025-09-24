import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Contract } from '@/types/contract';
import { firestoreService } from '@/lib/services/firestore-service';

export async function POST(req: Request) {
  const contract:Partial<Contract> = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  try {
    if(contract.id && contract.contract_file_id){
      await firestoreService.updateDocument("contracts", contract.id, "contract_file_id", contract.contract_file_id)
      return NextResponse.json({ success: true });
    }else{
      return NextResponse.json({ success: false });
    }
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success:false, error: String(error) },
      { status: 500 }
    );
  }
}