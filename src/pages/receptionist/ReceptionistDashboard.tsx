import React, { useState, useEffect } from 'react';
import { Calendar, Users, Settings, ClipboardList } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout, type SidebarItem } from '@/components/layout/DashboardLayout';
import type { Hospital } from '@/services/mocks/hospitalData';
import HospitalSelector from '@/components/shared/HospitalSelector';
import AppointmentsTab from './components/AppointmentsTab';
import VisitsTab from '../doctor/components/VisitsTab';
import { getHospitals } from '@/services/api';

const receptionistMenuItems: SidebarItem[] = [
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'visits', label: "Today's Visits", icon: ClipboardList },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ReceptionistDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'appointments';
  const hospitalIdInUrl = searchParams.get('hospitalId');

  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Restore hospital from URL
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

  const setActiveTab = (tab: string) => {
    setSearchParams(prev => {
        prev.set('tab', tab);
        return prev;
    });
  };

  const getPageTitle = () => {
    if (!selectedHospital && activeTab === 'appointments') {
      return 'Select Hospital';
    }
    switch (activeTab) {
      case 'appointments': return `Today's Appointments - ${selectedHospital?.name}`;
      case 'visits': return `Today's Visits - ${selectedHospital?.name}`;
      case 'patients': return 'Patient Records';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };


  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setSearchParams(prev => {
        prev.set('hospitalId', hospital.id);
        return prev;
    });
  };

  const handleBackToSelection = () => {
    setSelectedHospital(null);
    setSearchParams(prev => {
        prev.delete('hospitalId');
        return prev;
    });
  };

  return (
    <DashboardLayout
      menuItems={receptionistMenuItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pageTitle={getPageTitle()}
    >
      {activeTab === 'appointments' && (
        <>
          {!selectedHospital ? (
            <HospitalSelector
              onSelect={handleHospitalSelect}
              title="Select Hospital"
              description="Choose the hospital to view today's appointments"
            />
          ) : (
            <AppointmentsTab 
              hospitalId={selectedHospital.id}
              onBack={handleBackToSelection}
            />
          )}
        </>
      )}

      {activeTab === 'visits' && (
        <>
          {!selectedHospital ? (
            <HospitalSelector
              onSelect={handleHospitalSelect}
              title="Select Hospital"
              description="Choose the hospital to view today's visits"
            />
          ) : (
            <VisitsTab hospitalId={selectedHospital.id} />
          )}
        </>
      )}
      
      {activeTab === 'patients' && (
        <div className="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
          <Users className="mr-2 h-8 w-8 opacity-50" />
          Patient Records (Coming Soon)
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
          <Settings className="mr-2 h-8 w-8 opacity-50" />
          Settings (Coming Soon)
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;
