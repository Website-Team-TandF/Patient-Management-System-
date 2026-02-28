import React, { useState, useEffect, useMemo } from 'react';
import { getHospitals } from '@/services/api';
import type { Hospital } from '@/services/mocks/hospitalData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Loader2 } from 'lucide-react';

interface HospitalSelectorProps {
  onSelect: (hospital: Hospital) => void;
  title?: string;
  description?: string;
}

const HospitalSelector: React.FC<HospitalSelectorProps> = ({
  onSelect,
  title = "Select Hospital",
  description = "Choose your hospital to continue",
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const result = await getHospitals(1, 100); // Get all hospitals
      setHospitals(result.data);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique cities
  const cities = useMemo(() => {
    const citySet = new Set(hospitals.map(h => h.city));
    return Array.from(citySet).sort();
  }, [hospitals]);

  // Filter hospitals by selected city
  const filteredHospitals = useMemo(() => {
    if (!selectedCity) return [];
    return hospitals.filter(h => h.city === selectedCity);
  }, [hospitals, selectedCity]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedHospitalId(''); // Reset hospital when city changes
  };

  const handleHospitalChange = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
  };

  const handleConfirm = () => {
    const hospital = hospitals.find(h => h.id === selectedHospitalId);
    if (hospital) {
      onSelect(hospital);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* City Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              City
            </Label>
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hospital Selection - Only show after city is selected */}
          {selectedCity && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Hospital
              </Label>
              <Select value={selectedHospitalId} onValueChange={handleHospitalChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hospital" />
                </SelectTrigger>
                <SelectContent>
                  {filteredHospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filteredHospitals.length === 0 && (
                <p className="text-sm text-muted-foreground">No hospitals found in this city</p>
              )}
            </div>
          )}

          {/* Confirm Button */}
          <Button
            className="w-full"
            disabled={!selectedHospitalId}
            onClick={handleConfirm}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalSelector;
