'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export function useLiveDocuments() {
  const [data, setData] = useState<any[]>([]); // State to hold the documents
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track fetching status

  useEffect(() => {
    // First fetch all documents initially with getDocs
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(featuredRooms(docs)); // Set the initial data
        setLoading(false); // Data is now loaded
      } catch (error) {
        console.error("Error fetching documents:", error);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchData();

    // Now set up the real-time listener with onSnapshot for live updates
    const unsubscribe = onSnapshot(collection(db, "properties"), (snap) => {
      const updatedDocs = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(featuredRooms(updatedDocs)); // Update the state with live changes
    });

    // Cleanup the real-time listener on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once when the component mounts

  // Append property data into room data
  const featuredRooms = (featuredRooms:any)=>{
    const newData = featuredRooms.flatMap(property =>
      property.rooms ? property.rooms.map(rm => ({
         ...rm,
         id_property: property.id || "",
         roommates: property.rooms.length - 1 || [], // Roommates are the total of rooms not counting the one listing
         location: property.location || ""

      })) : []
    );
    return newData;
  }

  return { data, loading };
}