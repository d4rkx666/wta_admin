
import { firestoreService } from '@/lib/services/firestore-service';
import { Property } from '@/types/property';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const { data } : {data: Property} = await req.json();

  try {
   if(data.id == ""){
      data.id = uuidv4();
   }
   await firestoreService.setDocument("properties", data.id, data)
   return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}