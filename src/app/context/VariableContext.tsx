
'use client';

import { useVariable } from '@/hooks/useVariables';
import { createContext, useContext, ReactNode } from 'react';
import Loader from '../components/common/Loader';


interface GlobalVarType {
  listGlobalAmenities: string[];
  listSpecificAmenities: string[];
}

const GlobalVar = createContext<GlobalVarType | undefined>(undefined);


export const GlobalVarProvider = ({ children }: { children: ReactNode }) => {
  const { listGlobalAmenities, listSpecificAmenities, loading } = useVariable() // Get Properties

  if(loading){
    return <Loader/>
  }

  return (
    <GlobalVar.Provider value={{ listGlobalAmenities, listSpecificAmenities }}>
      {children}
    </GlobalVar.Provider>
  );
};

export const useGlobalVariables = () => {
  const context = useContext(GlobalVar);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};