import { Contract } from "@/types/contract";
import { Payment } from "@/types/payment";
import { Property } from "@/types/property";
import { Room } from "@/types/room";
import { CalendarIcon, CurrencyDollarIcon, DocumentTextIcon, HomeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";

export default function ContractModal({handleCloseModal, handleSubmit, isLoading, currentRoom, properties, handleShowRooms, contract, setContract, setPriceRoom, currentRooms, handlePreviousRents, handleFutureRents, depositPayment, setDepositPayment, pastRents, handleEditPastRentAmount, contractFile, handleFileChange, contractPreview}:{handleCloseModal:()=>void, handleSubmit: (e: FormEvent<HTMLFormElement>)=>void, isLoading:boolean, isEditing: boolean, currentRoom: Partial<Room>, properties: Property[], handleShowRooms: (id_property: string) => Promise<void>, contract: Partial<Contract>, setContract:Dispatch<SetStateAction<Partial<Contract>>>, setPriceRoom: (idRoom: string) => void, currentRooms: Room[], handlePreviousRents: (lease_start: Date) => void, handleFutureRents: (lease_end: Date) => void, depositPayment:Partial<Payment>, setDepositPayment:Dispatch<SetStateAction<Partial<Payment>>>, pastRents: Partial<Payment>[], handleEditPastRentAmount: (value: number, index: number) => void, contractFile:File | null,  handleFileChange: (e: ChangeEvent<HTMLInputElement>, type: "contract" | "id") => void, contractPreview: string | null, idFile: File | null, idPreview:string | null}) {
   return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
         <div
            className="fixed inset-0 bg-gray-600/70 transition-opacity"
            aria-hidden="true"
            onClick={handleCloseModal}
         ></div>

         <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-2xl">
               <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold text-white">
                        Add New Contract
                     </h3>
                     <button
                        type="button"
                        className="rounded-md p-1 text-white hover:bg-blue-500 focus:outline-none"
                        onClick={handleCloseModal}
                     >
                        <XMarkIcon className="h-6 w-6" />
                     </button>
                  </div>
               </div>

               <div className="px-6 py-5">
                  <form onSubmit={handleSubmit}>
                     <div className="space-y-4">

                        {/* Contract */}
                        <div className='space-y-3'>
                           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <div>
                                 <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-1">
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
                                       onChange={(e) => handleShowRooms(e.target.value)}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border bg-white disabled:bg-gray-200"
                                    >
                                       <option value="">Select Property</option>
                                       {properties.map(property => (
                                          <option key={property.id} value={property.id}>{property.title}</option>
                                       ))}
                                    </select>
                                 </div>
                              </div>

                              <div>
                                 <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Room
                                 </label>
                                 <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <HomeIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                       id="roomId"
                                       name="roomId"
                                       required
                                       onChange={(e) => {
                                          setContract({ ...contract, room_id: e.target.value });
                                          setPriceRoom(e.target.value);
                                       }}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border bg-white disabled:bg-gray-200"
                                    >
                                       <option value="">Select Room</option>
                                       {currentRooms.map(room => (
                                          <option key={room.id} value={room.id}>{room.room_number}</option>
                                       ))}
                                    </select>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <div>
                                 <label htmlFor="leaseStart" className="block text-sm font-medium text-gray-700 mb-1">
                                    Lease Start Date
                                 </label>
                                 <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                       type="date"
                                       id="leaseStart"
                                       name="leaseStart"
                                       required
                                       onKeyDown={(e) => e.preventDefault()}
                                       onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                                       onChange={(e) => {
                                          const d = (e.target.value as string).split("-")
                                          setContract({ ...contract, lease_start: new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2])) })
                                          handlePreviousRents(new Date(e.target.value));
                                       }}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border disabled:bg-gray-200"
                                    />
                                 </div>
                              </div>

                              <div>
                                 <label htmlFor="leaseEnd" className="block text-sm font-medium text-gray-700 mb-1">
                                    Lease End Date
                                 </label>
                                 <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                       type="date"
                                       id="leaseEnd"
                                       name="leaseEnd"
                                       required
                                       onKeyDown={(e) => e.preventDefault()}
                                       onClick={(e) => (e.target as HTMLInputElement).showPicker()}

                                       onChange={(e) => {
                                          const d = (e.target.value as string).split("-")
                                          setContract({ ...contract, lease_end: new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2])) });
                                          handleFutureRents(new Date(e.target.value));
                                       }}
                                       className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border disabled:bg-gray-200"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div>
                           <div>
                              <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-1">
                                 Deposit Amount
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                 </div>
                                 <input
                                    type="number"
                                    id="depositAmount"
                                    name="depositAmount"
                                    min="0"
                                    value={depositPayment.amount_payment || ""}
                                    onChange={(e) => setDepositPayment({ ...depositPayment, amount_payment: parseFloat(e.target.value) || 0 })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border disabled:bg-gray-200"
                                    placeholder="0.00"
                                 />
                              </div>
                           </div>
                        </div>

                        {currentRoom.price !== 0 &&
                           <p className='text-xs font-bold text-green-700'>Room price: ${currentRoom.price}</p>
                        }

                        {pastRents && pastRents.map((rent, i) => {
                           const month = new Date(rent.dueDate as Date).toLocaleDateString("en-US", { month: "long", year: "numeric"});
                           return (
                              <div key={i}>
                                 <div>
                                    <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-1">
                                       Payment of {month}
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                       </div>
                                       <input
                                          type="number"
                                          name="pastRent"
                                          min="0"
                                          value={rent?.amount_paid || ''}
                                          onChange={(e) => handleEditPastRentAmount(Number(e.target.value), i)}
                                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border disabled:bg-gray-200"
                                          placeholder="0.00"
                                       />
                                    </div>
                                 </div>
                              </div>
                           )
                        })}

                        <div className="grid grid-cols-1 gap-6">
                           <div>
                              <label htmlFor="contractFile" className="block text-sm font-medium text-gray-700 mb-1">
                                 Lease Contract (PDF)
                              </label>
                              <div className="flex items-center">
                                 <label className="flex flex-col items-center justify-center w-full p-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                       <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                                       <p className="text-xs text-gray-500 mt-2">
                                          {contractFile ? contractFile.name : 'Click to upload contract'}
                                       </p>
                                    </div>
                                    <input
                                       id="contractFile"
                                       name="contractFile"
                                       type="file"
                                       accept="application/pdf"
                                       className="hidden"
                                       onChange={(e) => handleFileChange(e, 'contract')}
                                    />
                                 </label>
                              </div>
                              {contractPreview &&
                                 <div className='mt-5 text-center'>
                                    <span className='mb-1'>Preview</span>
                                    <iframe
                                       key={contractPreview}
                                       src={contractPreview.slice(0, 4) === "blob" ? contractPreview : contractPreview + "?" + new Date().getTime()}
                                       style={{ border: 'none', width: "100%" }}
                                       title="PDF Viewer"
                                    ></iframe>
                                 </div>
                              }
                              {contractPreview && (
                                 <div className="mt-2">
                                    <a
                                       href={contractPreview}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                       View uploaded contract
                                    </a>
                                 </div>
                              )}
                           </div>
                        </div>


                     </div>

                     <div className="mt-6 flex justify-end space-x-3">
                        <button
                           type="button"
                           onClick={handleCloseModal}
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
                              "Creating Contract..."
                           ) : (
                              "Create Contract"
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