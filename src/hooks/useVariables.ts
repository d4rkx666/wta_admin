'use client';
import { useEffect, useState } from 'react';
import {  getDoc, doc} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

type varType = {
  type: "amenities" | "bills" | "property"
}

export function useVariable(varType:varType) {
  const [listGlobalAmenities, setListGlobalAmenities] = useState<string[]>([]); 
  const [listSpecificAmenities, setListSpecificAmenities] = useState<string[]>([]); 
  const [listBillTypes, setListBillTypes] = useState<string[]>([]); 
  const [listPropertyTypes, setListPropertyTypes] = useState<string[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track fetching status

  useEffect(() => {
    const fetchAmenities = async () => {
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

    const fetchBillTypes = async () => {
      try {
        const propertyRef = doc(db, 'var', "bill");
        const propertySnap = await getDoc(propertyRef);
        if (propertySnap.exists()) {
          const billTypeData = propertySnap.data();
          
          setListBillTypes(billTypeData?.bill_types || [])
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }finally{
        setLoading(false);
      }
    };

    

    const fetchPropertyTypes = async () => {
      try {
        const propertyRef = doc(db, 'var', "property");
        const propertySnap = await getDoc(propertyRef);
        if (propertySnap.exists()) {
          const data = propertySnap.data();
          
          setListPropertyTypes(data?.types || [])
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }finally{
        setLoading(false);
      }
    };

    switch(varType.type){
      case "amenities": fetchAmenities();
      case "bills": fetchBillTypes();
      case "property": fetchPropertyTypes();
    }
  }, []);

  return { listGlobalAmenities, listSpecificAmenities, listBillTypes, listPropertyTypes, loading };
}