import React, { useState, useEffect } from 'react';
import { getAdminAppointments, getAdminAppointmentAnalysis } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Loader2, 
  Calendar, 
  Clock, 
  Hospital as HospitalIcon, 
  User, 
  Phone, 
  Fingerprint,
  BarChart3,
  LayoutList,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const AdminAppointmentsTab: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'analysis'>('analysis');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (view === 'list') {
      fetchAppointments();
    } else {
      fetchAnalysis();
    }
  }, [view, page]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const result = await getAdminAppointments(page, limit);
      setAppointments(result.data);
      setTotal(result.total);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const data = await getAdminAppointmentAnalysis();
      setAnalysis(data);
    } catch (error) {
      toast.error('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Appointments Management</h2>
          <p className="text-muted-foreground">
            View and analyze all future appointments across hospitals.
          </p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
            className="rounded-md"
          >
            <LayoutList className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button
            variant={view === 'analysis' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('analysis')}
            className="rounded-md"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analysis View
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                A detailed list of all appointments from today onwards.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-sm">
              Total: {total}
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-3" />
                <p className="text-muted-foreground font-medium">No upcoming appointments found</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[200px]">Patient Details</TableHead>
                        <TableHead>Appointment ID</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Hospital</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((apt) => (
                        <TableRow key={apt.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center font-bold text-primary">
                                <User className="h-3 w-3 mr-1.5 opacity-70" />
                                {apt.name}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 mr-1.5 opacity-70" />
                                {apt.phoneNo}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center font-mono text-xs bg-slate-100 px-2 py-1 rounded w-fit border border-slate-200">
                              <Fingerprint className="h-3 w-3 mr-1.5 text-slate-500" />
                              {apt.appointmentId}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center text-sm font-medium">
                                <Calendar className="h-3.5 w-3.5 mr-2 text-primary/70" />
                                {format(parseISO(apt.appointmentDate), 'dd MMM yyyy')}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground ml-5">
                                <Clock className="h-3 w-3 mr-1.5" />
                                {format(parseISO(apt.slotStartTime), 'hh:mm a')} - {format(parseISO(apt.slotEndTime), 'hh:mm a')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center text-sm font-medium">
                                <HospitalIcon className="h-3.5 w-3.5 mr-2 text-primary/70" />
                                {apt.hospitalName}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground ml-5">
                                <MapPin className="h-3 w-3 mr-1.5" />
                                {apt.hospitalCity}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                apt.status === 'booked' 
                                  ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100' 
                                  : apt.status === 'checked_in'
                                  ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
                                  : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100'
                              }
                            >
                              {apt.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-6">
                  <p className="text-sm text-muted-foreground font-medium">
                    Showing page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                      className="h-8 shadow-sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                      className="h-8 shadow-sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Appointment Distribution Analysis</CardTitle>
            <CardDescription>
              Aggregated daily appointment counts per hospital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analysis.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-lg text-muted-foreground font-medium">
                No data available for analysis
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-center">Total Appointments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-2 text-primary/70" />
                            {format(parseISO(row.date), 'dd MMM yyyy, EEEE')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center font-medium">
                            <HospitalIcon className="h-3.5 w-3.5 mr-2 text-primary/70" />
                            {row.hospitalName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mr-2 opacity-70" />
                            {row.hospitalCity}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="px-4 py-1.5 text-base font-black">
                            {row.count}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAppointmentsTab;
