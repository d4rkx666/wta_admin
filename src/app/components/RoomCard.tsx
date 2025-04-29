'use client'

import { useRouter } from 'next/navigation';

export function RoomCard({ room }: {
  room: {
    id: number;
    id_property: number;
    title: string;
    location: string;
    thumbnail: string;
    price: number;
    rommates: number;
    images: [];
  }
}) 
{
  const router = useRouter();
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-2">
      <div className="relative">
        <img
          src={room.thumbnail}
          alt="Modern room in downtown"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          ${room.price}/month
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{room.title}</h3>
        <p className="text-gray-600 mb-4">{room.location}</p>
        <div className="flex items-center text-gray-500 space-x-4">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            {room.rommates} Roommates
          </span>
        </div>
        <button
          onClick={() => router.push(`/listing/${room.id_property}/${room.id}`)}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
}