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

    const proofUrl:string[] = [];

    if(payment.proof_img_id && Array.isArray(payment.proof_img_id) && payment.proof_img_id.length > 0){
      for(const img of payment.proof_img_id){
        const proof = await getCloudinaryUrl(img, false);
        proofUrl.push(proof);
      }
    }

    return NextResponse.json({ success:true, proofUrl });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ success:false });
  }
}