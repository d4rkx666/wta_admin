import { getSession } from '@/lib/auth';
import { Tenant } from '@/types/tenant';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {

  const tenant:Tenant = await request.json();

  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {

    let contractUrl = "";
    let idUrl = "";

    if(tenant.contract_file_id){
      contractUrl = cloudinary.url(tenant.contract_file_id, {
        secure: true,
        sign_url: true,
        type: 'private',
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1-hour expiry
        resource_type: 'raw',
      });
    }

    if(tenant.identification_file_id){
      idUrl = cloudinary.url(tenant.identification_file_id, {
        secure: true,
        sign_url: true,
        type: 'private',
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1-hour expiry
        resource_type: "image",
      });
    }

    return NextResponse.json({ success:true, contractUrl, idUrl });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success:false });
  }
}