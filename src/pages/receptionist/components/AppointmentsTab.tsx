import React, { useState, useEffect } from 'react';
import { getTodaysAppointments, filterAppointmentById, getVisitSlipById } from '@/services/api';
import type { Appointment } from '@/services/mocks/appointmentData';
import { format, parseISO } from 'date-fns';
import { Search, Loader2, CheckCircle, XCircle, Clock, ArrowLeft, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import toast from 'react-hot-toast';
import CheckInPanel from './CheckInPanel';
import PatientSlipModal from '@/components/shared/PatientSlipModal';

const statusConfig = {
  booked: { label: 'Booked', color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100', icon: Clock },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-100', icon: XCircle },
  checked_in: { label: 'Checked', color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100', icon: CheckCircle },
};

interface AppointmentsTabProps {
  hospitalId: string;
  onBack: () => void;
}

const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ hospitalId, onBack }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchId, setSearchId] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const limit = 5;

  // Slip Modal State
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);
  const [slipLoading, setSlipLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [page, hospitalId]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const result = await getTodaysAppointments(hospitalId, page, limit);
      setAppointments(result.data);
      setTotal(result.total);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      fetchAppointments();
      return;
    }
    setLoading(true);
    try {
      const result = await filterAppointmentById(searchId.trim());
      if (result) {
        setAppointments([result]);
        setTotal(1);
      } else {
        setAppointments([]);
        setTotal(0);
        toast.error('Appointment not found');
      }
    } catch (error) {
      toast.error('Failed to search appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInClick = (appointment: Appointment) => {
    if (appointment.status !== 'booked') {
      toast.error('Only booked appointments can be checked in');
      return;
    }
    setSelectedAppointment(appointment);
  };

  const handleCheckInComplete = () => {
    setSelectedAppointment(null);
    fetchAppointments();
  };

  const handlePrintSlip = async (visitId: string) => {
    setSlipLoading(true);
    try {
      const slip = await getVisitSlipById(visitId);
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      {/* Left Panel - Appointments List */}
      <div className="lg:col-span-2 space-y-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-lg">Today's Appointments</CardTitle>
              </div>
              <Badge variant="secondary">{total} appointments</Badge>
            </div>
            {/* Search */}
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Search by Appointment ID (e.g., APT001)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
              {searchId && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearchId('');
                    fetchAppointments();
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No appointments found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Slot</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead className="whitespace-nowrap">Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => {
                      const config = (statusConfig as any)[apt.status];
                      const StatusIcon = config.icon;
                      const isSelected = selectedAppointment?.id === apt.id;
                      
                      return (
                        <TableRow 
                          key={apt.id} 
                          className={isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''}
                        >
                          <TableCell>
                            <Badge variant="outline">#{apt.slotNumber}</Badge>
                          </TableCell>
                          <TableCell>
                            <div 
                              className="font-medium truncate max-w-[200px]" 
                              title={apt.patientName}
                            >
                              {apt.patientName}
                            </div>
                            <div className="text-xs text-muted-foreground">{apt.phoneNumber}</div>
                            <div className="text-xs text-muted-foreground">{apt.id}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm">
                              {format(parseISO(apt.startTime), 'h:mm a')} - {format(parseISO(apt.endTime), 'h:mm a')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config.color} border`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {apt.status === 'checked_in' && apt.visitId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePrintSlip(apt.visitId!)}
                                  disabled={slipLoading}
                                  title="Print Slip"
                                >
                                  {slipLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3 text-primary" />}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant={isSelected ? 'default' : 'outline'}
                                disabled={apt.status !== 'booked'}
                                onClick={() => handleCheckInClick(apt)}
                              >
                                {isSelected ? 'Selected' : 'Check In'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && !searchId && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Check-In Flow */}
      <div className="lg:col-span-1">
        <CheckInPanel
          selectedAppointment={selectedAppointment}
          hospitalId={hospitalId}
          onComplete={handleCheckInComplete}
          onRefresh={fetchAppointments}
          onCancel={() => setSelectedAppointment(null)}
        />
      </div>

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

export default AppointmentsTab;
