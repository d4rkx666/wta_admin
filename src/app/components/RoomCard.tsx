'use client'

import { Room } from '@/types/room';
import { Property } from '@/types/property';
import Image from 'next/image';

export function RoomCard({ property, room, onEdit, onDelete }: { property: Property, room: Room; onEdit: () => void; onDelete: () => void }) {
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-2">
      <div className="relative w-full h-60">
        <Image 
          src={room.thumbnail || room.images[0].url}
          alt={room.title}
          fill
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          ${room.price}/month
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{room.title}</h3>
        <p className="text-gray-600 mb-4">{property.location}</p>
        <div className="flex justify-between items-center mb-4">
          <span className={`px-2 py-1 text-xs rounded-full ${
            room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {room.available ? 'Available' : 'Not Available'}
          </span>
          <span className="text-gray-500 text-sm">
            Room #{room.room_number}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}