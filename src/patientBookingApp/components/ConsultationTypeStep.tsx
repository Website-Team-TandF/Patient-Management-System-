import React from 'react';
import { Monitor, MapPin, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import type { ConsultationType } from '../BookingApp';

interface ConsultationTypeStepProps {
  onSelect: (type: ConsultationType) => void;
}

const ConsultationTypeStep: React.FC<ConsultationTypeStepProps> = ({ onSelect }) => {
  return (
    <div className="animate-fade-in flex flex-col items-center">
      <div className="text-center max-w-2xl mb-12">
        <h2 className="text-3xl font-extrabold mb-4 text-slate-900">How would you like to consult?</h2>
        <p className="text-slate-500 text-lg">Choose the most convenient way to connect with our expert Ayurvedic doctors.</p>
      </div>

      <div className="type-selection-grid w-full">
        <div className="type-card" onClick={() => onSelect('online')}>
          <div className="type-badge">Popular</div>
          <div className="type-icon-wrapper">
            <Monitor size={40} />
          </div>
          <h3>Online Consultation</h3>
          <p>Connect instantly via video call from the comfort of your home. Perfect for quick advice and follow-ups.</p>
          <div className="mt-6 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1"><Zap size={14} className="text-amber-500" /> Instant</div>
            <div className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500" /> Secure</div>
          </div>
        </div>

        <div className="type-card" onClick={() => onSelect('offline')}>
          <div className="type-icon-wrapper">
            <MapPin size={40} />
          </div>
          <h3>In-Clinic Visit</h3>
          <p>Visit our state-of-the-art facilities for a comprehensive physical examination and personalized care.</p>
          <div className="mt-6 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1"><Sparkles size={14} className="text-indigo-500" /> Premium</div>
            <div className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500" /> Safe</div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-8 w-full border-t border-slate-100 pt-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">50k+</div>
          <div className="text-sm text-slate-500">Happy Patients</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">100+</div>
          <div className="text-sm text-slate-500">Expert Doctors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">4.9/5</div>
          <div className="text-sm text-slate-500">User Rating</div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationTypeStep;
