
import { firestoreService } from '@/lib/services/firestore-service';
import { Property } from '@/types/property';
import { NextResponse } from 'next/server';
import {POST as delRoom} from "@/app/api/v1/del-room/route"
import { Room } from '@/types/room';

export async function POST(req: Request) {
  const {property, rooms}: {property: Property, rooms: Room[]} = await req.json();

  try {
    if(rooms.length > 0){
      await Promise.all(
        rooms.map(async room=>{
          await delete_rooms(req, room);
        })
      );
    }
    
    await firestoreService.deleteDocument("properties", property.id)
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}


async function delete_rooms(req: Request, dataToSend: object){

  try {
    // Directly call the target API's POST handler
    const response = await delRoom({
      ...req,
      json: async () => dataToSend, 
    });

    // Handle the response from the target API
    const responseData = await response.json();
    
    return responseData;
    
  } catch (error) {
    console.error('Error calling target API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to call target API' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

}