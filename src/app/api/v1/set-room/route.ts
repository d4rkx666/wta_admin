
import { firestoreService } from '@/lib/services/firestore-service';
import { Room } from '@/types/room';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { toTimestamp } from '@/utils/toTimestamp';
import { ImageItem } from '@/types/imageItem';
import { delete_img, insert_img } from '@/utils/imgurActions';

export async function POST(req: Request) {
  const formData = await req.formData();

  const roomString = formData.getAll('room')[0] as string;
  const images = formData.getAll('images[]');
  const images_ids = formData.getAll('img[]');
  const room: Room = JSON.parse(roomString);


  //const { data, images}: { data: Room, images:ImageItem[] } = await req.json();

  try {
    if (room.id == "") {
      room.id = uuidv4();
    }

    const array_images_to_insert: { id: string, url: string }[] = [];
    // Check if is there a default Thumbnail
    let isThumbnail = false;

    await Promise.all(
      images.map(async (file, index) => {
        // Decode IMG ID
        const img_id: ImageItem = JSON.parse(images_ids[index] as string)

        // Created new form data to save unexistent images
        const imgurFormData = new FormData();

        if (img_id.isExisting && !img_id.isMarkedForDeletion) { //Only modifies ORDER
          const i: { id: string, url: string } = { id: img_id.id, url: img_id.url } // Only add id and url
          array_images_to_insert.push(i)
        } if (img_id.isMarkedForDeletion) { // DELETE IMG from SERVER and not push into adding array
          console.log("deleting,", img_id.id)
          await delete_img(img_id.id);
        }else if(!img_id.isExisting){ // Adding new image into the server and pushing new array
          console.log("inserting,")
          imgurFormData.append('image', file);
          const resp = await insert_img(imgurFormData)
          console.log("inserted",resp)
          const i: { id: string, url: string } = { id: resp.data.deletehash, url: resp.data.link } // Only add id and url
          array_images_to_insert.push(i)
        }


        // Set Thumbnail without setting for a deleted img
        if (img_id.isThumbnail) {
          room.thumbnail = array_images_to_insert[array_images_to_insert.length - 1].url;
          isThumbnail = true;
        }
      })
    );

    room.images = array_images_to_insert;

    
    // Set thumbnail in case user didn't set default
    if (!isThumbnail) {
      room.thumbnail = room.images[0].url;
    }

    // Fix timestamp
    room.date_availability = toTimestamp(room.date_availability)

    console.log(room)
    //await firestoreService.upsertData("properties", propertyId, "rooms", room, room.id)
    await firestoreService.setDocument("rooms",room.id, room)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(String(error))
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}