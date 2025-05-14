'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Room } from '@/types/room';

export function useRoom(property_id?: string) {
  const [data, setData] = useState<Room[]>([]); // State to hold the rooms
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track fetching status

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const roomsRef = collection(db, 'rooms');

        const querySnapshot = await getDocs(property_id ? query(roomsRef, where('id_property', '==', property_id)) : roomsRef); // Get by id or all
        const docs = querySnapshot.docs.map(doc => ({
          ...doc.data() as Room,
        }));
        setData(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }finally{
        setLoading(false); 
      }
    };

    fetchRoomDetails();

    const unsubscribe = onSnapshot(property_id ? query(collection(db, "rooms"), where("id_property", "==", property_id)) : collection(db, "rooms"), (snap) => {
      const updatedDocs = snap.docs.map(doc => ({
        ...doc.data() as Room,
      }));
      setData(updatedDocs); // Update the state with live changes
    });

    return () => unsubscribe();
  }, [property_id]);

  return { data, loading };
}