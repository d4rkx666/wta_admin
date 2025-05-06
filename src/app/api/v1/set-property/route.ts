
import { firestoreService } from '@/lib/services/firestore-service';
import { Property } from '@/types/property';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const data: Property = await req.json();

  try {
    // eslint-disable-next-line
    let { rooms, ...propertyWithoutRooms } = data;
    if (data.id == "") {
      data.id = uuidv4();
      propertyWithoutRooms = data
    }
    
    await firestoreService.setDocument("properties", data.id, propertyWithoutRooms)
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}