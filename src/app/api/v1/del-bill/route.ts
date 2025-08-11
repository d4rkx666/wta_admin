
import { firestoreService } from '@/lib/services/firestore-service';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { Bill } from '@/types/bill';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { Payment } from '@/types/payment';

export async function POST(req: Request) {
  const bill:Bill = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {
    // get all payments linked to the bill
    const payments = await firestoreService.getDocuments("payments", "bill_id", bill.id) as Payment[]
    
    const multipleDocs:MultipleDoc[] = [{
      collection:"bills",
      data: bill,
      docId: bill.id
    }];

    for(const p of payments){
      multipleDocs.push({
        collection: "payments",
        data: p,
        docId: p.id
      })
    }

    console.log(multipleDocs)
    await firestoreService.deleteMultipleDocuments(multipleDocs)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(String(error))
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}