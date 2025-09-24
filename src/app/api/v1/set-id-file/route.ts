import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { firestoreService } from '@/lib/services/firestore-service';
import { Tenant } from '@/types/tenant';

export async function POST(req: Request) {
  const tenant:Partial<Tenant> = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  try {
    if(tenant.id && tenant.identification_file_id){
      await firestoreService.updateDocument("tenants", tenant.id, "identification_file_id", tenant.identification_file_id)
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