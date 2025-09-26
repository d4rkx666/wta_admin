import { Contract } from "@/types/contract";
import { Payment } from "@/types/payment";
import { Property } from "@/types/property";
import { Room } from "@/types/room";
import { CalendarIcon, CurrencyDollarIcon, DocumentTextIcon, HomeIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

export default function ContractForm_NOT_USING({isEditing, currentRoom, properties, handleShowRooms, contract, setContract, setPriceRoom, currentRooms, handlePreviousRents, handleFutureRents, depositPayment, setDepositPayment, pastRents, handleEditPastRentAmount, contractFile, handleFileChange, contractPreview, idFile, idPreview}:{isEditing: boolean, currentRoom: Partial<Room>, properties: Property[], handleShowRooms: (id_property: string) => Promise<void>, contract: Partial<Contract>, setContract:Dispatch<SetStateAction<Partial<Contract>>>, setPriceRoom: (idRoom: string) => void, currentRooms: Room[], handlePreviousRents: (lease_start: Date) => void, handleFutureRents: (lease_end: Date) => void, depositPayment:Partial<Payment>, setDepositPayment:Dispatch<SetStateAction<Partial<Payment>>>, pastRents: Partial<Payment>[], handleEditPastRentAmount: (value: number, index: number) => void, contractFile:File | null,  handleFileChange: (e: ChangeEvent<HTMLInputElement>, type: "contract" | "id") => void, contractPreview: string | null, idFile: File | null, idPreview:string | null}) {
   return (
      <>
         {/* Contract */}
         <div className='space-y-3'>
            <hr />
            <p className='text-gray-700 text-sm'>Contract</p>
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
                        defaultValue={currentRoom.id_property || ""}
                        disabled={isEditing}
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
                        defaultValue={currentRoom.id || ""}
                        disabled={isEditing}
                        onChange={(e) => {
                           setContract({ ...contract, room_id: e.target.value });
                           setPriceRoom(e.target.value);
                        }}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border bg-white disabled:bg-gray-200"
                     >
                        <option value="">Select Room</option>
                        {currentRooms.map(room => (
                           <option key={room.id} value={room.id}>{room.title}</option>
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
                        disabled={isEditing}
                        defaultValue={contract.lease_start instanceof Timestamp ? (contract.lease_start as Timestamp).toDate().toISOString().split("T")[0] : ""}
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
                        disabled={isEditing}
                        defaultValue={contract.lease_end instanceof Timestamp ? (contract.lease_end as Timestamp).toDate().toISOString().split("T")[0] : ""}
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
            <hr />
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
                     disabled={isEditing}
                     value={depositPayment?.amount_payment || ''}
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

         {(!isEditing && pastRents) && pastRents.map((rent, i) => {
            const month = new Date(rent.dueDate as Date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
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

         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
               <label htmlFor="contractFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Lease Contract (PDF max 10MB)
               </label>
               <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full p-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                     <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                        <p className="text-xs text-gray-500 mt-2">
                           {contractFile ? `${contractFile.name} (${(contractFile.size / 1000 ).toFixed(0)} KB)` : 'Click to upload contract'}
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
                        style={{ border: 'none' }}
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

            <div>
               <label htmlFor="idFile" className="block text-sm font-medium text-gray-700 mb-1">
                  ID/Passport (PDF max 10MB)
               </label>
               <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full p-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                     <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                        <p className="text-xs text-gray-500 mt-2">
                           {idFile ? `${idFile.name} (${(idFile.size / 1000 ).toFixed(0)} KB)` : 'Click to upload ID/Passport'}
                        </p>
                     </div>
                     <input
                        id="idFile"
                        name="idFile"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'id')}
                     />
                  </label>
               </div>
               {idPreview &&
                  <div className='mt-5 text-center'>
                     <span className='mb-1'>Preview</span>
                     <Image
                        key={idPreview}
                        alt='id_file'
                        src={idPreview.slice(0, 4) === "blob" ? idPreview : idPreview + "?" + new Date().getTime()}
                        width={400}
                        height={50}
                     />
                  </div>
               }

               {idPreview && (
                  <div className="mt-2">
                     <a
                        href={idPreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                     >
                        View uploaded ID
                     </a>
                  </div>
               )}
            </div>
         </div>
      </>
   )
}