import React, { useContext } from 'react';
import { LeadContext, type BookingState } from '../BookingApp';
import { CheckCircle2, Calendar, Clock, MapPin, User, ArrowRight, Video, Home, ShieldCheck, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessStepProps {
  state: BookingState;
  onReset: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ state, onReset }) => {
  const { leadData } = useContext(LeadContext);
  
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOnline = state.type === 'online';

  const handleDownloadReceipt = () => {
    const printContent = `
      <html>
        <head>
          <title>Appointment Receipt - ${state.appointmentId}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1b4332; line-height: 1.6; }
            .header { border-bottom: 2px solid #52b788; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #1b4332; }
            .status { color: #52b788; font-weight: bold; text-transform: uppercase; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 14px; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .detail-box { background: #fdfcf4; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 12px; color: #718096; margin-bottom: 4px; }
            .value { font-weight: bold; font-size: 16px; }
            .footer { margin-top: 50px; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Ayurvishwa Healthcare</div>
            <div class="status">Confirmed</div>
          </div>
          
          <div class="section">
            <div class="section-title">Patient Details</div>
            <div class="grid">
              <div class="detail-box">
                <div class="label">Name</div>
                <div class="value">${leadData?.name || 'N/A'}</div>
              </div>
              <div class="detail-box">
                <div class="label">Phone</div>
                <div class="value">${leadData?.phoneNumber || 'N/A'}</div>
              </div>
              <div class="detail-box">
                <div class="label">Email</div>
                <div class="value">${leadData?.email || 'N/A'}</div>
              </div>
              <div class="detail-box">
                <div class="label">Appointment ID</div>
                <div class="value">${state.appointmentId || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Visit Information</div>
            <div class="grid">
              <div class="detail-box">
                <div class="label">Type</div>
                <div class="value">${isOnline ? 'Online Consultation' : 'In-Clinic Visit'}</div>
              </div>
              <div class="detail-box">
                <div class="label">${isOnline ? 'Doctor' : 'Hospital'}</div>
                <div class="value">${isOnline ? state.doctor?.name : state.hospital?.name}</div>
              </div>
              <div class="detail-box">
                <div class="label">Date</div>
                <div class="value">${state.slot ? new Date(state.slot.startTime).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString()}</div>
              </div>
              <div class="detail-box">
                <div class="label">Time</div>
                <div class="value">${state.slot ? formatTime(state.slot.startTime) : 'Flexible'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Payment Summary</div>
            <div class="detail-box">
              <div class="label">Status</div>
              <div class="value">${state.isFree ? 'Free Consultation' : 'Paid Successfully'}</div>
            </div>
          </div>

          <div class="footer">
            <p>This is an electronically generated appointment confirmation.</p>
            <p>&copy; ${new Date().getFullYear()} Ayurvishwa Healthcare. All Rights Reserved.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="animate-fade-in text-center py-8">
      <div className="flex justify-center mb-8">
        <div className="h-24 w-24 bg-[var(--booking-secondary)]/20 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="h-14 w-14 text-[var(--booking-secondary)]" />
        </div>
      </div>

      <h2 className="text-4xl font-serif font-bold text-[var(--booking-primary)] mb-4">Thank You!</h2>
      <p className="text-[var(--booking-text-light)] text-lg mb-10">Your {isOnline ? 'online consultation' : 'in-clinic visit'} has been successfully booked.</p>

      <div className="bg-white rounded-[40px] p-10 mb-10 text-left border border-[var(--booking-border)] shadow-2xl shadow-[var(--booking-primary)]/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          {isOnline ? <Video size={120} className="text-[var(--booking-primary)]" /> : <Home size={120} className="text-[var(--booking-primary)]" />}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-slate-100 gap-4">
          <div>
            <span className="text-xs font-bold uppercase text-[var(--booking-text-light)] tracking-widest block mb-1">Appointment ID</span>
            <span className="font-mono text-2xl font-black text-[var(--booking-primary)]">{state.appointmentId}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold uppercase text-[var(--booking-text-light)] tracking-widest block mb-1">Status</span>
              <span className="px-4 py-1.5 bg-[var(--booking-secondary)]/10 text-[var(--booking-secondary)] rounded-full text-sm font-bold">Confirmed</span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDownloadReceipt}
              className="rounded-full border-[var(--booking-primary)] text-[var(--booking-primary)] hover:bg-[var(--booking-primary)] hover:text-white"
            >
              <Download className="mr-2 h-4 w-4" /> Receipt
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="h-12 w-12 bg-[var(--booking-bg)] rounded-2xl flex items-center justify-center shadow-sm border border-[var(--booking-border)]">
                {isOnline ? <User className="h-6 w-6 text-[var(--booking-secondary)]" /> : <MapPin className="h-6 w-6 text-[var(--booking-secondary)]" />}
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--booking-text-light)] uppercase tracking-wider mb-1">
                  {isOnline ? 'Doctor' : 'Hospital'}
                </p>
                <p className="font-bold text-[var(--booking-primary)] text-lg">
                  {isOnline ? state.doctor?.name : state.hospital?.name}
                </p>
                <p className="text-sm text-[var(--booking-text-light)]">
                  {isOnline ? state.doctor?.specialty : state.hospital?.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="h-12 w-12 bg-[var(--booking-bg)] rounded-2xl flex items-center justify-center shadow-sm border border-[var(--booking-border)]">
                <Calendar className="h-6 w-6 text-[var(--booking-secondary)]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--booking-text-light)] uppercase tracking-wider mb-1">Date</p>
                <p className="font-bold text-[var(--booking-primary)] text-lg">
                  {state.slot 
                    ? new Date(state.slot.startTime).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
                    : new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="h-12 w-12 bg-[var(--booking-bg)] rounded-2xl flex items-center justify-center shadow-sm border border-[var(--booking-border)]">
                <Clock className="h-6 w-6 text-[var(--booking-secondary)]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--booking-text-light)] uppercase tracking-wider mb-1">Time</p>
                <p className="font-bold text-[var(--booking-primary)] text-lg">
                  {state.slot ? formatTime(state.slot.startTime) : 'Flexible'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="h-12 w-12 bg-[var(--booking-bg)] rounded-2xl flex items-center justify-center shadow-sm border border-[var(--booking-border)]">
                <ShieldCheck className="h-6 w-6 text-[var(--booking-secondary)]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--booking-text-light)] uppercase tracking-wider mb-1">Payment</p>
                <p className="font-bold text-[var(--booking-primary)] text-lg">
                  {state.isFree ? 'Free Consultation' : 'Paid Successfully'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Button 
          onClick={onReset}
          className="h-16 px-10 rounded-2xl bg-[var(--booking-primary)] hover:bg-[var(--booking-primary-dark)] text-white font-bold text-lg shadow-xl shadow-[var(--booking-primary)]/20 flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          Return to Home
          <ArrowRight size={20} />
        </Button>
        <p className="text-[var(--booking-text-light)] text-sm">
          A confirmation email and SMS have been sent to your registered contact.
        </p>
      </div>
    </div>
  );
};

export default SuccessStep;

