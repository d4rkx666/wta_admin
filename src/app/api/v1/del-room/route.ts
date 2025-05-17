
import { firestoreService } from '@/lib/services/firestore-service';
import { Room } from '@/types/room';
import { NextResponse } from 'next/server';
import { delete_img } from '@/utils/imgurActions';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const room:Room = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {

    if(room.images.length > 0){
      await Promise.all(
        room.images.map(async img => {
          const resp = await delete_img(img.id);
          console.log("deleted: ",resp)
        })
      );
    }
    
    await firestoreService.deleteDocument("rooms", room.id)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(String(error))
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}