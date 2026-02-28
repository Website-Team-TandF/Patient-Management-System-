import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { getUnconvertedLeads } from '@/services/api';
import toast from 'react-hot-toast';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  city: string;
  healthIssue: string;
  createdAt: string;
}

const LeadsTab: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await getUnconvertedLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Missed Opportunities (Last 7 Days)</span>
            <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            These are potential patients who filled the form but did NOT convert (book an appointment).
            Does not include people who have booked using the same phone number in the last 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
              <User className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-slate-800">No missed leads found!</p>
              <p className="text-sm text-slate-500">Everyone seems to be converting, or no leads in the last 7 days.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead) => (
                <div key={lead._id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <User className="h-24 w-24" />
                  </div>
                  
                  <div className="relative pr-8">
                    <h3 className="font-bold text-lg mb-1 truncate" title={lead.name}>{lead.name}</h3>
                    
                    <div className="space-y-2 text-sm text-slate-600 mt-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[var(--booking-primary)]" />
                        <span>{lead.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-[var(--booking-primary)]" />
                         <span className="truncate">{lead.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <AlertCircle className="h-4 w-4 text-[var(--booking-primary)]" />
                         <span className="truncate max-w-[200px]" title={lead.healthIssue}>
                           {lead.healthIssue || 'No specific issue listed'}
                         </span>
                      </div>
                       <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 pt-2 border-t">
                         <Calendar className="h-3 w-3" />
                         <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsTab;
