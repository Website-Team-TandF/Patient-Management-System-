import React, { useState, useEffect } from 'react';
import { getPatients, getPatientHistory } from '@/services/api';
import type { Patient } from '@/services/mocks/patientData';
import type { Visit } from '@/services/mocks/visitData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, User, Phone, Calendar, History, ClipboardList } from 'lucide-react';
import PatientHistory from './PatientHistory';
import toast from 'react-hot-toast';

const PatientsTab: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<Visit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const result = await getPatients(page, limit);
      setPatients(result.data);
      setTotal(result.total);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const result = await getPatientHistory(patient.id);
      setHistory(result);
    } catch (error) {
      toast.error('Failed to load patient history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient Records
            </CardTitle>
            <Badge variant="secondary">{total} total patients</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No patient records found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Age/Sex</TableHead>
                      <TableHead>Visits</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{patient.id}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">DOB: {patient.dob}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {patient.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {patient.age} yrs, {patient.sex}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <ClipboardList className="h-3 w-3" />
                            {patient.totalVisits}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm truncate max-w-[150px]">
                            {patient.address.street}, {patient.address.city}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleViewHistory(patient)}
                          >
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <History className="h-5 w-5 text-primary" />
              Medical History - {selectedPatient?.name}
              <Badge variant="outline" className="ml-2">{selectedPatient?.id}</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Loading medical history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No History Found</p>
                <p className="text-sm text-muted-foreground">This patient has no recorded past visits.</p>
              </div>
            ) : (
              <PatientHistory visits={history} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientsTab;
