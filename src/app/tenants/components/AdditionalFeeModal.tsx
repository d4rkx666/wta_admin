import { useLiveContracts } from "@/hooks/useLiveContracts";
import { useLiveProperties } from "@/hooks/useLiveProperties";
import { useLiveTenants } from "@/hooks/useLiveTenants";
import { useRoom } from "@/hooks/useRoom";
import { Payment } from "@/types/payment";
import { HomeIcon, XMarkIcon, CurrencyDollarIcon, DocumentTextIcon, UserIcon } from "@heroicons/react/24/outline";
import { Dispatch, FormEvent, SetStateAction, useMemo, useState } from "react";

export default function AdditionalFeeModal({
   setShowAdditionalFeeModal,
   handleSubmit,
   isLoading,
   feeTypes = [] // Pass fee types list as prop
}: {
   setShowAdditionalFeeModal: Dispatch<SetStateAction<boolean>>,
   handleSubmit: (e: FormEvent<HTMLFormElement>, fee:Partial<Payment>) => void,
   isLoading: boolean,
   tenants?: Array<{ id: string, name: string }>,
   rooms?: Array<{ id: string, number: string }>,
   feeTypes?: Array<{ id: string, name: string, defaultAmount: number }>
}) {
   const [currentFee, setCurrentFee] = useState<Partial<Payment>>({});
   const [currentPropertyId, setCurrentPropertyId] = useState<string>("")

   // DB
   const { data: properties, loading: loadingProperties } = useLiveProperties();
   const { data: rooms, loading: loadingRooms } = useRoom();
   const { data: contracts, loading: loadingContracts } = useLiveContracts();
   const { data: tenants, loading: loadingTenants } = useLiveTenants();

   const tenant_list = useMemo(() => {
      const t_list = tenants.filter(t=>{
         const contract = contracts.find(c=>c.id === t.current_contract_id);
         const room = rooms.find(r=>r.id === contract?.room_id);
         if(room && room.id_property === currentPropertyId){
            return true;
         }
         return false;
      })

      return t_list;
   }, [currentPropertyId])

   return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
         <div
            className="fixed inset-0 bg-gray-600/70 transition-opacity"
            aria-hidden="true"
            onClick={() => setShowAdditionalFeeModal(false)}
         ></div>

         <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-2xl">
               <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold text-white">
                        Add Additional Fee
                     </h3>
                     <button
                        type="button"
                        className="rounded-md p-1 text-white hover:bg-blue-500 focus:outline-none"
                        onClick={() => setShowAdditionalFeeModal(false)}
                     >
                        <XMarkIcon className="h-6 w-6" />
                     </button>
                  </div>
               </div>

               <div className="px-6 py-5">
                  <form onSubmit={(e)=>handleSubmit(e,currentFee)}>
                     <div className="space-y-4">
                        {/* Tenant Selection */}
                        <div>
                           <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-1">
                              Property
                           </label>
                           <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <HomeIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                 id="propertyId"
                                 name="propertyId"
                                 required
                                 onChange={(e) => setCurrentPropertyId(e.target.value)}
                                 className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border bg-white disabled:bg-gray-200"
                              >
                                 <option value="">Select Property</option>
                                 {properties.map((property, i) => (
                                    <option key={i} value={property.id}>
                                       {property.title}
                                    </option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        {/* Tenant Selection */}
                        <div>
                           <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                              Tenant
                           </label>
                           <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <UserIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                 id="tenantId"
                                 name="tenantId"
                                 required
                                 onChange={(e)=>setCurrentFee({...currentFee, contract_id:e.target.value})}
                                 className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border bg-white disabled:bg-gray-200"
                              >
                                 <option value="">Select Tenant</option>
                                 {tenant_list.map((t, i) => (
                                    <option key={i} value={t.current_contract_id}>
                                       {t.name}
                                    </option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        {/* Fee Type Selection */}
                        <div>
                           <label htmlFor="feeTypeId" className="block text-sm font-medium text-gray-700 mb-1">
                              Fee Type
                           </label>
                           <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                 type="text"
                                 id="feeTypeId"
                                 name="feeTypeId"
                                 required
                                 onChange={(e)=>setCurrentFee({...currentFee, comments:e.target.value})}
                                 className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border bg-white disabled:bg-gray-200"
                              />
                           </div>
                        </div>

                        {/* Amount */}
                        <div>
                           <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                              Amount
                           </label>
                           <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                 type="number"
                                 id="amount"
                                 name="amount"
                                 required
                                 min="0"
                                 step="0.01"
                                 onChange={(e)=>setCurrentFee({...currentFee, amount_payment:Number(e.target.value)})}
                                 className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border bg-white disabled:bg-gray-200"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="mt-6 flex justify-end space-x-3">
                        <button
                           type="button"
                           onClick={() => setShowAdditionalFeeModal(false)}
                           className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                           Cancel
                        </button>

                        <button
                           type="submit"
                           disabled={isLoading}
                           className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-blue-300"
                        >
                           {isLoading ? (
                              "Adding Fee..."
                           ) : (
                              "Add Fee"
                           )}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   )
}