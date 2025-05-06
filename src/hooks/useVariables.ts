'use client';
import { useEffect, useState } from 'react';
import {  getDoc, doc} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';


export function useVariable() {
  const [listGlobalAmenities, setListGlobalAmenities] = useState<string[]>([]); 
  const [listSpecificAmenities, setListSpecificAmenities] = useState<string[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track fetching status

  useEffect(() => {
    // First fetch all documents initially with getDocs
    const fetchData = async () => {
      try {
        const propertyRef = doc(db, 'var', "amenities");
        const propertySnap = await getDoc(propertyRef);
        if (propertySnap.exists()) {
          const amenitiesData = propertySnap.data();
          
          setListGlobalAmenities(amenitiesData?.global_amenities || [])
          setListSpecificAmenities(amenitiesData?.specific_amenities || [])
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }finally{
        setLoading(false);
      }
    };

    fetchData();

  }, []);

  return { listGlobalAmenities, listSpecificAmenities, loading };
}