
import { firestoreService } from '@/lib/services/firestore-service';
import { Room } from '@/types/room';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const formData = await req.formData();

  const roomString = formData.getAll('room')[0] as string;
  const images = formData.getAll('images[]');
  const propertyId = formData.getAll('propertyId')[0] as string;
  const room: Room = JSON.parse(roomString);


  //const { data, images}: { data: Room, images:ImageItem[] } = await req.json();

  try {
    if (room.id == "") {
      room.id = uuidv4();
    }

    const uploadResults = await Promise.all(
      images.map(async (file, index) => {
        const imgurFormData = new FormData();
        imgurFormData.append('image', file);

        const imgurResponse = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
          },
          body: imgurFormData,
        });

        const data = await imgurResponse.json();

        return {
          id: data.data.deletehash,
          url: data.data.link,
        };
      })
    );

    console.log(uploadResults)

    room.images = uploadResults;
    await firestoreService.upsertData("properties", propertyId, "rooms", room, room.id)
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}