import { getSession } from '@/lib/auth';
import { Tenant } from '@/types/tenant';
import { getCloudinaryUrl } from '@/utils/cloudinaryActions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {

  const tenant:Tenant = await request.json();

  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {

    let contractUrl = "";
    let idUrl = "";

    if(tenant.contract_file_id){
      contractUrl = await getCloudinaryUrl(tenant.contract_file_id, true);
    }

    if(tenant.identification_file_id){
      idUrl = await getCloudinaryUrl(tenant.identification_file_id, false);
    }

    return NextResponse.json({ success:true, contractUrl, idUrl });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success:false });
  }
}