'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export function useDetailRoom(property_id: string, room_id: string) {
  const [data, setData] = useState<any>({}); // State to hold the rooms
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track fetching status

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const propertyRef = doc(db, 'properties', property_id);
        const propertySnap = await getDoc(propertyRef);
        if (propertySnap.exists()) {
          const propertyData = propertySnap.data();
          const room = propertyData.rooms.find(r => r.id === room_id);
          
          // Extra data to room
          room.location = propertyData.location;
          room.furnished = propertyData.furnished;
          room.url_map = propertyData.url_map;
          room.roommates = propertyData.rooms.length - 1;
          room.specific_amenities = room.specific_amenities.concat(propertyData.global_amenities);
          setData(room);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }finally{
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchRoomDetails();
  }, []);

  return { data, loading };
}