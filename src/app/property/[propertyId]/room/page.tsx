'use client';

import { useState, useCallback } from 'react';
import { useParams } from "next/navigation";
import { RoomCard } from "@/app/components/RoomCard";
import { useProperty } from '@/hooks/useProperty';
import Loader from '@/app/components/common/Loader';
import { Room } from '@/types/room';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Timestamp } from 'firebase/firestore';

const RoomListing = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { data, loading, mutate } = useProperty(propertyId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return <Loader />;
  }

  const property = data;

  const openCreateModal = () => {
    setCurrentRoom({
      id: '',
      room_number: 0,
      title: '',
      thumbnail: '',
      price: 0,
      fixed_price: 0,
      images: [],
      available: true,
      date_availability: Timestamp.now(),
      private_washroom: false,
      description: '',
      specific_amenities: [],
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setCurrentRoom(room);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        await fetch(`/api/rooms/${roomId}`, {
          method: 'DELETE'
        });
        mutate(); // Refresh the data
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

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
              onDelete={() => handleDelete(room.id)}
            />
          ))}
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
      {isModalOpen && currentRoom && (
        <RoomFormModal
          room={currentRoom}
          isEditing={isEditing}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            mutate(); // Refresh the data
          }}
        />
      )}
    </div>
  );
};


function RoomFormModal({ room, isEditing, onClose, onSuccess }: {
  room: any;
  isEditing: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState(room);
  const [previewImages, setPreviewImages] = useState<string[]>(room.images || []);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  // Handle file drop - create preview URLs without uploading
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPreviewUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  // Drag and drop setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setPreviewImages((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update thumbnail index if needed
        if (thumbnailIndex === oldIndex) {
          setThumbnailIndex(newIndex);
        } else if (thumbnailIndex === newIndex) {
          setThumbnailIndex(oldIndex);
        }
        
        return newItems;
      });
    }
  };

  const handleDeleteImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);
    
    setPreviewImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });

    // Adjust thumbnail index if needed
    if (thumbnailIndex === index) {
      setThumbnailIndex(0);
    } else if (thumbnailIndex > index) {
      setThumbnailIndex(thumbnailIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would handle form submission here
    // For now, we'll just close the modal
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Room' : 'Create New Room'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Other form fields would go here */}
            
            {/* Image Upload and Preview Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Room Images (First image will be used as thumbnail)
              </label>
              
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the images here...</p>
                ) : (
                  <p>Drag & drop images here, or click to select</p>
                )}
              </div>
              
              {previewImages.length > 0 && (
                <div className="mt-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={previewImages}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {previewImages.map((img, index) => (
                          <SortableImage
                            key={img}
                            id={img}
                            src={img}
                            isThumbnail={index === thumbnailIndex}
                            onClick={() => setThumbnailIndex(index)}
                            onDelete={() => handleDeleteImage(index)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <p className="text-sm text-gray-500 mt-2">
                    Drag to reorder images. The first image will be used as the thumbnail.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? 'Update Room' : 'Create Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SortableImage({ id, src, isThumbnail, onClick, onDelete }: { 
  id: string, 
  src: string, 
  isThumbnail: boolean, 
  onClick: () => void,
  onDelete: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-square rounded-md overflow-hidden border-2 ${
        isThumbnail ? 'border-blue-500' : 'border-transparent'
      } cursor-move`}
    >
      <img
        src={src}
        alt="Room preview"
        className="w-full h-full object-cover"
        onClick={onClick}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
        {isThumbnail ? 'Thumbnail' : 'Image'}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
        aria-label="Delete image"
      >
        ×
      </button>
    </div>
  );
}

export default RoomListing;