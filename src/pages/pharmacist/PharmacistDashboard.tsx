import React, { useState, useEffect } from 'react';
import { Search, Pill, Database, Settings } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout, type SidebarItem } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import type { Hospital } from '@/services/mocks/hospitalData';
import HospitalSelector from '@/components/shared/HospitalSelector';
import { getHospitals } from '@/services/api';
import GiveMedicineTab from './components/GiveMedicineTab';
import MedicineManagementTab from './components/MedicineManagementTab';
import BulkUpdateTab from './components/BulkUpdateTab';

const pharmacistMenuItems: SidebarItem[] = [
  { id: 'give', label: 'Give Medicine', icon: Search },
  { id: 'medicines', label: 'Medicines', icon: Pill },
  { id: 'bulk', label: 'Bulk Update', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];
import { MedicineProvider } from '@/context/MedicineContext';

const PharmacistDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = searchParams.get('tab') || 'give';
  const hospitalIdInUrl = searchParams.get('hospitalId');

  const [activeTab, setActiveTabState] = useState(initialTab);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'give';
    setActiveTabState(currentTab);
  }, [searchParams]);

  useEffect(() => {
    const restoreHospital = async () => {
      if (hospitalIdInUrl && !selectedHospital) {
        try {
          const { data } = await getHospitals(1, 100);
          const found = data.find(h => h.id === hospitalIdInUrl);
          if (found) {
            setSelectedHospital(found);
          }
        } catch (err) {
            console.error("Failed to restore hospital selection", err);
        }
      }
    };
    restoreHospital();
  }, [hospitalIdInUrl]);

  const handleTabChange = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams(prev => {
        prev.set('tab', tab);
        return prev;
    });
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setSearchParams(prev => {
        prev.set('hospitalId', hospital.id);
        return prev;
    });
  };

  const getPageTitle = () => {
    if (!selectedHospital) return 'Select Hospital';
    switch (activeTab) {
      case 'give': return `Dispense Medicine - ${selectedHospital.name}`;
      case 'medicines': return `Medicine Inventory - ${selectedHospital.name}`;
      case 'bulk': return 'Bulk Update';
      case 'settings': return 'Settings';
      default: return 'Pharmacist Dashboard';
    }
  };

  const handleBackToSelection = () => {
    setSelectedHospital(null);
    setSearchParams(prev => {
        prev.delete('hospitalId');
        return prev;
    });
  };

  return (
    <MedicineProvider>
      <DashboardLayout
        menuItems={pharmacistMenuItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pageTitle={getPageTitle()}
        headerAction={selectedHospital ? (
          <Button variant="outline" size="sm" onClick={handleBackToSelection}>
            Change Hospital
          </Button>
        ) : undefined}
      >
        {!selectedHospital ? (
          <HospitalSelector
            onSelect={handleHospitalSelect}
            title="Select Hospital"
            description="Choose the hospital to manage medicines"
          />
        ) : (
          <>
            {activeTab === 'give' && <GiveMedicineTab hospitalId={selectedHospital.id} />}
            {activeTab === 'medicines' && <MedicineManagementTab hospitalId={selectedHospital.id} />}
            {activeTab === 'bulk' && <BulkUpdateTab />}
            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg bg-card">
                <Settings className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">Settings</p>
                <p className="text-sm">Coming Soon - Pharmacist preferences.</p>
              </div>
            )}
          </>
        )}
      </DashboardLayout>
    </MedicineProvider>
  );
};

export default PharmacistDashboard;
