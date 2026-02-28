import React, { useState } from 'react';
import { searchVisitByToken, getPatientHistory, getVisitSlipById, type Metadata } from '@/services/api';
import type { Visit } from '@/services/mocks/visitData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Loader2, User, Phone, MapPin, Calendar, Hash, Printer, Edit2 } from 'lucide-react';
import PatientHistory from './PatientHistory';
import VisitForm from './VisitForm';
import PatientSlipModal from '@/components/shared/PatientSlipModal';
import toast from 'react-hot-toast';

import { calculateAge } from '@/utils/dateUtils';

interface SearchTabProps {
  hospitalId: string;
  metadata: Metadata | null;
}

const SearchTab: React.FC<SearchTabProps> = ({ hospitalId, metadata }) => {
  const [tokenNumber, setTokenNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [history, setHistory] = useState<Visit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Slip Modal State
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);
  const [slipLoading, setSlipLoading] = useState(false);

  const handleSearch = async () => {
    if (!tokenNumber.trim()) {
      toast.error('Please enter a token number');
      return;
    }

    setLoading(true);
    setVisit(null);
    setHistory([]);
    setShowForm(false);
    
    try {
      const result = await searchVisitByToken(parseInt(tokenNumber), hospitalId);
      if (result) {
        setVisit(result);
        setShowForm(result.status === 'waiting');
        fetchHistory(result.patientId);
      } else {
        toast.error('No visit found for this token today');
      }
    } catch (error) {
      toast.error('Failed to search visit');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (patientId: string) => {
    setHistoryLoading(true);
    try {
      const result = await getPatientHistory(patientId);
      setHistory(result);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleVisitSuccess = () => {
    if (visit) {
      setVisit({ ...visit, status: 'done' });
      setShowForm(false);
      fetchHistory(visit.patientId);
    }
  };

  const handlePrintSlip = async () => {
    if (!visit) return;
    setSlipLoading(true);
    try {
      const slip = await getVisitSlipById(visit.id);
      if (slip) {
        setSlipData(slip);
        setShowSlipModal(true);
      }
    } catch (error) {
      toast.error('Failed to fetch slip data');
    } finally {
      setSlipLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Visit
          </CardTitle>
          <CardDescription>Enter the token number to retrieve patient details and history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 max-w-md">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Token Number (e.g., 1)"
                value={tokenNumber}
                onChange={(e) => setTokenNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {visit && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Patient Details Card */}
          <div className="xl:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{visit.patientName}</h2>
                  <Badge variant="outline">{visit.patient.patientId}</Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {visit.phoneNumber}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {calculateAge(visit.dob)} yrs, {visit.sex}
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    {visit.address}
                  </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Current Visit</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center p-0">
                          {visit.tokenNumber}
                        </Badge>
                        <span className="text-sm font-medium">Token Number</span>
                      </div>
                      <Badge className={visit.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                        {visit.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {visit.status === 'done' && (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowForm(!showForm)}
                          className="w-full text-primary border-primary/20 hover:bg-primary/5"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          {showForm ? 'Hide Form' : 'Edit Visit Details'}
                        </Button>
                        <Button 
                          variant="default" 
                          onClick={handlePrintSlip}
                          disabled={slipLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          {slipLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
                          Print Patient Slip
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Section */}
          <div className="xl:col-span-2 space-y-6">
            {showForm && (
              <VisitForm 
                visitId={visit.id} 
                onSuccess={handleVisitSuccess} 
                metadata={metadata} 
                initialData={visit.medicalHistory}
                lastVisit={history.length > 0 ? history[0] : null}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-md">Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading history...</p>
                  </div>
                ) : (
                  <PatientHistory visits={history} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Slip Modal */}
      {showSlipModal && slipData && (
        <PatientSlipModal
          isOpen={showSlipModal}
          onClose={() => setShowSlipModal(false)}
          slipData={slipData}
        />
      )}
    </div>
  );
};

export default SearchTab;
