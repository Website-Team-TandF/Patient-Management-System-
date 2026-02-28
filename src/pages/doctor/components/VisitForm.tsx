import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MultiSelect } from '@/components/ui/multi-select';
import { 
  Search, 
  Plus, 
  X, 
  Stethoscope, 
  Activity, 
  AlertCircle, 
  Pill, 
  Calendar, 
  Save,
  Loader2,
  HeartPulse
} from 'lucide-react';
import { mockMedicines } from '@/services/mocks/medicineData';
import { updateVisit, type Metadata } from '@/services/api';
import toast from 'react-hot-toast';

import { useMedicineContext } from '@/context/MedicineContext';

const prescribedMedicineSchema = z.object({
  medicineId: z.string().optional(),
  medicineName: z.string().min(1, 'Medicine name is required'),
  quantity: z.number().optional().default(1),
  dosage: z.string().optional().default(''),
  instructions: z.string().optional().default(''),
  timing: z.string().optional().default(''), // Legacy
  kala: z.string().optional().default(''),
  anupana: z.string().optional().default(''),
  duration: z.string().optional().default(''),
});

const visitSchema = z.object({
  disease: z.array(z.string()).min(1, 'At least one disease is required'),
  diseaseOther: z.string().optional(),
  diseaseDuration: z.string().optional(),
  presentSymptoms: z.array(z.string()).optional(),
  presentSymptomsOther: z.string().optional(),
  previousTreatment: z.array(z.string()).optional(),
  previousTreatmentOther: z.string().optional(),
  treatmentGiven: z.array(z.string()).optional(),
  treatmentGivenOther: z.string().optional(),
  vitals: z.object({
    pulse: z.number().nullable().optional(),
    bp: z.string().optional(),
    temperature: z.number().nullable().optional(),
  }).optional(),
  nadi: z.object({
    wrist: z.string().optional(),
    gati: z.string().optional(),
    bala: z.string().optional(),
    tala: z.string().optional(),
    temperature: z.string().optional(),
  }).optional(),
  ayurvedicBaseline: z.object({
    dosha: z.object({
      vata: z.number().min(0).max(100).nullable().optional(),
      pitta: z.number().min(0).max(100).nullable().optional(),
      kapha: z.number().min(0).max(100).nullable().optional(),
      indication: z.string().optional(),
      dominant: z.string().optional(),
    }).optional(),
    agni: z.string().optional(),
    amaStatus: z.string().optional(),
    dailyHabits: z.object({
      sleep: z.string().optional(),
      appetite: z.string().optional(),
      bowel: z.string().optional(),
    }).optional(),
  }).optional(),
  dosha: z.object({ // Legacy compatibility
    vata: z.number().min(0).max(100).nullable().optional(),
    pitta: z.number().min(0).max(100).nullable().optional(),
    kapha: z.number().min(0).max(100).nullable().optional(),
    indication: z.string().optional(),
  }).optional(),
  otherProblems: z.object({
    acidity: z.boolean().optional().default(false),
    diabetes: z.boolean().optional().default(false),
    constipation: z.boolean().optional().default(false),
    amebiasis: z.boolean().optional().default(false),
    bp: z.boolean().optional().default(false),
    heartProblems: z.boolean().optional().default(false),
    other: z.string().optional().default(''),
  }).optional(),
  prescribedMedicines: z.array(prescribedMedicineSchema).optional().default([]),
  medicinesGiven: z.array(z.string()).optional(),
  advice: z.string().optional(),
  followUpDate: z.string().optional(),
});

type VisitFormValues = z.infer<typeof visitSchema>;

interface VisitFormProps {
  visitId: string;
  onSuccess: () => void;
  metadata: Metadata | null;
  initialData?: any;
  lastVisit?: any;
}

const normalizeDominant = (d?: string) => {
  if (!d) return '';
  const low = d.toLowerCase();
  if (low === 'v-p') return 'V-P';
  if (low === 'p-k') return 'P-K';
  if (low === 'v-k') return 'V-K';
  if (low === 'vata') return 'Vata';
  if (low === 'pitta') return 'Pitta';
  if (low === 'kapha') return 'Kapha';
  return d;
};

const extractOther = (selected: string[] = [], options: string[] = []) => {
  const metadataValues = selected.filter(v => options.includes(v));
  const otherValue = selected.find(v => !options.includes(v)) || '';
  return { metadataValues, otherValue };
};

const VisitForm: React.FC<VisitFormProps> = ({ visitId, onSuccess, metadata, initialData, lastVisit }) => {
  const { medicineNames } = useMedicineContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema) as any,
    defaultValues: {
      disease: initialData?.disease || [],
      diseaseOther: '',
      diseaseDuration: initialData?.diseaseDuration || '',
      presentSymptoms: initialData?.presentSymptoms || [],
      presentSymptomsOther: '',
      previousTreatment: initialData?.previousTreatment || [],
      previousTreatmentOther: '',
      treatmentGiven: initialData?.treatmentGiven || [],
      treatmentGivenOther: '',
      vitals: { 
        pulse: initialData?.vitals?.pulse || null, 
        bp: initialData?.vitals?.bp || '', 
        temperature: initialData?.vitals?.temperature || null
      },
      nadi: {
        wrist: initialData?.nadi?.wrist || '',
        gati: initialData?.nadi?.gati || '',
        bala: initialData?.nadi?.bala || '',
        tala: initialData?.nadi?.tala || '',
        temperature: initialData?.nadi?.temperature || '',
      },
      ayurvedicBaseline: {
        dosha: {
          vata: initialData?.ayurvedicBaseline?.dosha?.vata ?? initialData?.dosha?.vata ?? null,
          pitta: initialData?.ayurvedicBaseline?.dosha?.pitta ?? initialData?.dosha?.pitta ?? null,
          kapha: initialData?.ayurvedicBaseline?.dosha?.kapha ?? initialData?.dosha?.kapha ?? null,
          indication: initialData?.ayurvedicBaseline?.dosha?.indication ?? initialData?.dosha?.indication ?? '',
          dominant: normalizeDominant(initialData?.ayurvedicBaseline?.dosha?.dominant),
        },
        agni: initialData?.ayurvedicBaseline?.agni || '',
        amaStatus: initialData?.ayurvedicBaseline?.amaStatus || '',
        dailyHabits: {
          sleep: initialData?.ayurvedicBaseline?.dailyHabits?.sleep || '',
          appetite: initialData?.ayurvedicBaseline?.dailyHabits?.appetite || '',
          bowel: initialData?.ayurvedicBaseline?.dailyHabits?.bowel || '',
        }
      },
      dosha: {
        vata: initialData?.dosha?.vata || null,
        pitta: initialData?.dosha?.pitta || null,
        kapha: initialData?.dosha?.kapha || null,
        indication: initialData?.dosha?.indication || '',
      },
      otherProblems: { 
        acidity: !!initialData?.otherProblems?.acidity, 
        diabetes: !!initialData?.otherProblems?.diabetes, 
        constipation: !!initialData?.otherProblems?.constipation, 
        amebiasis: !!initialData?.otherProblems?.amebiasis, 
        bp: !!initialData?.otherProblems?.bp, 
        heartProblems: !!initialData?.otherProblems?.heartProblems, 
        other: initialData?.otherProblems?.other || '' 
      },
      prescribedMedicines: (initialData?.prescribedMedicines || []).map((m: any) => ({
        ...m,
        dosage: m.dosage || '',
        timing: m.timing || '',
        kala: m.kala || '',
        anupana: m.anupana || '',
        instructions: m.instructions || '',
        duration: m.duration || '',
      })),
      medicinesGiven: initialData?.medicinesGiven || [],
      advice: initialData?.advice || '',
      followUpDate: initialData?.followUpDate ? initialData.followUpDate.split('T')[0] : '',
    },
  });

  // Effect to reset form when initialData changes (for Edit mode)
  React.useEffect(() => {
    if (initialData) {
      const diseaseData = extractOther(initialData.disease, metadata?.diseases);
      const symptomsData = extractOther(initialData.presentSymptoms, metadata?.symptoms);
      const prevTreatmentData = extractOther(initialData.previousTreatment, metadata?.treatments);
      const treatmentGivenData = extractOther(initialData.treatmentGiven, metadata?.treatments);

      reset({
        disease: diseaseData.metadataValues,
        diseaseOther: diseaseData.otherValue,
        diseaseDuration: initialData.diseaseDuration || '',
        presentSymptoms: symptomsData.metadataValues,
        presentSymptomsOther: symptomsData.otherValue,
        previousTreatment: prevTreatmentData.metadataValues,
        previousTreatmentOther: prevTreatmentData.otherValue,
        treatmentGiven: treatmentGivenData.metadataValues,
        treatmentGivenOther: treatmentGivenData.otherValue,
        vitals: {
          pulse: initialData.vitals?.pulse || null,
          bp: initialData.vitals?.bp || '',
          temperature: initialData.vitals?.temperature || null,
        },
        nadi: {
          wrist: initialData.nadi?.wrist || '',
          gati: initialData.nadi?.gati || '',
          bala: initialData.nadi?.bala || '',
          tala: initialData.nadi?.tala || '',
          temperature: initialData.nadi?.temperature || '',
        },
        ayurvedicBaseline: {
          dosha: {
            vata: initialData.ayurvedicBaseline?.dosha?.vata ?? initialData.dosha?.vata ?? null,
            pitta: initialData.ayurvedicBaseline?.dosha?.pitta ?? initialData.dosha?.pitta ?? null,
            kapha: initialData.ayurvedicBaseline?.dosha?.kapha ?? initialData.dosha?.kapha ?? null,
            indication: initialData.ayurvedicBaseline?.dosha?.indication ?? initialData.dosha?.indication ?? '',
            dominant: normalizeDominant(initialData.ayurvedicBaseline?.dosha?.dominant),
          },
          agni: initialData.ayurvedicBaseline?.agni || '',
          amaStatus: initialData.amaStatus || initialData.ayurvedicBaseline?.amaStatus || '',
          dailyHabits: {
            sleep: initialData.ayurvedicBaseline?.dailyHabits?.sleep || '',
            appetite: initialData.ayurvedicBaseline?.dailyHabits?.appetite || '',
            bowel: initialData.ayurvedicBaseline?.dailyHabits?.bowel || '',
          }
        },
        otherProblems: {
          acidity: !!initialData.otherProblems?.acidity,
          diabetes: !!initialData.otherProblems?.diabetes,
          constipation: !!initialData.otherProblems?.constipation,
          amebiasis: !!initialData.otherProblems?.amebiasis,
          bp: !!initialData.otherProblems?.bp,
          heartProblems: !!initialData.otherProblems?.heartProblems,
          other: initialData.otherProblems?.other || ''
        },
        prescribedMedicines: (initialData.prescribedMedicines || []).map((m: any) => ({
          ...m,
          dosage: m.dosage || '',
          kala: m.kala || '',
          anupana: m.anupana || '',
          instructions: m.instructions || '',
          duration: m.duration || '',
        })),
        advice: initialData.advice || '',
        followUpDate: initialData.followUpDate ? initialData.followUpDate.split('T')[0] : '',
      });
    }
  }, [initialData, reset, metadata]);

  const applyLastVisit = () => {
    if (!lastVisit || !lastVisit.medicalHistory) {
      toast.error('No previous visit history found');
      return;
    }
    const history = lastVisit.medicalHistory;
    
    // Extract "Other" values for Last Visit prefill
    const diseaseData = extractOther(history.disease, metadata?.diseases);
    const symptomsData = extractOther(history.presentSymptoms, metadata?.symptoms);
    const prevTreatmentData = extractOther(history.previousTreatment, metadata?.treatments);
    const treatmentGivenData = extractOther(history.treatmentGiven, metadata?.treatments);

    reset({
      ...watch(), 
      disease: diseaseData.metadataValues,
      diseaseOther: diseaseData.otherValue,
      diseaseDuration: history.diseaseDuration || '',
      presentSymptoms: symptomsData.metadataValues,
      presentSymptomsOther: symptomsData.otherValue,
      previousTreatment: prevTreatmentData.metadataValues,
      previousTreatmentOther: prevTreatmentData.otherValue,
      treatmentGiven: treatmentGivenData.metadataValues,
      treatmentGivenOther: treatmentGivenData.otherValue,
      vitals: {
        pulse: history.vitals?.pulse || null,
        bp: history.vitals?.bp || '',
        temperature: history.vitals?.temperature || null,
      },
      nadi: {
        wrist: history.nadi?.wrist || '',
        gati: history.nadi?.gati || '',
        bala: history.nadi?.bala || '',
        tala: history.nadi?.tala || '',
        temperature: history.nadi?.temperature || '',
      },
      ayurvedicBaseline: {
        dosha: {
          vata: history.ayurvedicBaseline?.dosha?.vata ?? history.dosha?.vata ?? null,
          pitta: history.ayurvedicBaseline?.dosha?.pitta ?? history.dosha?.pitta ?? null,
          kapha: history.ayurvedicBaseline?.dosha?.kapha ?? history.dosha?.kapha ?? null,
          indication: history.ayurvedicBaseline?.dosha?.indication ?? history.dosha?.indication ?? '',
          dominant: normalizeDominant(history.ayurvedicBaseline?.dosha?.dominant),
        },
        agni: history.ayurvedicBaseline?.agni || '',
        amaStatus: history.amaStatus || history.ayurvedicBaseline?.amaStatus || '',
        dailyHabits: {
          sleep: history.ayurvedicBaseline?.dailyHabits?.sleep || '',
          appetite: history.ayurvedicBaseline?.dailyHabits?.appetite || '',
          bowel: history.ayurvedicBaseline?.dailyHabits?.bowel || '',
        }
      },
      otherProblems: {
        acidity: !!history.otherProblems?.acidity,
        diabetes: !!history.otherProblems?.diabetes,
        constipation: !!history.otherProblems?.constipation,
        amebiasis: !!history.otherProblems?.amebiasis,
        bp: !!history.otherProblems?.bp,
        heartProblems: !!history.otherProblems?.heartProblems,
        other: history.otherProblems?.other || ''
      },
      prescribedMedicines: (history.prescribedMedicines || []).map((m: any) => ({
        ...m,
        dosage: m.dosage || '',
        kala: m.kala || '',
        anupana: m.anupana || '',
        instructions: m.instructions || '',
        duration: m.duration || '',
      })),
      advice: history.advice || '',
    });
    toast.success('Prefilled values from last visit');
  };

  const selectedMedicines = watch('prescribedMedicines') || [];

  const filteredMedicines = medicineNames.filter(m => 
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) && 
    !selectedMedicines.find(sm => sm.medicineName === m.name)
  );

  const addMedicine = (medicine: { id: string, name: string }) => {
    const newItem: z.infer<typeof prescribedMedicineSchema> = {
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: 1,
      dosage: '',
      timing: '',
      kala: '',
      anupana: '',
      instructions: '',
      duration: '',
    };
    setValue('prescribedMedicines', [...selectedMedicines, newItem]);
    setMedicineSearch('');
  };

  const removeMedicine = (index: number) => {
    setValue('prescribedMedicines', selectedMedicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof z.infer<typeof prescribedMedicineSchema>, value: any) => {
    const updated = [...selectedMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setValue('prescribedMedicines', updated);
  };

  const onSubmit = async (data: VisitFormValues) => {
    setIsSubmitting(true);
    try {
      // Merge "Other" values into arrays if they exist
      const finalData = {
        ...data,
        disease: data.diseaseOther ? [...data.disease, data.diseaseOther] : data.disease,
        presentSymptoms: data.presentSymptomsOther ? [...(data.presentSymptoms || []), data.presentSymptomsOther] : data.presentSymptoms,
        previousTreatment: data.previousTreatmentOther ? [...(data.previousTreatment || []), data.previousTreatmentOther] : data.previousTreatment,
        treatmentGiven: data.treatmentGivenOther ? [...(data.treatmentGiven || []), data.treatmentGivenOther] : data.treatmentGiven,
        vitals: data.vitals ? {
          pulse: data.vitals.pulse || undefined,
          bp: data.vitals.bp,
          temperature: data.vitals.temperature || undefined,
        } : undefined,
      };

      // Frontend Sanitization: Remove empty strings for Enum fields
      if (finalData.nadi) {
        if (finalData.nadi.wrist === '') delete (finalData.nadi as any).wrist;
        if (finalData.nadi.gati === '') delete (finalData.nadi as any).gati;
        if (finalData.nadi.bala === '') delete (finalData.nadi as any).bala;
        if (finalData.nadi.tala === '') delete (finalData.nadi as any).tala;
        if (finalData.nadi.temperature === '') delete (finalData.nadi as any).temperature;
      }

      if (finalData.ayurvedicBaseline) {
        if (finalData.ayurvedicBaseline.agni === '') delete (finalData.ayurvedicBaseline as any).agni;
        if (finalData.ayurvedicBaseline.amaStatus === '') delete (finalData.ayurvedicBaseline as any).amaStatus;
        if (finalData.ayurvedicBaseline.dosha) {
            if (finalData.ayurvedicBaseline.dosha.indication === '') delete (finalData.ayurvedicBaseline.dosha as any).indication;
            if (finalData.ayurvedicBaseline.dosha.dominant === '') delete (finalData.ayurvedicBaseline.dosha as any).dominant;
        }
      }

      await updateVisit(visitId, finalData as any);
      toast.success('Visit details updated successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to update visit details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-primary/5 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Visit Examination
          </CardTitle>
          <CardDescription>Record clinical findings and prescribe medicines</CardDescription>
        </div>
        {lastVisit && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={applyLastVisit}
            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 font-bold"
          >
            Same as Last OPD
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
          {/* Basic Diagnosis */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Main Disease/Condition <span className="text-destructive">*</span></Label>
                <Controller
                  name="disease"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={metadata?.diseases || []}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select Diseases"
                    />
                  )}
                />
                <Input 
                  {...register('diseaseOther')} 
                  placeholder="Other Disease (if any)" 
                  className="mt-2"
                />
                {errors.disease && <p className="text-xs text-destructive">{errors.disease.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="diseaseDuration">Duration</Label>
                <Controller
                  name="diseaseDuration"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="diseaseDuration"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">Select Duration</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="More than 6 months">More than 6 months</option>
                    </select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Presenting Symptoms</Label>
                <Controller
                  name="presentSymptoms"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={metadata?.symptoms || []}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select Symptoms"
                    />
                  )}
                />
                <Input 
                  {...register('presentSymptomsOther')} 
                  placeholder="Other Symptoms (if any)" 
                  className="mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label>Previous Treatment</Label>
                <Controller
                  name="previousTreatment"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={metadata?.treatments || []}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select Previous Treatments"
                    />
                  )}
                />
                <Input 
                  {...register('previousTreatmentOther')} 
                  placeholder="Other Previous Treatment (if any)" 
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Treatment Given Today</Label>
              <Controller
                name="treatmentGiven"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={metadata?.treatments || []}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select Treatments Given"
                  />
                )}
              />
              <Input 
                {...register('treatmentGivenOther')} 
                placeholder="Other Treatment Given (if any, e.g. Basti)" 
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Physical Examination */}
          <div className="space-y-8">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Physical Examination
            </h3>
            
            <div className="space-y-6">
              {/* Vitals Block */}
              <div className="bg-muted/20 p-6 rounded-xl border border-border/50 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  General Vitals
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Pulse (bpm)</Label>
                    <Input 
                      type="number" 
                      {...register('vitals.pulse', { valueAsNumber: true })} 
                      className="h-10 border-primary/10 focus:border-primary/40 bg-background"
                      placeholder="--"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">BP (mmHg)</Label>
                    <Input 
                      {...register('vitals.bp')} 
                      className="h-10 border-primary/10 focus:border-primary/40 bg-background"
                      placeholder="--/--" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Temp (°F)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      {...register('vitals.temperature', { valueAsNumber: true })} 
                      className="h-10 border-primary/10 focus:border-primary/40 bg-background"
                      placeholder="--"
                    />
                  </div>
                </div>
              </div>

              {/* Nadi Pariksha Block */}
              <div className="bg-muted/20 p-6 rounded-xl border border-border/50 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <HeartPulse className="h-3 w-3" />
                  Nadi Pariksha
                </p>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="space-y-2 flex-1">
                      <Label className="text-xs font-bold">Examination Wrist</Label>
                      <div className="flex bg-muted rounded-md p-1 h-10 shadow-inner max-w-xs">
                        <button
                          type="button"
                          onClick={() => setValue('nadi.wrist', 'Left')}
                          className={`flex-1 rounded-sm text-[10px] font-black tracking-tighter transition-all ${watch('nadi.wrist') === 'Left' ? 'bg-background shadow-md text-primary' : 'opacity-40 hover:opacity-100'}`}
                        >
                          LEFT WRIST
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue('nadi.wrist', 'Right')}
                          className={`flex-1 rounded-sm text-[10px] font-black tracking-tighter transition-all ${watch('nadi.wrist') === 'Right' ? 'bg-background shadow-md text-primary' : 'opacity-40 hover:opacity-100'}`}
                        >
                          RIGHT WRIST
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Gati (Movement)</Label>
                      <select 
                        {...register('nadi.gati')} 
                        className="flex h-10 w-full rounded-md border border-primary/10 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:outline-none"
                      >
                        <option value="">Select Gati</option>
                        <option value="Sarpa">Sarpa</option>
                        <option value="Manduka">Manduka</option>
                        <option value="Hamsa">Hamsa</option>
                        <option value="Mridu">Mridu</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Bala (Strength)</Label>
                      <select 
                        {...register('nadi.bala')} 
                        className="flex h-10 w-full rounded-md border border-primary/10 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:outline-none"
                      >
                        <option value="">Select Bala</option>
                        <option value="Ksheena">Ksheena</option>
                        <option value="Madhyama">Madhyama</option>
                        <option value="Pravara">Pravara</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Tala (Rhythm)</Label>
                      <select 
                        {...register('nadi.tala')} 
                        className="flex h-10 w-full rounded-md border border-primary/10 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:outline-none"
                      >
                        <option value="">Select Tala</option>
                        <option value="Regular">Regular</option>
                        <option value="Irregular">Irregular</option>
                        <option value="Spasmodic">Spasmodic</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Temperature</Label>
                      <select 
                        {...register('nadi.temperature')} 
                        className="flex h-10 w-full rounded-md border border-primary/10 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:outline-none"
                      >
                        <option value="">Select Temp</option>
                        <option value="Ushna">Ushna</option>
                        <option value="Sheeta">Sheeta</option>
                        <option value="Normal">Normal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <Separator />

            {/* Ayurvedic Baseline */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Ayurvedic Baseline
              </h3>
              <div className="space-y-8 bg-primary/5 p-6 rounded-xl border border-primary/10">
                {/* Dosha Subsection */}
                <div className="space-y-6">
                  <p className="text-xs font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                    Dosha Analysis
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="font-bold">Vata</Label>
                        <span className="text-xs font-black px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                          {watch('ayurvedicBaseline.dosha.vata') ?? 0}%
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        {...register('ayurvedicBaseline.dosha.vata', { valueAsNumber: true })}
                        className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="font-bold">Pitta</Label>
                        <span className="text-xs font-black px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                          {watch('ayurvedicBaseline.dosha.pitta') ?? 0}%
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        {...register('ayurvedicBaseline.dosha.pitta', { valueAsNumber: true })}
                        className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="font-bold">Kapha</Label>
                        <span className="text-xs font-black px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                          {watch('ayurvedicBaseline.dosha.kapha') ?? 0}%
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        {...register('ayurvedicBaseline.dosha.kapha', { valueAsNumber: true })}
                        className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-primary/10">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Dominant Dosha</Label>
                      <select 
                        {...register('ayurvedicBaseline.dosha.dominant')} 
                        className="flex h-10 w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:outline-none"
                      >
                        <option value="">Select Dominant Dosha</option>
                        <option value="Vata">Vata</option>
                        <option value="Pitta">Pitta</option>
                        <option value="Kapha">Kapha</option>
                        <option value="V-P">V-P</option>
                        <option value="P-K">P-K</option>
                        <option value="V-K">V-K</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Indication</Label>
                      <div className="flex bg-muted rounded-lg p-1 h-10 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setValue('ayurvedicBaseline.dosha.indication', 'Acute')}
                          className={`flex-1 rounded-md text-xs font-bold transition-all ${watch('ayurvedicBaseline.dosha.indication') === 'Acute' ? 'bg-background shadow-md text-primary scale-[1.02]' : 'text-muted-foreground opacity-60 hover:opacity-100'}`}
                        >
                          Acute
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue('ayurvedicBaseline.dosha.indication', 'Chronic')}
                          className={`flex-1 rounded-md text-xs font-bold transition-all ${watch('ayurvedicBaseline.dosha.indication') === 'Chronic' ? 'bg-background shadow-md text-primary scale-[1.02]' : 'text-muted-foreground opacity-60 hover:opacity-100'}`}
                        >
                          Chronic
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-primary/10" />

                {/* Status & Habits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Agni</Label>
                      <select 
                        {...register('ayurvedicBaseline.agni')} 
                        className="flex h-10 w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:outline-none"
                      >
                        <option value="">Select Agni</option>
                        <option value="Sama">Sama</option>
                        <option value="Vishama">Vishama</option>
                        <option value="Tikshna">Tikshna</option>
                        <option value="Manda">Manda</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Ama Status</Label>
                      <select 
                        {...register('ayurvedicBaseline.amaStatus')} 
                        className="flex h-10 w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:outline-none"
                      >
                        <option value="">Select Ama Status</option>
                        <option value="None">None</option>
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Daily Habits</p>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-4">
                        <Label className="text-xs font-bold w-20">Sleep</Label>
                        <select 
                          {...register('ayurvedicBaseline.dailyHabits.sleep')} 
                          className="flex-1 h-9 rounded-md border border-primary/10 bg-background px-3 text-xs focus:border-primary/40 focus:outline-none"
                        >
                          <option value="">Select</option>
                          <option value="Sound">Sound</option>
                          <option value="Disturbed">Disturbed</option>
                          <option value="Insomnia">Insomnia</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="text-xs font-bold w-20">Appetite</Label>
                        <select 
                          {...register('ayurvedicBaseline.dailyHabits.appetite')} 
                          className="flex-1 h-9 rounded-md border border-primary/10 bg-background px-3 text-xs focus:border-primary/40 focus:outline-none"
                        >
                          <option value="">Select</option>
                          <option value="Normal">Normal</option>
                          <option value="Excess">Excess</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="text-xs font-bold w-20">Bowel</Label>
                        <select 
                          {...register('ayurvedicBaseline.dailyHabits.bowel')} 
                          className="flex-1 h-9 rounded-md border border-primary/10 bg-background px-3 text-xs focus:border-primary/40 focus:outline-none"
                        >
                          <option value="">Select</option>
                          <option value="Regular">Regular</option>
                          <option value="Constip.">Constip.</option>
                          <option value="Loose">Loose</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

          {/* Other Problems */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              Co-morbidities & Other Health Issues
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { id: 'acidity', label: 'Acidity' },
                { id: 'constipation', label: 'Constipation' },
                { id: 'amebiasis', label: 'Amebiasis' },
                { id: 'bp', label: 'Hypertension' },
                { id: 'diabetes', label: 'Diabetes' },
                { id: 'heartProblems', label: 'Heart Issues' },
              ].map((problem) => {
                const isSelected = watch(`otherProblems.${problem.id}` as any);
                return (
                  <label 
                    key={problem.id} 
                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-md ${
                      isSelected 
                        ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-inner' 
                        : 'bg-background border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      {...register(`otherProblems.${problem.id}` as any)}
                      className="peer sr-only"
                    />
                    <span className={`text-[10px] font-black uppercase tracking-tighter mb-1 transition-colors ${isSelected ? 'text-rose-500' : 'text-muted-foreground'}`}>
                      {problem.label}
                    </span>
                    <div className={`h-1.5 w-6 rounded-full transition-all ${isSelected ? 'bg-rose-500 w-10' : 'bg-muted'}`} />
                  </label>
                );
              })}
            </div>
            <div className="space-y-2 bg-muted/10 p-4 rounded-xl border border-dashed border-border">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Additional Observations</Label>
              <Input 
                id="otherProblems.other" 
                {...register('otherProblems.other')} 
                placeholder="Type any other health problems or details here..." 
                className="bg-background border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <Separator />

          {/* Medicines */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                Prescribed Medicines
              </h3>
              {selectedMedicines.length > 0 && (
                <Badge variant="outline" className="font-mono">
                  {selectedMedicines.length} Medicines
                </Badge>
              )}
            </div>
            
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search and add medicines (e.g. Mahasudarshan Vati)..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              
              {medicineSearch && (
                <Card className="absolute z-50 w-full mt-1 shadow-xl border-primary/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <ScrollArea className="h-48">
                    <div className="p-2 space-y-1 bg-background">
                      {filteredMedicines.length > 0 ? (
                        filteredMedicines.map((med) => (
                          <button
                            key={med.id}
                            type="button"
                            onClick={() => addMedicine(med)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 rounded-md flex items-center justify-between group transition-colors"
                          >
                            <span className="font-medium">{med.name}</span>
                            <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-center py-6 text-muted-foreground italic">No matching medicines found</p>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              )}
            </div>

            <div className="space-y-3">
              {selectedMedicines.map((med, idx) => (
                <Card key={`${med.medicineName}-${idx}`} className="bg-muted/30 border-primary/10 hover:border-primary/30 transition-all overflow-hidden">
                  <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Pill className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Prescribed Medicine</span>
                        </div>
                        <p className="text-base font-bold text-primary leading-tight break-words">
                          {med.medicineName}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMedicine(idx)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 -mt-1 -mr-1 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <div className="space-y-1.5 text-left">
                        <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Qty</Label>
                        <Input 
                          type="number" 
                          value={med.quantity} 
                          onChange={(e) => updateMedicine(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="h-9 font-bold bg-background"
                          min="1"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Frequency</Label>
                        <select 
                          value={med.dosage}
                          onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                          className="w-full h-9 bg-background border rounded-md px-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none"
                        >
                          <option value="">Select</option>
                          <option value="OD">Once a day (OD)</option>
                          <option value="BD">Twice a day (BD)</option>
                          <option value="TDS">Thrice a day (TDS)</option>
                          <option value="HS">At bedtime (HS)</option>
                          <option value="SOS">As needed (SOS)</option>
                          <option value="QID">Four times a day (QID)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Kala</Label>
                        <select 
                          value={med.kala}
                          onChange={(e) => updateMedicine(idx, 'kala', e.target.value)}
                          className="w-full h-9 bg-background border rounded-md px-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none"
                        >
                          <option value="">Select Kala</option>
                          <option value="Before">Before Meal</option>
                          <option value="After">After Meal</option>
                          <option value="Morning">Morning</option>
                          <option value="Night">Night</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Anupana</Label>
                        <select 
                          value={med.anupana}
                          onChange={(e) => updateMedicine(idx, 'anupana', e.target.value)}
                          className="w-full h-9 bg-background border rounded-md px-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none"
                        >
                          <option value="">Select Anupana</option>
                          <option value="Warm Water">Warm Water</option>
                          <option value="Milk">Milk</option>
                          <option value="Honey">Honey</option>
                          <option value="Ghee">Ghee</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left col-span-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Duration</Label>
                        <Input 
                          placeholder="e.g. 5 days" 
                          value={med.duration}
                          onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                          className="h-9 text-xs font-medium bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-dashed border-primary/10">
                      <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Instructions & Notes</Label>
                      <Input 
                        placeholder="e.g. Take with lukewarm water, avoid spicy food, etc." 
                        value={med.instructions}
                        onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                        className="h-9 text-xs italic bg-background/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </Card>
              ))}
              {selectedMedicines.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20">
                  <Pill className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground italic">No medicines prescribed yet. Search and add from above.</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Advice & Follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="advice">Doctor's Advice</Label>
              <textarea
                id="advice"
                {...register('advice')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g., Take with lukewarm water, avoid spicy food..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="followUpDate" 
                  type="date" 
                  {...register('followUpDate')} 
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto px-12">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Visit Details
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VisitForm;
