"use client"
import { Bill } from "@/types/bill";
import { Tenant } from "@/types/tenant";
import { Payment } from "@/types/payment";

export default function AsignBills({ bill, tenantSplits, handlePaymentAmountChange, splitEvenly, setSplitEvenly}: { bill: Bill, tenantSplits:{tenant: Partial<Tenant>; payment: Partial<Payment>}[], handlePaymentAmountChange:(id:string, value:number)=>void, splitEvenly:boolean, setSplitEvenly:React.Dispatch<React.SetStateAction<boolean>>}) {
   
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
            {tenantSplits.map(split => (
               <div key={split.tenant.id} className="flex items-center">
                  <div className="w-1/3 text-sm text-gray-700" title={split.tenant.name}>
                     {split.tenant.name}

                     <div className="text-sm text-gray-700">
                        <div className="flex flex-col text-xs">
                           <span>From {split.tenant.lease_start && new Date(split.tenant.lease_start).toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                           <span>To {split.tenant.lease_end && new Date(split.tenant.lease_end).toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                     </div>
                  </div>

                  <div className="relative flex-1 ml-2 rounded-md shadow-sm">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                     </div>
                     <input
                        type="number"
                        value={split.payment.amount_payment && split.payment.amount_payment.toFixed(2) || ""}
                        onChange={(e) => handlePaymentAmountChange(split.tenant.id ? split.tenant.id : "", Number(e.target.value))}
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                     />
                  </div>
               </div>
            ))}
         </div>

         <div className="mt-3 pt-3 border-t flex justify-between">
            <span className="text-sm font-medium text-gray-700">Total:</span>
            <span className="text-sm font-medium">
               ${tenantSplits.reduce((sum, split) => sum + (split.payment.amount_payment ? split.payment.amount_payment : 0), 0).toFixed(2)}
               {Math.abs(tenantSplits.reduce((sum, split) => sum + (split.payment.amount_payment ? split.payment.amount_payment : 0), 0) - bill.amount) > 0.01 && (
                  <span className="ml-2 text-red-500">
                     (Diff: ${(bill.amount - tenantSplits.reduce((sum, split) => sum + (split.payment.amount_payment ? split.payment.amount_payment : 0), 0)).toFixed(2)})
                  </span>
               )}
            </span>
         </div>
      </div>
   )
}