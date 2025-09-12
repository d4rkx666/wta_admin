
import { getSession } from '@/lib/auth';
import { firestoreService } from '@/lib/services/firestore-service';
import { Bill } from '@/types/bill';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { Payment } from '@/types/payment';
import { Tenant } from '@/types/tenant';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const {bill, tenantsAndPayments, tenantsAndPaymentsSaved}: {bill: Bill, tenantsAndPayments:{tenant: Tenant; payment: Payment }[], tenantsAndPaymentsSaved:{tenant: Tenant; payment: Payment }[]} = await req.json();

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }

  try {
    if (!bill.id) {
      bill.id = uuidv4();
      bill.createdAt = new Date(Date.now());

      //format dates to bill
      bill.issuedDate = new Date(bill.issuedDate.toString());
      bill.dueDate = new Date(bill.dueDate.toString());
      bill.status = bill.balance <= 0.01 ? "Paid" : "Pending"

      const payments:Payment[] = tenantsAndPayments.filter(split => split.payment.amount_payment && split.payment.amount_payment > 0).map(split=>{
        const hasPaid = split.payment.amount_payment === split.payment.amount_paid;

        if(hasPaid){
          // set paid date
          split.payment.paidDate = new Date(split.payment.paidDate as Date);
        }

        split.payment.id = uuidv4();
        split.payment.bill_id = bill.id;
        split.payment.is_current= hasPaid ? false : true;
        split.payment.status = hasPaid ? "Paid" : "Pending";
        split.payment.contract_id = split.tenant.current_contract_id
        split.payment.type="bills";
        split.payment.dueDate = new Date(bill.dueDate as Date);
        split.payment.createdAt = new Date(Date.now());
        return split.payment;
      })

      const dataToInsert: MultipleDoc[] = [
        {collection: "bills", docId: bill.id, data: bill}
      ]

      // add payments to insertion
      for(const p of payments){
        const toInsert = {
          collection: "payments", docId: p.id, data: p
        }
        dataToInsert.push(toInsert);
      }
      
      console.log(dataToInsert)
      await firestoreService.setMultipleDocuments(dataToInsert);
      
    }else{
      const billToUpdate: Partial<Bill> = {
        id: bill.id,
        propertyId: bill.propertyId,
        type: bill.type, 
        issuedDate: new Date(bill.issuedDate as Date),
        dueDate: new Date(bill.dueDate as Date),
        amount: bill.amount,
        balance: bill.balance,
        notes: bill.notes || "",
        status: bill.balance <= 0.01 ? "Paid" : "Pending"
      }

      await firestoreService.setDocument("bills", bill.id, billToUpdate);

      const dataToInsert: MultipleDoc[] = []
      // Updating already saved
      for(const typ of tenantsAndPaymentsSaved ){
        const paymentToUpdate: Partial<Payment> = {
          id: typ.payment.id,
          amount_payment: typ.payment.amount_payment
        }

        dataToInsert.push({
          collection: "payments",
          docId: typ.payment.id,
          data: paymentToUpdate
        })
      }

      // Inserting new ones
      const payments:Payment[] = tenantsAndPayments.filter(split => split.payment.amount_payment && split.payment.amount_payment > 0).map(split=>{
        const hasPaid = split.payment.amount_payment === split.payment.amount_paid;

        if(hasPaid){
          // set paid date
          split.payment.paidDate = new Date(split.payment.paidDate as Date);
        }

        split.payment.id = uuidv4();
        split.payment.bill_id = bill.id;
        split.payment.is_current= hasPaid ? false : true;
        split.payment.status = hasPaid ? "Paid" : "Pending";
        split.payment.contract_id = split.tenant.current_contract_id
        split.payment.type="bills";
        split.payment.dueDate = new Date(bill.dueDate as Date);
        split.payment.createdAt = new Date(Date.now());
        return split.payment;
      })

      // add payments to insertion
      for(const p of payments){
        const toInsert = {
          collection: "payments", docId: p.id, data: p
        }
        dataToInsert.push(toInsert);
      }

      // update multiple documents
      console.log(dataToInsert);
      await firestoreService.setMultipleDocuments(dataToInsert);
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