
import { firestoreService } from '@/lib/services/firestore-service';
import { getAuth } from 'firebase-admin/auth';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { Payment } from '@/types/payment';
import { Room } from '@/types/room';
import { Tenant } from '@/types/tenant';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types/user';
import { getSession } from '@/lib/auth';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const formData = await req.formData();

  const tenant = JSON.parse(formData.getAll('tenant')[0] as string) as Tenant;
  const deposit = JSON.parse(formData.getAll('deposit')[0] as string) as Payment;
  const pastRents = JSON.parse(formData.getAll('pastRents')[0] as string) as Payment[];
  const futureRents = JSON.parse(formData.getAll('futureRents')[0] as string) as Payment[];
  const contractFile = formData.getAll('contractFile')[0] as File
  const idFile = formData.getAll('idFile')[0] as File

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  let userIdRollback = "";
  try {

    if (!tenant.id) { // New tenant

      // Create User
      const userRecord = await getAuth().createUser({
        email:tenant.email,
        password: tenant.email,
        displayName: tenant.name,
      });

      const userId = userRecord.uid;
      tenant.id = userId; // asign same id to tenant
      userIdRollback = userId; // asigns to rollback in case the insertion fails 

      // Verify dates
      tenant.lease_start = new Date(tenant.lease_start as Date);
      tenant.lease_end = new Date(tenant.lease_end as Date);
      tenant.createdAt = new Date();

      // 1- setup user
      const user: User = {
        id: userId,
        email: tenant.email,
        name: tenant.name,
        role: "user",
        isActive: true,
        firstTime: true,
        createdAt: new Date(Date.now()),
      }
      
      // 2- setup deposit
      deposit.id = uuidv4();
      deposit.tenant_id = tenant.id;
      deposit.payment_method = "Other";
      deposit.type = "deposit";
      deposit.status = "Paid";
      deposit.amount_paid = deposit.amount_payment;
      deposit.paidDate = new Date(deposit.paidDate as Date);
      deposit.is_current = true;
      deposit.createdAt = new Date(Date.now());
      
      // mark deposit paid
      tenant.has_paid_deposit = true;

      // 3- setup past rents
      const pastRentsToInsert:Partial<Payment>[] = []
      for(const rent of pastRents){
        if(!rent.amount_paid) return;
        rent.id = uuidv4();
        rent.tenant_id = tenant.id;
        rent.payment_method = "Other";
        rent.type = "rent";
        rent.amount_payment = rent.amount_paid;
        rent.status = "Paid";
        rent.is_current = false;
        rent.dueDate = new Date(rent.dueDate as Date);
        rent.paidDate = new Date(rent.dueDate as Date);
        rent.createdAt = new Date(Date.now());

        pastRentsToInsert.push(rent)
      }

      // 4- Get room to get price:
      const room:Room = await firestoreService.getDocument("rooms", tenant.room_id) as Room;
      if(!room){
        return NextResponse.json({ success: false, message:"Room not found"});
      }
      
      // 5- Create future rents depending on the month
      const futureRentsToInsert:Partial<Payment>[] = []
      let isCurrent = true;
      
      for(const rent of futureRents){
        rent.id = uuidv4();
        rent.tenant_id = tenant.id;
        rent.type = "rent";
        rent.amount_payment = room.price;
        rent.status = "Pending";
        rent.is_current = isCurrent;
        rent.dueDate = new Date(rent.dueDate as Date);
        rent.createdAt = new Date();

        isCurrent = false;

        futureRentsToInsert.push(rent)
      }

      // update room to available false
      const roomToUpdate: Partial<Room> ={
        available: false,
        date_availability: tenant.lease_end
      }
      
      // INSERT FILES IF EXISTS
      if(contractFile){
        const public_id = await insertFile(contractFile, tenant.id, true)
        if(public_id){
          tenant.contract_file_id = public_id; // insert the public_id
        }
      }
      if(idFile){
        const public_id = await insertFile(idFile, tenant.id, false);
        if(public_id){
          tenant.identification_file_id = public_id; // insert the public_id
        }
      }

      const dataToInsert: MultipleDoc[] = [
        {collection: "users", docId: user.id, data: user},
        {collection: "tenants", docId: tenant.id, data: tenant},
        {collection: "rooms", docId: tenant.room_id, data: roomToUpdate},
        {collection: "payments", docId: deposit.id, data: deposit},
      ]

      
      // insert all past rents in the transaction
      for(const rent of pastRentsToInsert){
        if(!rent.id) return;

        const r:MultipleDoc = {
          collection:"payments",
          docId: rent.id,
          data: rent,
        }

        dataToInsert.push(r);
      }

      // insert all rents in the transaction
      for(const rent of futureRentsToInsert){
        if(!rent.id) return;

        const r:MultipleDoc = {
          collection:"payments",
          docId: rent.id,
          data: rent,
        }

        dataToInsert.push(r);
      }
      console.log(dataToInsert)
      await firestoreService.setMultipleDocuments(dataToInsert);
    }else{ // update tenant
      const tenantToUpdate: Partial<Tenant> = {id:tenant.id, name: tenant.name, email: tenant.email, phone: tenant.phone, couple_name: tenant.couple_name};

      if(contractFile){
        if(tenant.contract_file_id){
          await updateFile(contractFile, tenant.contract_file_id, true)
        }else{
          const public_id = await insertFile(contractFile, tenant.id, true)

          if(public_id){
            tenantToUpdate.contract_file_id = public_id; // insert the public_id
          }
        }
      }
      if(idFile){
        if(tenant.identification_file_id){
          await updateFile(idFile, tenant.identification_file_id, false)
        }else{
          const public_id = await insertFile(idFile, tenant.id, false)

          if(public_id){
            tenantToUpdate.identification_file_id = public_id; // insert the public_id
          }
        }
      }

      await firestoreService.setDocument("tenants", tenant.id, tenantToUpdate);
    }

    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    await getAuth().deleteUser(userIdRollback)
    return NextResponse.json(
      { success:false, error: String(error) },
      { status: 500 }
    );
  }
}


async function insertFile(file:File, folder_idTenant: string, pdf:boolean):Promise<string | null>{
try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stream_setup: UploadApiOptions = {
      folder: folder_idTenant,
      resource_type: 'image',
      type: 'private',
    }

    if(pdf){
      stream_setup.resource_type = "raw"
      stream_setup.format = "pdf"
    }

    // eslint-disable-next-line
    const resp:any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream( stream_setup,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    if(!resp.public_id){
      return null;
    }
    console.log('Created successful:', resp);
    return resp.public_id;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function updateFile(file: File, publicId: string, isPdf: boolean) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadOptions: UploadApiOptions = {
      public_id: publicId,
      resource_type: isPdf ? 'raw' : 'image',
      type: 'private',
      overwrite: true,
      invalidate: true,
      ...(isPdf && { format: 'pdf' })
    };

    // eslint-disable-next-line
    const resp:any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    console.log('Update successful:', resp);
    return resp.public_id;
  } catch (error) {
    console.error('Update failed:', error);
    return false;
  }
}