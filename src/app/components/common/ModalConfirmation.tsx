import { Property } from "@/types/property"
import { Room } from "@/types/room"
import { XMarkIcon } from "@heroicons/react/24/outline"

const ModalConfirmation = ({setIsModalConfirmOpen, handleDelProperty, currentProperty, isLoading}:{setIsModalConfirmOpen: (arg0:boolean)=>void, handleDelProperty: ()=>void, currentProperty: Property, currentRoom: Room, isLoading: boolean}) =>{

   return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
         <div
            className="fixed inset-0 bg-gray-600/70 transition-opacity"
            aria-hidden="true"
            onClick={() => setIsModalConfirmOpen(false)}
         ></div>

         <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-2xl">
               <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold text-white">
                        Confirmation
                     </h3>
                     <button
                        type="button"
                        className="rounded-md p-1 text-white hover:bg-blue-500 focus:outline-none"
                        onClick={() => setIsModalConfirmOpen(false)}
                     >
                        <XMarkIcon className="h-6 w-6" />
                     </button>
                  </div>
               </div>

               <div className="px-6 py-5">
                  <div className="space-y-4 text-center text-red-600">
                     <p className='text-lg'>Are you sure you want to delete this {currentProperty.id ? "property" : "room"}?</p>
                     {currentProperty.id && 
                     currentProperty.rooms.length > 0 && (
                        <>
                           <p className='text-sm'>Deleting this room will also delete the following rooms linked to this property:</p>
                           {currentProperty.rooms.map((r, i) => (
                              <p key={i}>Room {r.room_number}</p>
                           ))}
                        </>
                     )
                  }
                  </div>

                  <div className="mt-6 flex justify-center space-x-3">
                     <button
                        type="button"
                        onClick={() => setIsModalConfirmOpen(false)}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleDelProperty}
                        className="inline-flex items-center rounded-lg border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-yellow-300"
                     >
                        {isLoading ? (
                           "Deleting..."
                        ) : (
                           currentProperty.id ? "I want to delete this property" : "I want to delete this room"
                        )}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default ModalConfirmation