'use client'
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProperty } from '@/hooks/useProperty';
import Loader from '@/app/components/common/Loader';
import { RoomCard } from '@/app/components/RoomCard';
import { Room, RoomDefaultVal } from '@/types/room';
import RoomImageModal from './components/RoomImageModal';
import { set_room } from '@/hooks/setRoom';
import { del_room } from '@/hooks/delRoom';
import { ImageItem } from '@/types/imageItem';
import ModalConfirmation from '@/app/components/common/ModalConfirmation';
import { PropertyDefaultVal } from '@/types/property';
import { useNotification } from '@/app/context/NotificationContext';


export default function RoomListing() {
  const {showNotification} = useNotification();
  const { propertyId } = useParams<{ propertyId: string }>();
  const { data, loading } = useProperty(propertyId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room>(RoomDefaultVal);
  const [isModalConfirmOpen,setIsModalConfirmOpen] = useState(false)
  const [isLoading] = useState(false);

  if (loading) {
    return <Loader />;
  }

  const property = data;

  const openCreateModal = () => {
    setCurrentRoom(RoomDefaultVal);
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setCurrentRoom(room);
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (roomData: Room, images: ImageItem[]) => {
    try {
      // Convert blob URLs to actual files only when img DOESN'T EXISTS
      const files = await Promise.all(
        images.map(async (img) => {
          const response = await fetch(img.url);
          const blob = await response.blob();
          return {
            img: img,
            file: new File([blob], `image-${img.id}.jpg`, { type: blob.type })
          };
        })
      );

      if(files.length == 0){
        showNotification("error", "Please add at least one image.");
        return;
      }


      // Prepare FormData
      const formData = new FormData();

      // insert room
      formData.append('room', JSON.stringify(roomData));
      formData.append('roomId', roomData.id ? roomData.id : "");
      formData.append('propertyId', propertyId);

      // insert images
      files.forEach(({ img, file }) => {
        formData.append('images[]', file);
        formData.append('img[]', JSON.stringify(img));
      });

      //console.log('Saving room:', roomData, "and images:",images);
      const response = await set_room(formData);

      const data = await response.json();
      if(data.success){
        showNotification('success', 'Room form submitted successfully!');
        setIsModalOpen(false)
      }else{
        showNotification('error', 'Something went wrong... Please check all the form data and try again.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }finally{
      images.forEach(img => URL.revokeObjectURL(img.url));
    }
  };

  const handleDelProperty = async()=>{
    try {
      await del_room({property: property, room:currentRoom});
    } catch (error) {
      console.error('Upload failed:', error);
    }finally{
      setIsModalConfirmOpen(false);
      setCurrentRoom(RoomDefaultVal);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Add New Room
        </button>
      </div>

      {/* Room Cards Grid */}
      {property.rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {property.rooms.map((room, i) => (
            <RoomCard
              key={i}
              property={property}
              room={room}
              onEdit={() => openEditModal(room)}
              onDelete={() => {setIsModalConfirmOpen(true); setCurrentRoom(room)}}
            />
          ))}

          {isModalConfirmOpen && (
            <ModalConfirmation
            setIsModalConfirmOpen={setIsModalConfirmOpen}
            handleDelProperty={handleDelProperty}
            currentProperty={PropertyDefaultVal}
            currentRoom={currentRoom}
            isLoading={isLoading}/>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms yet</h3>
          <p className="text-gray-600 mb-4">
            You will see the rooms here of this property once you have added them.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Add new room
          </button>
        </div>
      )}

      {/* Room Form Modal */}
      {isModalOpen && (
        <RoomImageModal
          room={currentRoom}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveRoom}
        />
      )}
    </div>
  );
};