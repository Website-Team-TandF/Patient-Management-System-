import React, { useState, useEffect } from 'react';
import type { Appointment } from '@/services/mocks/appointmentData';
import type { Patient } from '@/services/mocks/patientData';
import { 
  searchPatientById, 
  createPatient, 
  createVisit, 
  checkInAppointment, 
  createOfflineVisit,
  getVisitSlipById
} from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UserPlus, UserSearch, Loader2, CheckCircle, ArrowLeft, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { calculateAge } from '@/utils/dateUtils';
import PatientSlipModal from '@/components/shared/PatientSlipModal';

interface CheckInPanelProps {
  selectedAppointment: Appointment | null;
  hospitalId: string;
  onComplete: () => void;
  onRefresh?: () => void;
  onCancel: () => void;
}

type Step = 'choose' | 'old_search' | 'old_confirm' | 'new_form' | 'complete';

const REFERRAL_SOURCES = [
  "YouTube", 
  "Facebook", 
  "Instagram", 
  "Google", 
  "Friends", 
  "Family", 
  "Advertisement", 
  "Word of Mouth", 
  "News", 
  "Healthcare Provider"
];

const CheckInPanel: React.FC<CheckInPanelProps> = ({ selectedAppointment, hospitalId, onComplete, onRefresh, onCancel }) => {
  const [step, setStep] = useState<Step>('choose');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  // Old patient flow
  const [patientId, setPatientId] = useState('');
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  
  // New patient flow
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    phoneNumber: '',
    sex: '' as 'Male' | 'Female' | 'Other' | '',
    dob: '',
    referralSource: '',
    street: '',
    city: '',
    state: '',
  });

  // Success state for offline visit
  const [visitResult, setVisitResult] = useState<{ visitId: string, tokenNumber: number } | null>(null);
  const [showSlip, setShowSlip] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);

  // Reset state when a new appointment is selected to prevent state carryover from offline visits
  useEffect(() => {
    if (selectedAppointment) {
      resetState();
    }
  }, [selectedAppointment]);

  const resetState = () => {
    setStep('choose');
    setPatientId('');
    setFoundPatient(null);
    setIsOffline(false);
    setVisitResult(null);
    setNewPatientForm({
      name: '',
      phoneNumber: '',
      sex: '',
      dob: '',
      referralSource: '',
      street: '',
      city: '',
      state: '',
    });
  };

  const handleSearchOldPatient = async () => {
    if (!patientId.trim()) {
      toast.error('Please enter Patient ID');
      return;
    }
    setLoading(true);
    try {
      const patient = await searchPatientById(patientId.trim());
      if (patient) {
        setFoundPatient(patient);
        setStep('old_confirm');
      } else {
        toast.error('Patient not found. Try creating a new patient.');
      }
    } catch (error) {
      toast.error('Failed to search patient');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOldPatient = async () => {
    if (!foundPatient) return;
    setLoading(true);
    try {
      if (isOffline) {
        const result = await createOfflineVisit(foundPatient.id, hospitalId);
        setVisitResult(result);
        toast.success(`Offline visit created! Token: #${result.tokenNumber}`);
      } else if (selectedAppointment) {
        await checkInAppointment(selectedAppointment.id);
        const result = await createVisit(selectedAppointment.id, foundPatient.id);
        setVisitResult(result);
        toast.success('Check-in complete! Visit created.');
        if (onRefresh) onRefresh();
      }
      setStep('complete');
    } catch (error) {
      toast.error('Failed to complete visit creation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPatient = async () => {
    const { name, phoneNumber, sex, dob, referralSource, street, city, state } = newPatientForm;
    
    if (!name || !phoneNumber || !sex || !dob || !city || !state) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const patient = await createPatient({
        name,
        phoneNumber,
        sex: sex as 'Male' | 'Female' | 'Other',
        dob,
        referralSource,
        address: { street, city, state }
      });
      
      if (isOffline) {
        const result = await createOfflineVisit(patient.id, hospitalId);
        setVisitResult(result);
        toast.success(`Patient created & visit assigned! Token: #${result.tokenNumber}`);
      } else if (selectedAppointment) {
        await checkInAppointment(selectedAppointment.id);
        const result = await createVisit(selectedAppointment.id, patient.id);
        setVisitResult(result);
        toast.success(`Patient ${patient.id} created & checked in!`);
        if (onRefresh) onRefresh();
      }
      
      setStep('complete');
    } catch (error) {
      toast.error('Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintSlip = async () => {
    if (!visitResult) return;
    setLoading(true);
    try {
      const data = await getVisitSlipById(visitResult.visitId);
      setSlipData(data);
      setShowSlip(true);
    } catch (error) {
      toast.error('Failed to fetch slip');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedAppointment && !isOffline) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
          <div className="flex flex-col items-center opacity-30">
            <UserSearch className="h-12 w-12 mb-2" />
            <p className="text-center">Select an appointment to begin check-in</p>
          </div>
          <Separator className="w-1/2" />
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setIsOffline(true)}
          >
            <UserPlus className="h-4 w-4" />
            Offline Visit (Walk-in)
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {isOffline ? 'Offline Visit' : 'Check-In'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => { resetState(); onCancel(); }}>
            Cancel
          </Button>
        </div>
        {!isOffline && selectedAppointment && (
          <>
            <CardDescription>
              <Badge variant="outline" className="mr-2">{selectedAppointment.id}</Badge>
              {selectedAppointment.patientName}
            </CardDescription>
            <div className="text-xs text-muted-foreground">
              {format(parseISO(selectedAppointment.startTime), 'h:mm a')} - Slot #{selectedAppointment.slotNumber}
            </div>
          </>
        )}
        {isOffline && (
          <CardDescription>Walk-in patient without appointment</CardDescription>
        )}
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        {/* Step: Choose Old/New */}
        {step === 'choose' && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-center">Is patient old or new?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => setStep('old_search')}
              >
                <UserSearch className="h-6 w-6" />
                Old Patient
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => {
                  if (!isOffline && selectedAppointment) {
                    setNewPatientForm(f => ({
                      ...f,
                      name: selectedAppointment.patientName,
                      phoneNumber: selectedAppointment.phoneNumber,
                    }));
                  }
                  setStep('new_form');
                }}
              >
                <UserPlus className="h-6 w-6" />
                New Patient
              </Button>
            </div>
          </div>
        )}

        {/* Step: Old Patient Search */}
        {step === 'old_search' && (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('choose')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="space-y-2">
              <Label>Patient ID</Label>
              <Input
                placeholder="e.g., PAT001"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <Button onClick={handleSearchOldPatient} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserSearch className="h-4 w-4 mr-2" />}
              Search Patient
            </Button>
            <div className="text-center">
              <Button variant="link" onClick={() => setStep('new_form')}>
                Create new patient instead
              </Button>
            </div>
          </div>
        )}

        {/* Step: Old Patient Confirm */}
        {step === 'old_confirm' && foundPatient && (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('old_search')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="font-semibold">{foundPatient.name}</p>
              <p className="text-sm text-muted-foreground">{foundPatient.phoneNumber}</p>
              <p className="text-sm text-muted-foreground">
                {calculateAge(foundPatient.dob)} yrs, {foundPatient.sex}
              </p>
              <Badge variant="secondary">{foundPatient.id}</Badge>
            </div>
            <Button onClick={handleConfirmOldPatient} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Confirm & Create Visit
            </Button>
          </div>
        )}

        {/* Step: New Patient Form */}
        {step === 'new_form' && (
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={() => setStep('choose')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Full Name *</Label>
                <Input
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Phone *</Label>
                <Input
                  value={newPatientForm.phoneNumber}
                  onChange={(e) => setNewPatientForm(f => ({ ...f, phoneNumber: e.target.value }))}
                />
              </div>
              <div className="col-span-1 space-y-1">
                <Label>Sex *</Label>
                <Select
                  value={newPatientForm.sex}
                  onValueChange={(v) => setNewPatientForm(f => ({ ...f, sex: v as 'Male' | 'Female' | 'Other' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 space-y-1">
                <Label>Referral Source</Label>
                <Select
                  value={newPatientForm.referralSource}
                  onValueChange={(v) => setNewPatientForm(f => ({ ...f, referralSource: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRAL_SOURCES.map(src => (
                      <SelectItem key={src} value={src}>{src}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={newPatientForm.dob}
                  onChange={(e) => setNewPatientForm(f => ({ ...f, dob: e.target.value }))}
                />
                <p className="text-[10px] text-muted-foreground px-1">
                  Age will be calculated automatically: {calculateAge(newPatientForm.dob) || '-'} yrs
                </p>
              </div>
              <Separator className="col-span-2 my-1" />
              <div className="col-span-2 space-y-1">
                <Label>Street</Label>
                <Input
                  value={newPatientForm.street}
                  onChange={(e) => setNewPatientForm(f => ({ ...f, street: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>City *</Label>
                <Input
                  value={newPatientForm.city}
                  onChange={(e) => setNewPatientForm(f => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>State *</Label>
                <Input
                  value={newPatientForm.state}
                  onChange={(e) => setNewPatientForm(f => ({ ...f, state: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={handleCreateNewPatient} disabled={loading} className="w-full mt-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {isOffline ? 'Create Patient & Assign Visit' : 'Create Patient & Check In'}
            </Button>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center py-8 text-green-600 space-y-4">
            <CheckCircle className="h-16 w-16 mb-2" />
            <div className="text-center">
              <p className="font-semibold text-lg">
                {isOffline ? 'Visit Created!' : 'Check-In Complete!'}
              </p>
              <p className="text-sm text-muted-foreground">Visit record is ready for doctor examination.</p>
              {visitResult && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-800 uppercase font-bold tracking-wider">Token Number</p>
                  <p className="text-3xl font-black text-green-700">#{visitResult.tokenNumber}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col w-full gap-2">
              <Button onClick={() => { resetState(); onComplete(); }} className="w-full">
                Close
              </Button>
              {visitResult && (
                <Button variant="outline" onClick={handlePrintSlip} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
                  Print Patient Slip
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {showSlip && slipData && (
        <PatientSlipModal 
          isOpen={showSlip}
          onClose={() => setShowSlip(false)}
          slipData={slipData}
        />
      )}
    </Card>
  );
};

export default CheckInPanel;
