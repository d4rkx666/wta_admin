
import { firestoreService } from '@/lib/services/firestore-service';
import { Property } from '@/types/property';
import { NextResponse } from 'next/server';
import {POST as delRoom} from "@/app/api/v1/del-room/route"

export async function POST(req: Request) {
  const property: Property = await req.json();

  try {
    if(property.rooms.length > 0){
      await Promise.all(
        property.rooms.map(async room=>{
          const payload = {
            property: property,
            room: room,
          };

          await delete_rooms(req, payload);
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
      ...req,  // Use the original req object, or pass any necessary modifications
      json: async () => dataToSend,  // Mock json() if needed
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