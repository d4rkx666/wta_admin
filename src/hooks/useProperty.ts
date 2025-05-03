'use client';
import { useState, useEffect } from 'react';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Property, PropertyDefaultVal } from '@/types/property';

export function useProperty(property_id: string) {
  const [data, setData] = useState<Property>(PropertyDefaultVal); // State to hold the rooms
  const [loading, setLoading] = useState<boolean>(false); // Loading state to track fetching status

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true); 
        const propertyRef = doc(db, 'properties', property_id);
        const propertySnap = await getDoc(propertyRef);
        if (propertySnap.exists()) {
          const propertyData = propertySnap.data() as Property;
          setData(propertyData);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }finally{
        setLoading(false); 
      }
    };

    fetchRoomDetails();

    const unsubscribe = onSnapshot(doc(db, "properties", property_id), (snap) => {
      if (snap.exists()) {
        const propertyData = snap.data() as Property;
        setData(propertyData); 
      }
    });

    return () => unsubscribe();
  }, [property_id]);

  return { data, loading };
}