
import { getSession } from '@/lib/auth';
import { firestoreService } from '@/lib/services/firestore-service';
import { Contract } from '@/types/contract';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { Payment } from '@/types/payment';
import { Room } from '@/types/room';
import { Tenant } from '@/types/tenant';
import { deleteMultiCloudinaryFiles } from '@/utils/cloudinaryActions';
import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const tenant:Tenant = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {
    
    const dataToInsert: MultipleDoc[] = [
      {collection: "tenants", docId: tenant.id, data: tenant}
    ]

    const filesToDelete:string[] = []

    // Adding user to delete
    dataToInsert.push({
      collection: "users",
      docId: tenant.id,
      data: tenant
    })

    if(tenant.identification_file_id){
      filesToDelete.push(tenant.identification_file_id)
    }

    // Get all the tenant's contracts
    const contracts:Contract[] = await firestoreService.getDocuments("contracts", "tenant_id", tenant.id);

    // Loop contracts to find payments
    if(contracts.length > 0){
      for(const c of contracts){

        // Get payments of a contract
        const payments:Payment[] = await firestoreService.getDocuments("payments", "contract_id", c.id);
        if(payments.length > 0){
          for(const p of payments){

            // Adding data to delete
            dataToInsert.push({
              collection: "payments",
              docId: p.id,
              data: p
            })

            if(p.proof_img_id && Array.isArray(p.proof_img_id) && p.proof_img_id.length > 0){
              for(const proof of p.proof_img_id)
              filesToDelete.push(proof)
            }
          }
        }

        // Adding data to delete
        dataToInsert.push({
          collection: "contracts",
          docId: c.id,
          data: c
        })

        if(c.contract_file_id){
          filesToDelete.push(c.contract_file_id)
        }
      }
    }

    
    const currentContract = await firestoreService.getDocument("contracts", tenant.current_contract_id) as Contract
    const changeRoom: Partial<Room> = {
      available: true,
    }

    // Deleting multiple data
    await firestoreService.deleteMultipleDocuments(dataToInsert)

    // Room available
    await firestoreService.setDocument("rooms", currentContract.room_id, changeRoom)

    // Deleting user auth
    await getAuth().deleteUser(tenant.id)

    // Delete files from cloudinary
    if(filesToDelete.length > 0){
      await deleteMultiCloudinaryFiles(tenant.id)
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}