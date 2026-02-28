import React, { useState, useEffect } from 'react';
import { Edit2, Calendar, Plus, MapPin, Building2, Clock } from 'lucide-react';
import { type Hospital } from '../../../services/mocks/hospitalData';
import { getHospitals } from '../../../services/api';
import HospitalFormModal from './HospitalFormModal';
import SlotManagerModal from './SlotManagerModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const HospitalList: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await getHospitals();
      // Handle both mock (object) and real (array) responses if needed, 
      // but based on api.ts mock returns { data, total }
      const data = 'data' in response ? response.data : response;
      setHospitals(data as Hospital[]);
    } catch (error) {
      console.error('Failed to fetch hospitals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setIsFormOpen(true);
  };

  const handleManageSlots = (hospital: Hospital) => {
    setSelectedHospital(hospital);
  };

  const handleAddNew = () => {
    setEditingHospital(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hospitals</h2>
          <p className="text-muted-foreground">Manage your hospital network and appointments.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus size={16} />
          Add Hospital
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <Card key={hospital.id} className="group hover:shadow-md transition-all duration-300 border-muted/60">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">{hospital.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin size={14} className="mr-1" />
                      {hospital.city}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary/60" />
                  <span>09:00 - 21:00</span>
                </div>
                <div className="h-4 w-[1px] bg-border" />
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary/60" />
                  <span>Daily</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 hover:bg-primary/5 hover:text-primary border-muted-foreground/20"
                onClick={() => handleManageSlots(hospital)}
              >
                <Calendar size={16} />
                Slots
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => handleEdit(hospital)}
              >
                <Edit2 size={16} />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <HospitalFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchHospitals}
        hospitalToEdit={editingHospital}
      />

      {selectedHospital && (
        <SlotManagerModal
          isOpen={!!selectedHospital}
          onClose={() => setSelectedHospital(null)}
          hospital={selectedHospital}
        />
      )}
    </div>
  );
};

export default HospitalList;
