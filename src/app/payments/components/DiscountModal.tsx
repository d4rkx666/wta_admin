import { Payment } from "@/types/payment";
import { Timestamp } from "firebase/firestore";
import { Dispatch, SetStateAction } from "react";

export default function DiscountModal({
   setShowDiscountModal,
   addDiscount,
   isLoading, 
   setPayment,
   payment
}:{
   setShowDiscountModal:Dispatch<SetStateAction<boolean>>,
   addDiscount: () => void,
   isLoading: boolean,
   setPayment:Dispatch<SetStateAction<Payment | null>>,
   payment: Payment | null
}) {
   const beforeDate = (payment?.dueDate as Timestamp).toDate().setMonth((payment?.dueDate as Timestamp).toDate().getMonth() - 1);

   const from = new Date(beforeDate).toDateString();
   const to = (payment?.dueDate as Timestamp).toDate().toDateString();


   const handleSetPayment = (discount:number)=>{
      if(payment){
         setPayment({...payment, amount_discount: discount})
      }
   }
   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
         <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                     Add Discount
                  </h2>
                  <button
                     onClick={() => setShowDiscountModal(false)}
                     className="text-gray-400 hover:text-gray-500"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>

               <div className="space-y-4">

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Renting Period: <span className="text-blue-500">{from} - {to}</span></label>
                     {payment?.amount_discount && payment.amount_discount > 0 &&
                        <label className="block text-xs font-medium text-yellow-600 mb-1">You are about to modify the current discount of ${payment.amount_discount}</label>
                     }
                     
                  </div>

                  <div className="relative flex-1 rounded-md shadow-sm">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                     </div>
                     <input
                        type="number"
                        value={payment?.amount_discount || 0}
                        onChange={(e) => handleSetPayment(parseFloat(e.target.value))}
                        className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                     />
                  </div>
               </div>

               <div className="mt-6 flex justify-end space-x-3">
                  <button
                     onClick={() => setShowDiscountModal(false)}
                     className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={() => addDiscount()}
                     disabled={isLoading}
                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  >
                     {isLoading ? 
                        <>Adding Discount</>
                     :
                        <>Add Discount</>
                     }
                     
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}