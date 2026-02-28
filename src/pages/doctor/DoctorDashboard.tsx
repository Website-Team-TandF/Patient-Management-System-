import React, { useState, useEffect } from 'react';
import { Search, ClipboardList, Users, Settings } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout, type SidebarItem } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import type { Hospital } from '@/services/mocks/hospitalData';
import HospitalSelector from '@/components/shared/HospitalSelector';
import SearchTab from './components/SearchTab';
import VisitsTab from './components/VisitsTab';
import PatientsTab from './components/PatientsTab';
import { getHospitals, getMetadata, type Metadata } from '@/services/api';
import { MedicineProvider } from '@/context/MedicineContext';

const doctorMenuItems: SidebarItem[] = [
  { id: 'search', label: 'Search Patient', icon: Search },
  { id: 'visits', label: 'Today\'s Visits', icon: ClipboardList },
  { id: 'patients', label: 'My Patients', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const DoctorDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL
  const initialTab = searchParams.get('tab') || 'search';
  const hospitalIdInUrl = searchParams.get('hospitalId');

  const [activeTab, setActiveTabState] = useState(initialTab);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  // Fetch metadata when hospital changes
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await getMetadata(selectedHospital?.id);
        setMetadata(data);
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    fetchMeta();
  }, [selectedHospital?.id]);

  // Effect to sync URL tab changes to state (e.g. back button)
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'search';
    setActiveTabState(currentTab);
  }, [searchParams]);

  // Effect to restore selected hospital from URL if page refreshed
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
    if (!selectedHospital) {
      return 'Select Hospital';
    }
    switch (activeTab) {
      case 'search': return `Search Patient - ${selectedHospital.name}`;
      case 'visits': return `Today's Visits - ${selectedHospital.name}`;
      case 'patients': return 'Patient History';
      case 'settings': return 'Settings';
      default: return 'Doctor Dashboard';
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
        menuItems={doctorMenuItems}
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
            description="Choose the hospital to start your session"
          />
        ) : (
          <>
            {activeTab === 'search' && <SearchTab hospitalId={selectedHospital.id} metadata={metadata} />}
            
            {activeTab === 'visits' && <VisitsTab hospitalId={selectedHospital.id} />}
            
            {activeTab === 'patients' && <PatientsTab />}
            
            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg bg-card">
                <Settings className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">Settings</p>
                <p className="text-sm">Coming Soon - Manage your profile and preferences.</p>
              </div>
            )}
          </>
        )}
      </DashboardLayout>
    </MedicineProvider>
  );
};

export default DoctorDashboard;
