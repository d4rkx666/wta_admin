"use client";
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Room, RoomDefaultVal } from '@/types/room';
import { ImageItem } from '@/types/imageItem';
import ImageItemUI from './ImageItemUi';
import { XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Amenity } from '@/types/amenity';

export default function RoomImageModal({ room, onClose, onSave }: {
  room: Room;
  onClose: () => void;
  onSave: (data: Room, images: ImageItem[]) => Promise<void>;
}) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState('');

  // Initialize with existing images when editing
  useEffect(() => {
    if (room) {
      const existingImages = room.images.map(img => ({
        id: img.id,
        url: img.url,
        isExisting: true,
        isMarkedForDeletion: false
      }));
      setImages(existingImages);
      setSelectedThumbnail(room.thumbnail);
    }
  }, [room]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false
    }));

    setImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10,
    multiple: true
  });

  const handleDeleteImage = (id: string) => {
    setImages(prev =>
      prev.map(img =>
        img.id === id && img.isExisting
          ? { ...img, isMarkedForDeletion: true }
          : img
      ).filter(img => !(img.id === id && !img.isExisting))
    )
  };

  const handleRestoreImage = (id: string) => {
    setImages(prev =>
      prev.map(img =>
        img.id === id
          ? { ...img, isMarkedForDeletion: false }
          : img
      )
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async ({roomToInsert}:{roomToInsert:Room}) => {
  
    const updatedImages = images
    .filter(img => !img.isMarkedForDeletion)
    .map(img => ({
      id: img.id,
      url: img.url,
      isExisting: img.isExisting
    }))

    setImages(updatedImages)
    console.log(images, "images")
    await onSave(roomToInsert, images);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setIsLoading(true);
    try {
      // Save form
      const form = e.target as HTMLFormElement;
      const roomToInsert = room;
      roomToInsert.title = (form.elements.namedItem('title') as HTMLInputElement).value;
      roomToInsert.room_number = Number((form.elements.namedItem('room_number') as HTMLInputElement).value);
      roomToInsert.price = Number((form.elements.namedItem('price') as HTMLInputElement).value);
      roomToInsert.fixed_price = Number((form.elements.namedItem('fixed_price') as HTMLInputElement).value);
      roomToInsert.description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
      roomToInsert.private_washroom = (form.elements.namedItem('private_washroom') as HTMLInputElement).checked;
      const amenities = form.querySelectorAll('input[name="amenities"]') as NodeListOf<HTMLInputElement>;

      const selectedAmenities: Amenity[] = Array.from(amenities)
        .map((checkbox) => {
            return {
              name: checkbox.value,
              available: checkbox.checked
            }
        });

      roomToInsert.specific_amenities = selectedAmenities;
      roomToInsert.id = room.id != "" ? room.id : "";

      await handleSave({roomToInsert});
    } catch (error) {
      console.error('Error saving room:', error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-600/70 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {room ? 'Edit Room' : 'Create New Room'}
              </h3>
              <button
                type="button"
                className="rounded-md p-1 text-white hover:bg-blue-500 focus:outline-none"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            <form onSubmit={handleSubmit} method='post'>
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      defaultValue={room.title}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border peer"
                      placeholder="Sunshine Apartments"
                    />
                    <p className="mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                      This field is required
                    </p>
                  </div>

                  <div>
                    <label htmlFor="washrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Room number
                    </label>
                    <input
                      type="number"
                      id="room_number"
                      name="room_Number"
                      min={1}
                      required
                      defaultValue={room.room_number}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border peer"
                    />
                    <p className="mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                      This field is required
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-10">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min={1}
                        id="price"
                        name="price"
                        required
                        defaultValue={room.price}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border peer"
                      />
                      <p className="absolute mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                        This field is required
                      </p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Fixed Price
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min={1}
                        name="fixed_price"
                        required
                        defaultValue={room.fixed_price}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10 px-4 py-2 border peer"
                      />
                      <p className="absolute mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                        This field is required
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    required
                    defaultValue={room.description}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border peer"
                    placeholder="Describe the property features and amenities..."
                  />
                  <p className="mt-1 text-xs text-red-600 invisible peer-invalid:visible">
                    This field is required
                  </p>
                </div>

                <div className='flex justify-left'>
                  <input
                    type="checkbox"
                    id="private_washroom"
                    name="private_washroom"
                    defaultChecked={room.private_washroom}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Private Washroom</label>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Parking', 'Laundry', 'Gym', 'Pool', 'Elevator', 'Security'].map((amenity, i) => (
                      <div key={i} className="flex items-center">
                        <input
                          id={`amenity-${amenity}`}
                          name="amenities"
                          type="checkbox"
                          value={amenity}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          defaultChecked={room.specific_amenities.some(a => a.name === amenity && a.available) || false}
                        />
                        <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-700">
                    {isDragActive ? 'Drop the images here' : 'Drag & drop images here, or click to select'}
                  </p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, WEBP (max 10 images)</p>
                </div>
              </div>



              {/* Image Gallery with Sorting */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map(img => img.id)}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <ImageItemUI
                        key={image.id}
                        image={image}
                        isThumbnail={selectedThumbnail === image.url}
                        onSetThumbnail={() => setSelectedThumbnail(image.url)}
                        onDelete={handleDeleteImage}
                        onRestore={handleRestoreImage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {images.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No images added yet. Drag and drop or click above to add images.
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
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
                    room.id != "" ? 'Updating Property...' : 'Creating Room...'
                  ) : (
                    room.id != "" ? 'Update Property' : 'Create Room'
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