import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams, useLocation, Outlet } from 'react-router-dom';
import './BookingApp.css';
import ConsultationTypeStep from './components/ConsultationTypeStep';
import HospitalSelectionStep from './components/HospitalSelectionStep';
import SlotSelectionStep from './components/SlotSelectionStep';
import DoctorSelectionStep from './components/DoctorSelectionStep';
import PaymentStep from './components/PaymentStep';
import SuccessStep from './components/SuccessStep';
import { getLeadById, updateLeadStatus, type ILead, type PublicSlot, type SlotLockResult } from '@/services/api';
import type { Hospital } from '@/services/mocks/hospitalData';
import type { Doctor } from '@/services/mocks/doctorData';

// --- Types ---
// Keeping the same types for consistency, though some might be redundant with URL state
export type ConsultationType = 'online' | 'offline';

export interface BookingState {
    leadId: string | null;
    appointmentId: string | null;
    type: ConsultationType;
    isFree: boolean;
    hospital: {
        id: string;
        name: string;
        city: string;
    } | null;
    doctor: {
        id: string;
        name: string;
        specialty: string;
    } | null;
    slot: {
        startTime: string;
    } | null;
}

// --- Lead Context ---
export const LeadContext = React.createContext<{ leadData: ILead | null }>({ leadData: null });

// --- Components ---

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
    <p>{message}</p>
  </div>
);

const ErrorScreen = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500 text-center p-6">
    <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
      <span className="text-2xl">⚠️</span>
    </div>
    <h3 className="text-xl font-bold mb-2">Access Denied</h3>
    <p>{message}</p>
  </div>
);

// --- Lead Guard ---
const LeadGuard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
  const [leadData, setLeadData] = useState<ILead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyLead = async () => {
      if (!leadId) {
        setError("No Lead ID provided.");
        setLoading(false);
        return;
      }

      try {
        const data = await getLeadById(leadId);
        if (!data) {
          setError("Lead not found.");
        } else {
          setLeadData(data);
        }
      } catch (err) {
        console.error("Error fetching lead:", err);
        setError("Invalid Lead ID or Lead not found.");
      } finally {
        setLoading(false);
      }
    };

    verifyLead();
  }, [leadId]);

  if (loading) return <LoadingScreen message="Verifying lead details..." />;
  if (error || !leadId) return <ErrorScreen message={error || "Missing Lead ID"} />;

  // Pass leadData down via Outlet context or just render Outlet
  // We can treat this as a layout
  return (
    <div className="booking-app-wrapper">
      <div className="booking-container">
        <div className="booking-nav">
          <div className="booking-logo">Ayurvishwa Healthcare</div>
          <div className="text-right">
             <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-primary">{leadData?.name}</span>
                <span className="text-[10px] text-muted-foreground">{leadData?.phoneNumber} | {leadData?.city}</span>
              </div>
          </div>
        </div>

        <div className="booking-card-main">
          {/* Progress Bar could be computed based on current path */}
          <BookingProgressBar />
          
          <div className="booking-step-content">
             <Outlet context={{ leadData }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingProgressBar = () => {
  const location = useLocation();
  const path = location.pathname;
  
  let progress = 0;
  if (path.includes('type')) progress = 20;
  else if (path.includes('hospital') || path.includes('doctor')) progress = 40;
  else if (path.includes('slot')) progress = 60;
  else if (path.includes('payment')) progress = 80;
  else if (path.includes('success')) progress = 100;

  return (
    <div className="booking-progress-bar">
      <div 
        className="booking-progress-fill" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// --- Page Components ---

const TypePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <ConsultationTypeStep 
      onSelect={(type) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('type', type);
        // Navigate based on type
        if (type === 'offline') {
           navigate(`../hospital?${newParams.toString()}`);
        } else {
           navigate(`../doctor?${newParams.toString()}`);
        }
      }} 
    />
  );
}

const HospitalPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  return (
    <HospitalSelectionStep 
      onSelect={(hospital) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('hospitalId', hospital.id);
        newParams.set('hospitalName', hospital.name);
        newParams.set('hospitalCity', hospital.city);
        navigate(`../slot?${newParams.toString()}`);
      }}
      onBack={() => navigate(-1)}
    />
  );
}

const DoctorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <DoctorSelectionStep 
      onSelect={(doctor, duration, amount, isFree) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('doctorId', doctor.id);
        newParams.set('doctorName', doctor.name);
        newParams.set('doctorSpecialty', doctor.specialty);
        newParams.set('amount', amount.toString());
        newParams.set('duration', duration.toString());
        newParams.set('isFree', isFree.toString());
        
        if (isFree) {
            navigate(`../success?${newParams.toString()}`);
        } else {
            navigate(`../payment?${newParams.toString()}`);
        }
      }}
      onBack={() => navigate(-1)}
    />
  );
}

const SlotPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hospitalId = searchParams.get('hospitalId');

  if (!hospitalId) return <Navigate to="../hospital" replace />;

  return (
    <SlotSelectionStep 
      hospitalId={hospitalId}
      onSelect={(slot, lockResult) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('slotId', slot.id);
        newParams.set('slotTime', slot.startTime);
        if (lockResult) {
            newParams.set('lockId', lockResult.lockId);
        }
        navigate(`../payment?${newParams.toString()}`);
      }}
      onBack={() => navigate(-1)}
      // Pass back currently selected slotId if needed? 
    />
  );
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { leadData } = React.useContext(LeadContext);

  if (!leadData) return null;

  return (
    <PaymentStep 
      amount={Number(searchParams.get('amount') || 0)}
      duration={Number(searchParams.get('duration') || 0)}
      lockId={searchParams.get('lockId')}
      leadId={leadData._id}
      bookingData={{
        name: leadData.name,
        email: leadData.email,
        phoneNo: leadData.phoneNumber,
        healthIssue: leadData.healthIssue || "General Consultation",
        doctorId: searchParams.get('doctorId') || undefined,
        doctorName: searchParams.get('doctorName') || undefined
      }}
      onSuccess={(appointmentId) => {
        const newParams = new URLSearchParams(searchParams);
        if (appointmentId) newParams.set('appointmentId', appointmentId);
        navigate(`../success?${newParams.toString()}`);
      }}
      onBack={() => navigate(-1)}
    />
  );
}

const SuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Reconstruct state for SuccessStep
    const state: any = {
        leadId: searchParams.get('leadId'),
        appointmentId: searchParams.get('appointmentId'),
        type: searchParams.get('type') as ConsultationType,
        isFree: searchParams.get('isFree') === 'true',
        
        hospital: searchParams.get('hospitalId') ? {
            id: searchParams.get('hospitalId'),
            name: searchParams.get('hospitalName') || '',
            city: searchParams.get('hospitalCity') || '',
        } : null,
        
        doctor: searchParams.get('doctorId') ? {
            id: searchParams.get('doctorId'),
            name: searchParams.get('doctorName') || '',
            specialty: searchParams.get('doctorSpecialty') || '',
        } : null,
        
        slot: searchParams.get('slotTime') ? {
            startTime: searchParams.get('slotTime'),
            // other props might be undefined but SuccessStep only uses startTime for date/time
        } : null,
    };

    return (
        <SuccessStep state={state} onReset={() => {
            const newParams = new URLSearchParams();
            if (state.leadId) newParams.set('leadId', state.leadId);
            navigate(`../type?${newParams.toString()}`);
        }} />
    )
}

// Updating LeadGuard to provide Context
const LeadGuardWithContext = () => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
  const [leadData, setLeadData] = useState<ILead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
        if (!leadId) {
            setError("No Lead ID provided");
            setLoading(false);
            return;
        }
        try {
            const data = await getLeadById(leadId);
            if (!data) setError("Lead not found");
            else setLeadData(data);
        } catch (e) {
            setError("Error fetching lead");
        } finally {
            setLoading(false);
        }
    };
    fetchLead();
  }, [leadId]);

  if (loading) return <LoadingScreen message="Loading..." />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <LeadContext.Provider value={{ leadData }}>
         <div className="booking-app-wrapper">
          <div className="booking-container">
            <div className="booking-nav">
              <div className="booking-logo">Ayurvishwa Healthcare</div>
              <div className="text-right">
                 <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-primary">{leadData?.name}</span>
                    <span className="text-[10px] text-muted-foreground">{leadData?.phoneNumber} | {leadData?.city}</span>
                  </div>
              </div>
            </div>
            <div className="booking-card-main">
              <BookingProgressBar />
              <div className="booking-step-content">
                 <Outlet />
              </div>
            </div>
          </div>
        </div>
    </LeadContext.Provider>
  );
}

const IndexRedirect = () => {
  const [params] = useSearchParams();
  return <Navigate to={`type?${params.toString()}`} replace />;
};

const BookingApp: React.FC = () => {
  return (
    <Routes>
      <Route element={<LeadGuardWithContext />}>
        <Route path="/" element={<IndexRedirect />} />
        <Route path="type" element={<TypePage />} />
        <Route path="hospital" element={<HospitalPage />} />
        <Route path="doctor" element={<DoctorPage />} />
        <Route path="slot" element={<SlotPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="success" element={<SuccessPage />} />
      </Route>
    </Routes>
  );
};

export default BookingApp;
