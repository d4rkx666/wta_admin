
import { getSession } from '@/lib/auth';
import { firestoreService } from '@/lib/services/firestore-service';
import { Tenant } from '@/types/tenant';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const tenant:Tenant = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {
    await firestoreService.deleteDocument("properties", tenant.id)
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}