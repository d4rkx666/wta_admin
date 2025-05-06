
import { firestoreService } from '@/lib/services/firestore-service';
import { Room } from '@/types/room';
import { NextResponse } from 'next/server';
import { Property } from '@/types/property';
import { delete_img } from '@/utils/imgurActions';

export async function POST(req: Request) {
  const { property, room }: {property: Property, room: Room} = await req.json();

  try {

    if(room.images.length > 0){
      await Promise.all(
        room.images.map(async img => {
          const resp = await delete_img(img.id);
          console.log("deleted: ",resp)
        })
      );
    }

    const deleted_room = property.rooms.filter((item) => item.id !== room.id);
    
    await firestoreService.updateDocument("properties", property.id, "rooms", deleted_room)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(String(error))
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}