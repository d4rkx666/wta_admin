'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Payment } from '@/types/payment';


export function useLivePayments() {
  const [data, setData] = useState<Payment[]>([]); // State to hold the documents
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track fetching status

  useEffect(() => {
    // First fetch all documents initially with getDocs
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "payments"));
        const docs = querySnapshot.docs.map(doc => ({
          ...doc.data() as Payment,
        }));

        setData(docs); // Set the initial data
      } catch (error) {
        console.error("Error fetching documents:", error);
      }finally{
        setLoading(false);
      }
    };

    fetchData();

    // Now set up the real-time listener with onSnapshot for live updates
    const unsubscribe = onSnapshot(collection(db, "payments"), (snap) => {
      const updatedDocs = snap.docs.map(doc => ({
        ...doc.data() as Payment,
      }));
      console.log("setting new")
      setData(updatedDocs); // Update the state with live changes
    });

    // Cleanup the real-time listener on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once when the component mounts

  return { data, loading };
}