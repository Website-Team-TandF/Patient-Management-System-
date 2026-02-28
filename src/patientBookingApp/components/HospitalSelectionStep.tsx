import React from 'react';
import HospitalSelector from '@/components/shared/HospitalSelector';
import type { Hospital } from '@/services/mocks/hospitalData';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HospitalSelectionStepProps {
  onSelect: (hospital: Hospital) => void;
  onBack: () => void;
}

const HospitalSelectionStep: React.FC<HospitalSelectionStepProps> = ({ onSelect, onBack }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Select a Hospital</h2>
          <p className="text-slate-500">Find an Ayurvishwa Healthcare clinic near you for your visit.</p>
        </div>
      </div>

      <div className="hospital-selector-wrapper">
        <HospitalSelector 
          onSelect={onSelect} 
          title="" 
          description="" 
        />
      </div>
    </div>
  );
};

export default HospitalSelectionStep;
