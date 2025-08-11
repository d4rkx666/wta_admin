"use client"
import { Bill } from "@/types/bill";
import { Tenant } from "@/types/tenant";
import { Payment } from "@/types/payment";
import { Timestamp } from "firebase/firestore";
import { Contract } from "@/types/contract";

export default function AsignBills({ bill, tenantSplits, tenantsSplitSaved, contracts, handlePaymentAmountChange, handleMarkBillPaid, handleOnUnnasign, splitEvenly, setSplitEvenly}: { bill: Partial<Bill>, tenantSplits:{tenant: Partial<Tenant>; payment: Partial<Payment>}[], tenantsSplitSaved?:{tenant: Partial<Tenant>; payment: Partial<Payment>}[], contracts:Contract[], handlePaymentAmountChange:(id:string, value:number)=>void, handleMarkBillPaid:(id:string, checked:boolean)=>void, handleOnUnnasign:(payment:Partial<Payment>)=>void,splitEvenly:boolean, setSplitEvenly:React.Dispatch<React.SetStateAction<boolean>>}) {
   
   const diff1 = (tenantSplits.length > 0) && tenantSplits.reduce((sum, split) => sum + (split.payment.amount_payment ? split.payment.amount_payment : 0), 0) || 0;
   const diff2 = (tenantsSplitSaved && tenantsSplitSaved.length > 0) && tenantsSplitSaved.reduce((sum, split) => sum + (split.payment.amount_payment ? split.payment.amount_payment : 0), 0) || 0;
   const diff = bill.amount && bill.amount -(diff1 + diff2) || 0;
   const total = diff1 + diff2;

   return (
      <div className="mt-4 border-t pt-4">
         <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700">Split Between Tenants</h3>
            <div className="flex items-center">
               <input
                  type="checkbox"
                  id="splitEvenly"
                  checked={splitEvenly}
                  onChange={(e)=>setSplitEvenly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
               />
               <label htmlFor="splitEvenly" className="ml-2 text-sm text-gray-700">
                  Split evenly
               </label>
            </div>
         </div>

         <div className="space-y-2">
            {tenantsSplitSaved && tenantsSplitSaved.map(split => {
               const disabled = split.payment.status !== "Pending";
               const currentContract = contracts.find(c=>c.id === split.tenant.current_contract_id);
               return(
               <div key={split.tenant.id} className="flex items-center mb-5">
                  <div className="w-1/3 text-sm text-gray-700" title={split.tenant.name}>
                     {split.tenant.name}

                     <div className="text-sm text-gray-700">
                        <div className="flex flex-col text-xs">
                           <span>From {currentContract?.lease_start && new Date((currentContract.lease_start as Timestamp).toDate()).toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                           <span>To {currentContract?.lease_end && new Date((currentContract.lease_end as Timestamp).toDate()).toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                           <span className="text-yellow-600">Assigned</span>
                        </div>
                     </div>
                  </div>

                  <div className="relative flex-1 rounded-md shadow-sm">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                     </div>
                     <input
                        type="number"
                        value={split.payment.amount_payment && split.payment.amount_payment || ""}
                        disabled={disabled}
                        onChange={(e) => handlePaymentAmountChange(split.tenant.id ? split.tenant.id : "", Number(e.target.value))}
                        className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                     />
                  </div>

                  <div className="relative flex-1">
                     <div className="flex flex-col items-center space-y-1">
                        <span className="text-sm text-yellow-600">
                           Payment <span className="font-bold">{split.payment.status}</span>
                        </span>
                        {split.payment.status === "Pending" &&
                           <button type="button" onClick={()=> handleOnUnnasign(split.payment)} className="text-sm text-gray-600 p-1 rounded-md bg-yellow-400 hover:bg-yellow-200">
                              Unassign
                           </button>
                        }
                        
                     </div>
                  </div>

               </div>
            )})}
         </div>

         <div className="space-y-2">
            {tenantSplits.map(split => {
               if(tenantsSplitSaved){
                  const result = tenantsSplitSaved.flatMap(item => Object.values(item)).find(item => item.id === split.tenant.id )
                  if(result){
                     return;
                  }
               }
               const currentContract = contracts.find(c=>c.id === split.tenant.current_contract_id);
               const lease_start = currentContract?.lease_start instanceof Timestamp ? (currentContract?.lease_start as Timestamp).toDate().toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric', year: 'numeric' }) : new Date(currentContract?.lease_start as Date).toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric', year: 'numeric' });
               const lease_end = currentContract?.lease_end instanceof Timestamp ? (currentContract?.lease_end as Timestamp).toDate().toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric', year: 'numeric' }) : new Date(currentContract?.lease_end as Date).toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric', year: 'numeric' });
               
               return (
               <div key={split.tenant.id} className="flex items-center">
                  <div className="w-1/3 text-sm text-gray-700" title={split.tenant.name}>
                     {split.tenant.name}

                     <div className="text-sm text-gray-700">
                        <div className="flex flex-col text-xs">
                           <span>From {lease_start}</span>
                           <span>To {lease_end}</span>
                        </div>
                     </div>
                  </div>

                  <div className="relative flex-1 rounded-md shadow-sm">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                     </div>
                     <input
                        type="number"
                        value={split.payment.amount_payment && split.payment.amount_payment || ""}
                        onChange={(e) => handlePaymentAmountChange(split.tenant.id ? split.tenant.id : "", Number(e.target.value))}
                        className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                     />
                  </div>

                  <div className="relative flex-1 ml-5">
                     <div className="flex items-center">
                        <input
                           type="checkbox"
                           id="paymentDone"
                           checked={split.payment.amount_paid && split.payment.amount_paid > 0 ? true : false}
                           onChange={(e) =>handleMarkBillPaid(split.tenant.id ? split.tenant.id : "", e.target.checked)}
                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="paymentDone" className="ml-2 text-sm text-gray-700">
                           Payment done
                        </label>
                     </div>
                  </div>
               </div>
            )})}
         </div>

         {diff !== 0  &&
            <div className="mt-3 pt-3 border-t flex justify-between">
               <span className="text-sm font-medium text-gray-700">Landlord is paying:</span>
               <span className="text-sm font-medium text-red-500">
                  ${diff.toFixed(2)}
               </span>
            </div>
         }

         <div className="mt-3 pt-3 border-t flex justify-between">
            <span className="text-sm font-medium text-gray-700">Total:</span>
            <span className="text-sm font-medium">
               ${total.toFixed(2)}
            </span>
         </div>
      </div>
   )
}