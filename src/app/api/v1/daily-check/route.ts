import { firestoreService } from '@/lib/services/firestore-service';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { Payment } from '@/types/payment';
import { Room } from '@/types/room';
import { Tenant } from '@/types/tenant';
import { Timestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {

  try {
    console.log("running daily tenants lease end & current payments check")

    // update tenant's room to available when its lease ends
    await updateRoomsTaken();

    // update payments to set is_current one month before the due date
    await setCurrentPayments()


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: error });
  }
}

async function setCurrentPayments(){
  const payments = await firestoreService.getCollection("payments") as Payment[];

  const paymentsToUpdate:Partial<Payment>[] = []; 

  payments.map(payment=>{
    if(!payment.dueDate) return;
    if(!payment.is_current){
      const paymentMonth = (payment.dueDate as Timestamp).toDate().getUTCMonth() + 1; // since january is 0, +1 is added
      const currentMonth = new Date().getUTCMonth() + 1; // since january is 0, +1 is added
      
      /*  Checking if we have a payment next month
          E.g Today is May, and the dueDate of this payment is Jun 1st, so we gonna set it a current payment one month before.

          (payment month = 5, today month = 4)
          if (5 - 1 ) is equal to 4
      */
      if((paymentMonth - 1) === currentMonth){
        const p:Partial<Payment> = {
          id: payment.id,
          is_current: true,
        }

        paymentsToUpdate.push(p);
      }
    }

    const dataToInsert: MultipleDoc[] = [];
    for(const p of paymentsToUpdate){
      if(!p.id) return;

      dataToInsert.push({
        collection: "payments",
        docId: p.id,
        data: p
      })
    }

    // insert all data
    if (dataToInsert.length > 0) {
      firestoreService.setMultipleDocuments(dataToInsert)
    }
    
  })
}

async function updateRoomsTaken() {
  const tenants = await firestoreService.getCollection("tenants") as Tenant[];
  const rooms = await firestoreService.getCollection("rooms") as Room[];

  const roomsToUpdate: Room[] = []

  tenants.map(tenant => {
    if (new Date() >= new Date(tenant.lease_end)) { //check if lease has ended
      const roomUpdate = rooms.find(room => tenant.room_id === room.id); // find room
      if (roomUpdate) {
        roomsToUpdate.push(roomUpdate); // push room to update
      }
    }
  })

  const dataToInsert: MultipleDoc[] = []
  for (const room of roomsToUpdate) {
    const roomToInsert: Partial<Room> = {
      id: room.id,
      available: true,
    }
    dataToInsert.push({
      collection: "rooms",
      docId: room.id,
      data: roomToInsert
    })
  }

  // insert all data
  if (dataToInsert.length > 0) {
    firestoreService.setMultipleDocuments(dataToInsert)
  }
}