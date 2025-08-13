import { useContext } from 'react';
import { InspectionContext } from '@/context/InspectionContext';

export const useInspection = () => {
  const context = useContext(InspectionContext);
  
  if (!context) {
    throw new Error('useInspection must be used within an InspectionProvider');
  }
  
  return context;
};
