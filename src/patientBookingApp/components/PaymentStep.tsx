import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Loader2, ChevronLeft, Lock, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { releaseSlotLock, confirmBooking, type ConfirmBookingData } from '@/services/api';

interface PaymentStepProps {
  amount: number;
  duration?: number;
  lockId?: string | null;
  leadId: string; // Added leadId
  bookingData?: {
    name: string;
    email: string;
    phoneNo: string;
    healthIssue: string;
    doctorId: string;
    doctorName: string;
  };
  onSuccess: (appointmentId?: string) => void;
  onBack: () => void;
  onLockReleased?: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ 
  amount, 
  duration,
  lockId,
  leadId, 
  bookingData,
  onSuccess, 
  onBack,
  onLockReleased 
}) => {
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // If we have lockId and bookingData, confirm the booking
    if (lockId && bookingData) {
      try {
        const confirmData: ConfirmBookingData = {
          lockId,
          leadId,
          ...bookingData,
        };
        const result = await confirmBooking(confirmData);
        onSuccess(result.appointmentId);
      } catch (err: any) {
        console.error('Failed to confirm booking:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to confirm booking';
        setError(errorMessage);
        setProcessing(false);
        return;
      }
    } else {
      // Legacy flow without lock (online booking)
      // For now, we just proceed to success. In a real scenario, we might want to 
      // create a specific 'online appointment' record here if it doesn't use slots.
      // But given the current backend constraints, we'll assume the payment is enough 
      // or that the backend will handle it differently in a future update.
      onSuccess();
    }
    
    setProcessing(false);
  };


  const handleCancel = async () => {
    if (lockId) {
      setCancelling(true);
      try {
        await releaseSlotLock(lockId);
        onLockReleased?.();
      } catch (err) {
        console.error('Failed to release lock:', err);
      } finally {
        setCancelling(false);
      }
    }
    onBack();
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel} 
          className="rounded-full hover:bg-slate-100"
          disabled={processing || cancelling}
        >
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </Button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-[var(--booking-primary)]">Secure Payment</h2>
          <p className="text-[var(--booking-text-light)]">Complete your session booking securely.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-[var(--booking-border)] shadow-xl shadow-[var(--booking-primary)]/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--booking-primary)] to-[var(--booking-secondary)]" />
        
        <div className="mb-8 pb-6 border-b border-slate-100 space-y-4">
           {duration && (
            <div className="flex justify-between items-center bg-[var(--booking-bg)] p-4 rounded-xl border border-[var(--booking-border)]">
              <div className="flex items-center gap-2 text-[var(--booking-primary-dark)] font-medium">
                <Clock className="w-5 h-5 text-[var(--booking-secondary)]" />
                <span>Consultation Duration</span>
              </div>
              <span className="font-bold text-[var(--booking-primary)]">{duration} Mins</span>
            </div>
          )}
          
          <div className="flex justify-between items-end">
            <span className="text-[var(--booking-text-light)] font-medium text-lg">Total Fee</span>
            <span className="text-4xl font-serif font-bold text-[var(--booking-primary)]">₹{amount}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-[var(--booking-text-light)] tracking-wider">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="0000 0000 0000 0000" 
                className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-[var(--booking-primary)] focus:ring-[var(--booking-primary)] text-lg bg-slate-50/50"
                defaultValue="4242 4242 4242 4242"
                disabled={processing}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-[var(--booking-text-light)] tracking-wider">Expiry</Label>
              <Input 
                placeholder="MM/YY" 
                className="h-14 rounded-2xl border-slate-200 focus:border-[var(--booking-primary)] text-lg bg-slate-50/50"
                defaultValue="12/28"
                disabled={processing}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-[var(--booking-text-light)] tracking-wider">CVV</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="123" 
                  className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-[var(--booking-primary)] text-lg bg-slate-50/50"
                  defaultValue="123"
                  type="password"
                  disabled={processing}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handlePayment}
            disabled={processing || cancelling}
            className="w-full h-16 rounded-2xl bg-[var(--booking-primary)] hover:bg-[var(--booking-primary-dark)] text-white font-bold text-lg mt-4 shadow-lg shadow-[var(--booking-primary)]/25 transition-all hover:scale-[1.02]"
          >
            {processing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Processing Securely...
              </>
            ) : cancelling ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cancelling...
              </>
            ) : (
              `Pay ₹${amount}`
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--booking-secondary)] uppercase tracking-widest mt-4">
            <ShieldCheck size={16} /> 256-bit SSL Encrypted
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-7" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="Paypal" className="h-5" />
      </div>
    </div>
  );
};

export default PaymentStep;
