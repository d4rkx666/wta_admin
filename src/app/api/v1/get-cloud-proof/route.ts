import { getSession } from '@/lib/auth';
import { Payment } from '@/types/payment';
import { getCloudinaryUrl } from '@/utils/cloudinaryActions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {

  const payment:Payment = await request.json();

  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {

    let proofUrl = "";

    if(payment.proof_img_id){
      proofUrl = await getCloudinaryUrl(payment.proof_img_id, false);
    }

    return NextResponse.json({ success:true, proofUrl });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success:false });
  }
}