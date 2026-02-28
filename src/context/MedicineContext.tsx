import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMedicineNames } from '@/services/api';
import toast from 'react-hot-toast';

interface MedicineName {
  id: string;
  name: string;
}

interface MedicineContextType {
  medicineNames: MedicineName[];
  loading: boolean;
  refreshMedicines: () => Promise<void>;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export const MedicineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [medicineNames, setMedicineNames] = useState<MedicineName[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedicines = async () => {
    // Don't set loading to true for background refreshes to avoid UI flicker
    // Only set it on initial load if needed, but here we want to keep it simple
    try {
      const data = await getMedicineNames();
      setMedicineNames(data);
    } catch (err) {
      console.error('Failed to fetch medicine names', err);
      toast.error('Failed to update medicine list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const refreshMedicines = async () => {
    await fetchMedicines();
  };

  return (
    <MedicineContext.Provider value={{ medicineNames, loading, refreshMedicines }}>
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicineContext = () => {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error('useMedicineContext must be used within a MedicineProvider');
  }
  return context;
};
