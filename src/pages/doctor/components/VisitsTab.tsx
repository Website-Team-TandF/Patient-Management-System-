import React, { useState, useEffect } from 'react';
import { getDoctorVisits, getVisitSlipById } from '@/services/api';
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
import { Loader2, Clock, CheckCircle, Hash, Printer } from 'lucide-react';
import PatientSlipModal from '@/components/shared/PatientSlipModal';
import toast from 'react-hot-toast';

interface VisitsTabProps {
  hospitalId: string;
}

const VisitsTab: React.FC<VisitsTabProps> = ({ hospitalId }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Slip Modal State
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);
  const [slipLoading, setSlipLoading] = useState(false);

  useEffect(() => {
    fetchVisits();
  }, [page, hospitalId]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const result = await getDoctorVisits(hospitalId, page, limit);
      setVisits(result.data);
      setTotal(result.total);
    } catch (error) {
      toast.error('Failed to load visits');
    } finally {
      setLoading(false);
    }
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Today's Visits</CardTitle>
          <Badge variant="secondary">{total} visits</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No visits found for today
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Token</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-primary">
                          <Hash className="h-3 w-3" />
                          {visit.tokenNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{visit.patientName}</div>
                        <div className="text-xs text-muted-foreground">{visit.patientId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {visit.visitTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={visit.status === 'done' 
                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100'}
                        >
                          {visit.status === 'done' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {visit.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintSlip(visit.id)}
                          className="h-8 w-8 p-0"
                          title="Print Patient Slip"
                          disabled={slipLoading}
                        >
                          {slipLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
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

      <PatientSlipModal 
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        slipData={slipData}
      />
    </Card>
  );
};

export default VisitsTab;
