import React, { useState } from 'react';
import { mockDoctors, type Doctor } from '@/services/mocks/doctorData';
import { Star, Award, Clock, ChevronLeft, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DoctorSelectionStepProps {
  onSelect: (doctor: Doctor | null, duration: number, amount: number, isFree: boolean) => void;
  onBack: () => void;
}

const DURATIONS = [
  { label: '10 Mins', value: 10, multiplier: 1 },
  { label: '15 Mins', value: 15, multiplier: 1.5 },
  { label: '30 Mins', value: 30, multiplier: 3 },
  { label: '1 Hour', value: 60, multiplier: 6 },
];

const DoctorSelectionStep: React.FC<DoctorSelectionStepProps> = ({ onSelect, onBack }) => {
  const [selectedDuration, setSelectedDuration] = useState(10);

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full text-slate-600 hover:bg-slate-100">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-[var(--booking-primary)]">Select an Expert Doctor</h2>
          <p className="text-[var(--booking-text-light)]">Consult with India's top Ayurvedic specialists online.</p>
        </div>
      </div>

      {/* Duration Selector */}
      <div className="mb-8 p-6 bg-white rounded-3xl border border-[var(--booking-border)] shadow-sm">
        <h3 className="text-lg font-bold text-[var(--booking-primary)] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Select Consultation Duration
        </h3>
        <div className="flex flex-wrap gap-4">
          {DURATIONS.map((dur) => (
            <button
              key={dur.value}
              onClick={() => setSelectedDuration(dur.value)}
              className={cn(
                "flex-1 min-w-[120px] py-4 px-6 rounded-2xl border transition-all duration-300 font-bold relative overflow-hidden group",
                selectedDuration === dur.value
                  ? "bg-[var(--booking-primary)] border-[var(--booking-primary)] text-white shadow-lg shadow-[var(--booking-primary)]/20"
                  : "bg-white border-slate-200 text-slate-600 hover:border-[var(--booking-secondary)] hover:bg-[var(--booking-secondary)]/5"
              )}
            >
              <span className="relative z-10 text-lg">{dur.label}</span>
              {selectedDuration === dur.value && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDoctors.map((doc) => {
          const multiplier = DURATIONS.find(d => d.value === selectedDuration)?.multiplier || 1;
          const totalPrice = Math.round(doc.pricing * multiplier);

          return (
            <div 
              key={doc.id} 
              className="group bg-white rounded-[32px] overflow-hidden border border-[var(--booking-border)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[var(--booking-primary)]/10 cursor-pointer flex flex-col"
              onClick={() => onSelect(doc, selectedDuration, totalPrice, false)}
            >
              <div className="h-56 relative overflow-hidden">
                <img 
                  src={doc.photo} 
                  alt={doc.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl font-bold text-[var(--booking-primary)] shadow-lg flex items-center gap-1">
                  <span className="text-xs text-[var(--booking-text-light)] font-normal mr-1">Starting at</span>
                  ₹{totalPrice}
                </div>
                
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                  <span className="text-xs font-bold text-slate-900">{doc.rating}</span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--booking-secondary)] uppercase tracking-widest mb-2">
                  <Award size={14} /> {doc.specialty}
                </div>
                <h3 className="text-xl font-serif font-bold text-[var(--booking-primary-dark)] mb-2 group-hover:text-[var(--booking-primary)] transition-colors">
                  {doc.name}
                </h3>
                <p className="text-sm text-[var(--booking-text-light)] line-clamp-2 mb-6 leading-relaxed">
                  {doc.description}
                </p>
                
                <div className="mt-auto pt-6 border-t border-[var(--booking-border)] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock size={14} /> {doc.experience} Experience
                  </div>
                  <div className="flex items-center gap-2 text-[var(--booking-primary)] font-bold text-sm group-hover:translate-x-1 transition-transform">
                    Book Session <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 p-1 bg-gradient-to-r from-[var(--booking-primary)] to-[var(--booking-secondary)] rounded-[32px] shadow-2xl shadow-[var(--booking-primary)]/20">
        <div className="bg-[var(--booking-bg)] rounded-[30px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--booking-secondary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex items-center gap-8">
            <div className="h-24 w-24 bg-[var(--booking-primary)]/10 backdrop-blur-sm rounded-3xl flex items-center justify-center rotate-3 group transition-transform hover:rotate-6">
              <Gift size={40} className="text-[var(--booking-primary)]" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-[var(--booking-primary)] mb-2">First Consultation Free?</h3>
              <p className="text-[var(--booking-text-light)] max-w-md">Experience the healing power of Ayurveda with a complimentary 5-minute introductory session with our available expert.</p>
            </div>
          </div>
          
          <Button 
            onClick={() => onSelect(null, 5, 0, true)}
            className="relative z-10 bg-[var(--booking-primary)] hover:bg-[var(--booking-primary-dark)] text-white h-16 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-[var(--booking-primary)]/30 transition-all hover:-translate-y-1"
          >
            Claim Free Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSelectionStep;
