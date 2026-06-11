/**
 * ReceptionistVisitsTab
 * Shows upcoming appointments with date-range filters.
 * Includes full Check-In flow via the existing CheckInPanel.
 *
 * Filters: Today | Next Week | This Month | Next Month | Custom From→To
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addWeeks,
  addMonths,
} from 'date-fns';
import { getAppointmentsByDateRange } from '@/services/api';
import type { Appointment } from '@/services/mocks/appointmentData';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SimpleCalendar } from '@/components/ui/simple-calendar';
import {
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  CalendarRange,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CheckInPanel from './CheckInPanel';

// ─── types / helpers ─────────────────────────────────────────────────────────

type QuickFilter = 'today' | 'next-week' | 'this-month' | 'next-month' | 'custom';

const toYMD = (d: Date) => format(d, 'yyyy-MM-dd');

const statusConfig = {
  booked:     { label: 'Booked',    color: 'bg-blue-100  text-blue-700  border-blue-300',  Icon: Clock },
  cancelled:  { label: 'Cancelled', color: 'bg-red-100   text-red-700   border-red-300',   Icon: XCircle },
  checked_in: { label: 'Checked In',color: 'bg-green-100 text-green-700 border-green-300', Icon: CheckCircle },
};

interface ReceptionistVisitsTabProps {
  hospitalId: string;
}

// ─── component ────────────────────────────────────────────────────────────────

const ReceptionistVisitsTab: React.FC<ReceptionistVisitsTabProps> = ({ hospitalId }) => {
  const today = new Date();

  // ── filter state ─────────────────────────────────────────────────────────
  const [filter,     setFilter]     = useState<QuickFilter>('today');
  const [customFrom, setCustomFrom] = useState<Date>(today);
  const [customTo,   setCustomTo]   = useState<Date>(today);
  const [fromOpen,   setFromOpen]   = useState(false);
  const [toOpen,     setToOpen]     = useState(false);

  // ── check-in state ───────────────────────────────────────────────────────
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // ── compute from/to for active filter ────────────────────────────────────
  const getFromTo = useCallback((): { from: string; to: string } => {
    switch (filter) {
      case 'today':
        return { from: toYMD(today), to: toYMD(today) };
      case 'next-week': {
        const nw = addWeeks(today, 1);
        return {
          from: toYMD(startOfWeek(nw, { weekStartsOn: 1 })),
          to:   toYMD(endOfWeek(nw,   { weekStartsOn: 1 })),
        };
      }
      case 'this-month':
        return { from: toYMD(startOfMonth(today)), to: toYMD(endOfMonth(today)) };
      case 'next-month': {
        const nm = addMonths(today, 1);
        return { from: toYMD(startOfMonth(nm)), to: toYMD(endOfMonth(nm)) };
      }
      case 'custom':
        return { from: toYMD(customFrom), to: toYMD(customTo) };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, customFrom, customTo]);

  // ── data state ───────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const LIMIT = 15;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = getFromTo();
      const result = await getAppointmentsByDateRange(hospitalId, from, to, page, LIMIT);
      setAppointments(result.data);
      setTotal(result.total);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [hospitalId, page, getFromTo]);

  // reset page when filter/dates change
  useEffect(() => { setPage(1); }, [filter, customFrom, customTo]);
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const totalPages = Math.ceil(total / LIMIT);

  // ── range label ──────────────────────────────────────────────────────────
  const getRangeLabel = () => {
    const { from, to } = getFromTo();
    switch (filter) {
      case 'today':      return `Today — ${format(today, 'dd MMM yyyy')}`;
      case 'next-week':  return `Next Week — ${from} to ${to}`;
      case 'this-month': return `This Month — ${format(today, 'MMMM yyyy')}`;
      case 'next-month': return `Next Month — ${format(addMonths(today, 1), 'MMMM yyyy')}`;
      case 'custom':     return `${format(customFrom, 'dd MMM yyyy')} → ${format(customTo, 'dd MMM yyyy')}`;
    }
  };

  // ── check-in handlers ────────────────────────────────────────────────────
  const handleCheckInClick = (apt: Appointment) => {
    if (apt.status !== 'booked') {
      toast.error('Only booked appointments can be checked in');
      return;
    }
    setSelectedAppointment(apt);
  };

  const handleCheckInComplete = () => {
    setSelectedAppointment(null);
    fetchAppointments(); // refresh list
  };

  // ── quick filter buttons ─────────────────────────────────────────────────
  const quickBtns: { id: QuickFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'today',      label: 'Today',      icon: <CalendarCheck2 className="h-3.5 w-3.5" /> },
    { id: 'next-week',  label: 'Next Week',  icon: <CalendarDays   className="h-3.5 w-3.5" /> },
    { id: 'this-month', label: 'This Month', icon: <CalendarRange  className="h-3.5 w-3.5" /> },
    { id: 'next-month', label: 'Next Month', icon: <CalendarRange  className="h-3.5 w-3.5" /> },
  ];

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* ── LEFT: Appointments list ─────────────────────────────────── */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">

              {/* Title + count */}
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Visits &amp; Appointments</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{getRangeLabel()}</p>
                </div>
                <Badge variant="secondary" className="h-7 px-3 text-xs font-semibold">
                  {total} appointments
                </Badge>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Quick buttons: Today | Next Week | This Month | Next Month */}
                {quickBtns.map((btn) => (
                  <Button
                    key={btn.id}
                    variant={filter === btn.id ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => { setFilter(btn.id); setSelectedAppointment(null); }}
                  >
                    {btn.icon}
                    {btn.label}
                  </Button>
                ))}

                {/* Custom date-range picker */}
                <div className="flex items-center gap-1 border-l pl-3 ml-1">
                  <span className="text-xs text-muted-foreground">Custom:</span>

                  {/* FROM calendar */}
                  <Popover open={fromOpen} onOpenChange={setFromOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={filter === 'custom' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => setFilter('custom')}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {filter === 'custom' ? format(customFrom, 'dd MMM') : 'From'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <SimpleCalendar
                        selected={customFrom}
                        onSelect={(d) => {
                          if (!d) return;
                          setCustomFrom(d);
                          if (d > customTo) setCustomTo(d);
                          setFilter('custom');
                          setFromOpen(false);
                          setToOpen(true); // auto-open To picker next
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-muted-foreground text-xs">→</span>

                  {/* TO calendar */}
                  <Popover open={toOpen} onOpenChange={setToOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={filter === 'custom' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => setFilter('custom')}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {filter === 'custom' ? format(customTo, 'dd MMM') : 'To'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <SimpleCalendar
                        selected={customTo}
                        minDate={customFrom}
                        onSelect={(d) => {
                          if (!d) return;
                          setCustomTo(d);
                          setFilter('custom');
                          setToOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Loading spinner */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>

            /* Empty state */
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <CalendarRange className="h-10 w-10 opacity-25" />
                <p className="text-sm font-medium">No appointments found</p>
                <p className="text-xs opacity-70">for {getRangeLabel()}</p>
              </div>

            /* Appointments table */
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-16">Slot</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap">Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((apt) => {
                        const cfg = statusConfig[apt.status as keyof typeof statusConfig] ?? statusConfig.booked;
                        const StatusIcon = cfg.Icon;
                        const isSelected = selectedAppointment?.id === apt.id;

                        let dateStr = '—';
                        let timeStr = '—';
                        try {
                          const d = parseISO(apt.startTime);
                          dateStr = format(d, 'dd MMM yyyy');
                          timeStr = format(d, 'h:mm a');
                        } catch {
                          timeStr = apt.startTime ?? '—';
                        }

                        return (
                          <TableRow
                            key={apt.id}
                            className={
                              isSelected
                                ? 'bg-primary/10 border-l-4 border-l-primary'
                                : 'hover:bg-muted/30 transition-colors'
                            }
                          >
                            <TableCell>
                              <Badge variant="outline">#{apt.slotNumber}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium truncate max-w-[160px]">{apt.patientName}</div>
                              <div className="text-xs text-muted-foreground">{apt.phoneNumber}</div>
                              <div className="text-xs text-muted-foreground">{apt.id}</div>
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">{dateStr}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {timeStr}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs border ${cfg.color}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {cfg.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant={isSelected ? 'default' : 'outline'}
                                disabled={apt.status !== 'booked'}
                                onClick={() => handleCheckInClick(apt)}
                                className="text-xs h-7"
                              >
                                {isSelected ? 'Selected' : 'Check In'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} · {total} total
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── RIGHT: CheckInPanel ──────────────────────────────────────── */}
      <div className="lg:col-span-1">
        <CheckInPanel
          selectedAppointment={selectedAppointment}
          hospitalId={hospitalId}
          onComplete={handleCheckInComplete}
          onRefresh={fetchAppointments}
          onCancel={() => setSelectedAppointment(null)}
        />
      </div>

    </div>
  );
};

export default ReceptionistVisitsTab;
