import { Tenant } from '@/types/tenant';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { Contract } from '@/types/contract';
import { firestoreService } from '@/lib/services/firestore-service';
import { Payment } from '@/types/payment';
import { MultipleDoc } from '@/types/multipleDocsToInsert';
import { getSignatureFile } from '@/utils/cloudinaryActions';

export async function POST(req: Request) {
  const formData = await req.formData();

  const contract = JSON.parse(formData.getAll('contract')[0] as string) as Contract;
  const tenant = JSON.parse(formData.getAll('currentTenant')[0] as string) as Tenant;
  const deposit = JSON.parse(formData.getAll('deposit')[0] as string) as Payment;
  const contractFile = formData.getAll('contractFile')[0] as string;
  const additionalFile = formData.getAll('additionalFile')[0] as string;

  // Check auth
  if(!getSession()){
    return NextResponse.json({ success: false, message: "User not authenticated" });
  }
  
  try {
    const signatureFiles = {contract: {}, additional: {}};

    //Inactivate current contract:
    const currentContract = await firestoreService.getDocument("contracts",tenant.current_contract_id) as Contract;
    currentContract.status = "Terminated";
    currentContract.is_current = false;

    contract.id = uuidv4();
    contract.tenant_id = tenant.id;
    contract.lease_start = new Date(contract.lease_start as Date);
    contract.lease_end = new Date(contract.lease_end as Date);
    contract.status = "Active";
    contract.is_current = true;
    contract.createdAt = new Date();

    if(contractFile){
      signatureFiles.contract = await getSignatureFile(tenant.id + "/" + contract.id, contract.contract_file_id, contract.id);
    }
    if(additionalFile){
      signatureFiles.additional = await getSignatureFile(tenant.id + "/" + contract.id, contract.aditional_file_id, contract.id);
    }

    deposit.id = uuidv4();
    deposit.amount_paid = deposit.amount_payment
    deposit.payment_method = "Other"
    deposit.contract_id = contract.id
    deposit.is_current = true;
    deposit.status = "Paid"
    deposit.type = "deposit"
    deposit.paidDate = new Date();
    deposit.createdAt = new Date();

    const updatedTenant:Partial<Tenant> = {
      current_contract_id: contract.id
    }

    const multipleDocsToInsert: MultipleDoc[] = [
      {
        collection: "tenants",
        docId: tenant.id,
        data: updatedTenant
      },{
        collection: "contracts",
        docId: currentContract.id,
        data: currentContract
      },{
        collection: "contracts",
        docId: contract.id,
        data: contract
      },{
        collection: "payments",
        docId: deposit.id,
        data: deposit
      },
    ]

    await firestoreService.setMultipleDocuments(multipleDocsToInsert)
    
    return NextResponse.json({ success: true, signatureFiles });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success:false, error: String(error) },
      { status: 500 }
    );
  }
}