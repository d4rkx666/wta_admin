
'use client';

import { useVariable } from '@/hooks/useVariables';
import { createContext, useContext, ReactNode } from 'react';
import Loader from '../components/common/Loader';


interface GlobalVarType {
  listGlobalAmenities: string[];
  listSpecificAmenities: string[];
  listPropertyTypes: string[];
}

const GlobalVar = createContext<GlobalVarType | undefined>(undefined);


export const GlobalVarProvider = ({ children }: { children: ReactNode }) => {
  const { listGlobalAmenities, listSpecificAmenities, loading } = useVariable({type:"amenities"}) // Get Amenities
  const { listPropertyTypes } = useVariable({type:"property"}) // Get Amenities

  if(loading){
    return <Loader/>
  }

  return (
    <GlobalVar.Provider value={{ listGlobalAmenities, listSpecificAmenities, listPropertyTypes }}>
      {children}
    </GlobalVar.Provider>
  );
};

export const useGlobalVariables = () => {
  const context = useContext(GlobalVar);
  if (context === undefined) {
    throw new Error();
  }
  return context;
};