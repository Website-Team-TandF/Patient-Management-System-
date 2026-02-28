import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Stethoscope, 
  Activity, 
  Calendar, 
  TrendingUp, 
  BarChart,
  Loader2,
  Clock
} from 'lucide-react';
import { 
  getHospitalAnalytics, 
  getDiseaseAnalytics, 
  getTreatmentAnalytics,
  type HospitalAnalytics,
  type FrequencyAnalytics
} from '@/services/api';
import toast from 'react-hot-toast';

type AnalysisMode = 'hospitals' | 'diseases' | 'treatments' | null;

const AnalyticsTab: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<AnalysisMode>(null);
  const [results, setResults] = useState<{
    hospitals: HospitalAnalytics[];
    diseases: FrequencyAnalytics[];
    treatments: FrequencyAnalytics[];
  }>({
    hospitals: [],
    diseases: [],
    treatments: []
  });

  const [lastAnalysis, setLastAnalysis] = useState<AnalysisMode>(null);

  const runAnalysis = async (mode: AnalysisMode) => {
    if (!startDate || !endDate) {
      toast.error('Please select a date range first');
      return;
    }

    setLoading(true);
    setActiveMode(mode);
    try {
      if (mode === 'hospitals') {
        const data = await getHospitalAnalytics(startDate, endDate);
        setResults(prev => ({ ...prev, hospitals: data }));
      } else if (mode === 'diseases') {
        const data = await getDiseaseAnalytics(startDate, endDate);
        setResults(prev => ({ ...prev, diseases: data }));
      } else if (mode === 'treatments') {
        const data = await getTreatmentAnalytics(startDate, endDate);
        setResults(prev => ({ ...prev, treatments: data }));
      }
      setLastAnalysis(mode);
      toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} analysis complete`);
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysis = () => {
    const mode = activeMode || lastAnalysis;
    if (!mode) return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground border-2 border-dashed rounded-xl">
        <BarChart className="h-12 w-12 mb-4 opacity-20" />
        <p>Select a date range and choose an analysis to begin</p>
      </div>
    );

    if (loading) return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

    if (mode === 'hospitals') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Visits by Hospital/Clinic
            </h3>
            <span className="text-xs bg-muted px-2 py-1 rounded">Sorted by Visit Count</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {results.hospitals.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{h.name}</p>
                    <p className="text-sm text-muted-foreground">{h.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{h.visitCount}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Visits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (mode === 'diseases' || mode === 'treatments') {
      const data = mode === 'diseases' ? results.diseases : results.treatments;
      const label = mode === 'diseases' ? 'Disease' : 'Treatment';
      const icon = mode === 'diseases' ? <Stethoscope className="h-5 w-5 text-orange-500" /> : <Activity className="h-5 w-5 text-green-500" />;
      
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {icon}
              {label} Frequency Analysis
            </h3>
            <span className="text-xs bg-muted px-2 py-1 rounded">Sorted by Frequency</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item, i) => (
              <Card key={i} className="overflow-hidden border-primary/5 hover:border-primary/20 transition-all">
                <div className="bg-muted/30 p-3 border-b text-xs font-medium text-muted-foreground flex justify-between">
                  <span>Rank #{i + 1}</span>
                  <TrendingUp className="h-3 w-3" />
                </div>
                <CardContent className="p-4 flex justify-between items-center">
                  <span className="font-semibold">{item.disease || item.treatment}</span>
                  <span className="text-2xl font-black text-primary">{item.count}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 bg-gradient-to-r from-background to-muted/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart className="h-6 w-6 text-primary" />
                Hospital Analytics Dashboard
              </CardTitle>
              <p className="text-muted-foreground text-sm">Analyze visits, disease trends, and treatment effectiveness</p>
            </div>
            <div className="flex items-center gap-2 bg-background p-2 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                <Calendar className="h-3 w-3" />
                Date Range
              </div>
              <Input 
                type="date" 
                className="w-40 h-8 text-xs" 
                value={startDate}
                max={today}
                onChange={e => setStartDate(e.target.value)}
              />
              <span className="text-muted-foreground">-</span>
              <Input 
                type="date" 
                className="w-40 h-8 text-xs" 
                value={endDate}
                max={today}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant={activeMode === 'hospitals' ? 'default' : 'outline'} 
              className="flex items-center justify-between h-16 px-6"
              onClick={() => runAnalysis('hospitals')}
              disabled={loading}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">Hospital Ranking</span>
                <span className="text-[10px] opacity-70">Visits by Branch</span>
              </div>
              <Building2 className="h-6 w-6" />
            </Button>
            <Button 
              variant={activeMode === 'diseases' ? 'default' : 'outline'}
              className="flex items-center justify-between h-16 px-6"
              onClick={() => runAnalysis('diseases')}
              disabled={loading}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">Disease Trends</span>
                <span className="text-[10px] opacity-70">Common Conditions</span>
              </div>
              <Stethoscope className="h-6 w-6" />
            </Button>
            <Button 
              variant={activeMode === 'treatments' ? 'default' : 'outline'}
              className="flex items-center justify-between h-16 px-6"
              onClick={() => runAnalysis('treatments')}
              disabled={loading}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">Treatment Analysis</span>
                <span className="text-[10px] opacity-70">Most Used Therapies</span>
              </div>
              <Activity className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="min-h-[500px] p-6 bg-card border rounded-2xl shadow-inner relative overflow-hidden">
        {renderAnalysis()}
        {lastAnalysis && !activeMode && !loading && (
          <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            <Clock className="h-3 w-3" />
            Showing last analysis result
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
