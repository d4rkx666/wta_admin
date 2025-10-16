import { ImageItem } from "@/types/imageItem";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import Image from "next/image";

export default function ImageItemUI({ image, isThumbnail, onSetThumbnail, onHandleThumbnail, onDelete, onRestore }: {
   image: ImageItem;
   isThumbnail: boolean;
   onSetThumbnail: () => void;
   onHandleThumbnail: (id: string) => void;
   onDelete: (id: string) => void;
   onRestore: (id: string) => void;
 }) {
   const {
     attributes,
     listeners,
     setNodeRef,
     transform,
     transition,
     isDragging
   } = useSortable({ id: image.id });
 
   return (
     <div
       ref={setNodeRef}
       style={
         {transform: CSS.Transform.toString(transform),
         transition,
         opacity: isDragging ? 0.5 : 1,
         zIndex: isDragging ? 100 : 'auto',
         position: 'relative' }
       }
       className={`group rounded-md overflow-hidden ${
         image.isMarkedForDeletion ? 'opacity-50' : ''
       } ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}`}
     >
       {/* Drag ico */}
       <div 
         className="absolute top-1 right-1 z-20 p-2 bg-white/80 rounded-full cursor-grab active:cursor-grabbing"
         {...attributes}
         {...listeners}
       >
         <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
         </svg>
       </div>
 
       {/* Image Container - No drag handlers here */}
       <div className="w-full h-32">
         <Image
           src={image.url}
           alt="Room preview"
           className="w-full h-full object-cover"
           fill
         />
       </div>
 
       {/* Image actions overlay */}
       <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex flex-col justify-between p-2">
         {isThumbnail && (
           <span className="self-start bg-green-500 text-white text-xs px-2 py-1 rounded-full">
             Thumbnail
           </span>
         )}
 
         <div className="flex justify-center space-x-2">
           {!isThumbnail && (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onSetThumbnail();
                 onHandleThumbnail(image.id);
               }}
               type="button"
               className="bg-white/80 hover:bg-white p-1 rounded-full shadow-sm z-10"
               title="Set as thumbnail"
             >
               <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
               </svg>
             </button>
           )}
 
           {image.isMarkedForDeletion ? (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onRestore(image.id);
               }}
               type="button"
               className="bg-white/80 hover:bg-white p-1 rounded-full shadow-sm z-10"
               title="Restore image"
             >
               <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
             </button>
           ) : (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete(image.id);
               }}
               type="button"
               className="bg-white/80 hover:bg-white p-1 rounded-full shadow-sm z-10"
               title="Delete image"
             >
               <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
               </svg>
             </button>
           )}
         </div>
       </div>
 
       {/* Deletion indicator */}
       {image.isMarkedForDeletion && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/50">
           <span className="text-white font-medium text-sm">Marked for deletion</span>
         </div>
       )}
     </div>
   );
 }