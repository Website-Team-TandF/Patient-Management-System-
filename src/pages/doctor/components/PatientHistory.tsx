import React from 'react';
import type { Visit } from '@/services/mocks/visitData';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Calendar, Activity, Pill, ClipboardList, Thermometer, HeartPulse, Droplets } from 'lucide-react';

interface PatientHistoryProps {
  visits: Visit[];
}

const formatDominant = (d?: string) => {
  if (!d) return '-';
  if (d.includes('-')) return d.toUpperCase();
  return d.charAt(0).toUpperCase() + d.slice(1);
};

const hasData = (val: any): boolean => {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'number') return !isNaN(val);
  if (typeof val === 'boolean') return val === true;
  if (Array.isArray(val)) return val.length > 0 && val.some(hasData);
  if (typeof val === 'object') {
    // If it's an object, check if any of its values have data
    // Special case for otherProblems: if it only has false/empty values, it's empty
    return Object.values(val).some(hasData);
  }
  return false;
};

const PatientHistory: React.FC<PatientHistoryProps> = ({ visits }) => {
  if (visits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
        No previous visits found for this patient.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        Previous Visits History
      </h3>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {visits.map((visit) => {
          const mh = visit.medicalHistory;
          
          // Check for high-level section visibility
          const showVitals = hasData(mh?.vitals);
          const showAyurvedic = hasData(mh?.nadi) || hasData(mh?.ayurvedicBaseline) || hasData(mh?.dosha);
          const showFindings = hasData(mh?.disease) || hasData(mh?.presentSymptoms) || hasData(mh?.previousTreatment);
          const showTreatment = hasData(mh?.treatmentGiven) || hasData(mh?.prescribedMedicines) || hasData(mh?.medicinesGiven);
          const showOtherProblems = hasData(mh?.otherProblems);
          const showAdvice = hasData(mh?.advice);
          const showFollowUp = hasData(mh?.followUpDate);

          return (
            <AccordionItem key={visit.id} value={visit.id} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-4 vigil-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{visit.visitDate}</p>
                      <p className="text-xs text-muted-foreground">
                        {mh?.disease?.join(', ') || 'General Checkup'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Done
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2 border-t">
                {mh ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    
                    {/* Left Column: Clinical & Ayurvedic Findings */}
                    <div className="space-y-6">
                      {/* Vitals Section */}
                      {showVitals && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                            <Activity className="h-4 w-4" />
                            Vitals
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {hasData(mh.vitals?.temperature) && (
                              <div className="bg-muted/50 p-2 rounded-md text-center">
                                <Thermometer className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                                <p className="text-[10px] text-muted-foreground uppercase">Temp</p>
                                <p className="text-sm font-bold">{mh.vitals!.temperature}°F</p>
                              </div>
                            )}
                            {hasData(mh.vitals?.pulse) && (
                              <div className="bg-muted/50 p-2 rounded-md text-center">
                                <HeartPulse className="h-4 w-4 mx-auto mb-1 text-red-500" />
                                <p className="text-[10px] text-muted-foreground uppercase">Pulse</p>
                                <p className="text-sm font-bold">{mh.vitals!.pulse}</p>
                              </div>
                            )}
                            {hasData(mh.vitals?.bp) && (
                              <div className="bg-muted/50 p-2 rounded-md text-center">
                                <Droplets className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                                <p className="text-[10px] text-muted-foreground uppercase">BP</p>
                                <p className="text-sm font-bold">{mh.vitals!.bp}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Ayurvedic Findings */}
                      {showAyurvedic && (
                        <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                            <HeartPulse className="h-4 w-4" />
                            Ayurvedic Analysis
                          </h4>
                          
                          {hasData(mh.nadi) && (
                            <div className="text-xs space-y-2">
                              <p className="font-bold flex items-center gap-1.5 text-primary/70 uppercase tracking-wider text-[10px]">
                                Nadi Pariksha ({mh.nadi!.wrist}):
                              </p>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                {hasData(mh.nadi!.gati) && <span className="bg-background px-2 py-1.5 rounded border shadow-sm">Gati: <span className="font-bold">{mh.nadi!.gati}</span></span>}
                                {hasData(mh.nadi!.bala) && <span className="bg-background px-2 py-1.5 rounded border shadow-sm">Bala: <span className="font-bold">{mh.nadi!.bala}</span></span>}
                                {hasData(mh.nadi!.tala) && <span className="bg-background px-2 py-1.5 rounded border shadow-sm">Tala: <span className="font-bold">{mh.nadi!.tala}</span></span>}
                                {hasData(mh.nadi!.temperature) && <span className="bg-background px-2 py-1.5 rounded border shadow-sm">Temp: <span className="font-bold">{mh.nadi!.temperature}</span></span>}
                              </div>
                            </div>
                          )}

                          {(hasData(mh.ayurvedicBaseline) || hasData(mh.dosha)) && (
                            <div className="text-xs space-y-3 pt-2 border-t border-primary/10">
                              {/* Dosha & Baseline Header */}
                              {(hasData(mh.ayurvedicBaseline?.dosha) || hasData(mh.ayurvedicBaseline?.agni) || hasData(mh.ayurvedicBaseline?.amaStatus)) && (
                                <div className="space-y-2">
                                  <p className="font-bold flex items-center gap-1.5 text-primary/70 uppercase tracking-wider text-[10px]">
                                    Dosha & Baseline:
                                  </p>
                                  
                                  {hasData(mh.ayurvedicBaseline?.dosha) && (
                                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                                      <div className="bg-background py-1.5 rounded border shadow-sm flex flex-col">
                                        <span className="text-[8px] text-muted-foreground uppercase">Vata</span>
                                        <span className="font-black text-primary">{mh.ayurvedicBaseline!.dosha.vata}%</span>
                                      </div>
                                      <div className="bg-background py-1.5 rounded border shadow-sm flex flex-col">
                                        <span className="text-[8px] text-muted-foreground uppercase">Pitta</span>
                                        <span className="font-black text-primary">{mh.ayurvedicBaseline!.dosha.pitta}%</span>
                                      </div>
                                      <div className="bg-background py-1.5 rounded border shadow-sm flex flex-col">
                                        <span className="text-[8px] text-muted-foreground uppercase">Kapha</span>
                                        <span className="font-black text-primary">{mh.ayurvedicBaseline!.dosha.kapha}%</span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex flex-wrap gap-2">
                                    {hasData(mh.ayurvedicBaseline?.dosha?.dominant) && <Badge variant="outline" className="text-[10px] bg-background">Dominant: {formatDominant(mh.ayurvedicBaseline!.dosha.dominant)}</Badge>}
                                    {hasData(mh.ayurvedicBaseline?.dosha?.indication) && <Badge variant="outline" className="text-[10px] bg-background">Indication: {mh.ayurvedicBaseline!.dosha.indication}</Badge>}
                                    {hasData(mh.ayurvedicBaseline?.agni) && <Badge variant="outline" className="text-[10px] bg-background">Agni: {mh.ayurvedicBaseline!.agni}</Badge>}
                                    {hasData(mh.ayurvedicBaseline?.amaStatus) && <Badge variant="outline" className="text-[10px] bg-background">Ama: {mh.ayurvedicBaseline!.amaStatus}</Badge>}
                                  </div>
                                </div>
                              )}

                              {/* Legacy Dosha Fallback */}
                              {!hasData(mh.ayurvedicBaseline?.dosha) && hasData(mh.dosha) && (
                                <div className="grid grid-cols-3 gap-1 text-[10px] text-center">
                                  <div className="bg-background px-1 py-1 rounded border shadow-sm flex flex-col">
                                    <span className="text-[8px]">V</span>
                                    <span className="font-bold">{mh.dosha!.vata}%</span>
                                  </div>
                                  <div className="bg-background px-1 py-1 rounded border shadow-sm flex flex-col">
                                    <span className="text-[8px]">P</span>
                                    <span className="font-bold">{mh.dosha!.pitta}%</span>
                                  </div>
                                  <div className="bg-background px-1 py-1 rounded border shadow-sm flex flex-col">
                                    <span className="text-[8px]">K</span>
                                    <span className="font-bold">{mh.dosha!.kapha}%</span>
                                  </div>
                                </div>
                              )}

                              {/* Habits */}
                              {hasData(mh.ayurvedicBaseline?.dailyHabits) && (
                                <div className="space-y-1.5">
                                  <p className="font-bold flex items-center gap-1.5 text-primary/70 uppercase tracking-wider text-[10px]">
                                    Daily Habits:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {hasData(mh.ayurvedicBaseline!.dailyHabits.sleep) && <span className="text-[10px] bg-muted px-2 py-0.5 rounded">Sleep: <b>{mh.ayurvedicBaseline!.dailyHabits.sleep}</b></span>}
                                    {hasData(mh.ayurvedicBaseline!.dailyHabits.appetite) && <span className="text-[10px] bg-muted px-2 py-0.5 rounded">Appetite: <b>{mh.ayurvedicBaseline!.dailyHabits.appetite}</b></span>}
                                    {hasData(mh.ayurvedicBaseline!.dailyHabits.bowel) && <span className="text-[10px] bg-muted px-2 py-0.5 rounded">Bowel: <b>{mh.ayurvedicBaseline!.dailyHabits.bowel}</b></span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Diagnosis & Treatment */}
                    <div className="space-y-6">
                      {/* Clinical Findings */}
                      {showFindings && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            Clinical Findings
                          </h4>
                          
                          {hasData(mh.disease) && (
                            <div className="bg-muted/30 p-3 rounded-lg border border-muted-foreground/5 space-y-2">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Disease / Conditions:</p>
                              <div className="flex flex-wrap gap-1">
                                {mh.disease!.map((d, i) => (
                                  <Badge key={i} variant="outline" className="bg-background border-primary/20">{d}</Badge>
                                ))}
                                {hasData(mh.diseaseDuration) && (
                                  <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px]">{mh.diseaseDuration}</Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {hasData(mh.presentSymptoms) && (
                            <div className="bg-muted/30 p-3 rounded-lg border border-muted-foreground/5 space-y-2">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Symptoms:</p>
                              <div className="flex flex-wrap gap-1">
                                {mh.presentSymptoms!.map((s, i) => (
                                  <Badge key={i} variant="outline" className="bg-background border-primary/20">{s}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {hasData(mh.previousTreatment) && (
                            <div className="bg-muted/30 p-3 rounded-lg border border-muted-foreground/5 space-y-2">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Previous Treatment History:</p>
                              <div className="flex flex-wrap gap-1">
                                {mh.previousTreatment!.map((s, i) => (
                                  <Badge key={i} variant="outline" className="bg-background border-primary/20">{s}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Treatment & Medicines */}
                      {showTreatment && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                            <Pill className="h-4 w-4" />
                             Treatment & Medicines
                          </h4>
                          
                          {hasData(mh.treatmentGiven) && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium">Treatment Given:</p>
                              <div className="flex flex-wrap gap-1">
                                {mh.treatmentGiven!.map((t, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {hasData(mh.prescribedMedicines) && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium">Medicines Prescribed:</p>
                              <div className="grid grid-cols-1 gap-1.5">
                                {mh.prescribedMedicines!.map((med, idx) => (
                                  <div key={idx} className="bg-muted px-3 py-2 rounded-md flex flex-col gap-1 text-sm border border-transparent hover:border-primary/10 transition-colors">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-primary">{med.medicineName}</span>
                                      <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase text-muted-foreground justify-end">
                                        <span>{med.quantity} Qty</span>
                                        {hasData(med.dosage) && <span>{med.dosage}</span>}
                                        <span>{med.kala || med.timing || '-'}</span>
                                      </div>
                                    </div>
                                    {(hasData(med.anupana) || hasData(med.instructions) || hasData(med.duration)) && (
                                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] pt-1 border-t border-muted-foreground/10 italic">
                                        {hasData(med.anupana) && <span className="text-primary/70">Anupana: <b>{med.anupana}</b></span>}
                                        {hasData(med.duration) && <span>Duration: <b>{med.duration}</b></span>}
                                        {hasData(med.instructions) && <span className="text-muted-foreground">Inst: {med.instructions}</span>}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {hasData(mh.medicinesGiven) && (!hasData(mh.prescribedMedicines)) && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium">Medicines Prescribed:</p>
                              <div className="flex flex-wrap gap-1">
                                {mh.medicinesGiven!.map((med, idx) => (
                                  <Badge key={idx} variant="secondary" className="font-normal">
                                    {med}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Other Problems */}
                      {showOtherProblems && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-primary">Other Problems</h4>
                          <div className="flex flex-wrap gap-2">
                            {mh.otherProblems!.acidity && <Badge variant="outline" className="text-[10px]">Acidity</Badge>}
                            {mh.otherProblems!.diabetes && <Badge variant="outline" className="text-[10px]">Diabetes</Badge>}
                            {mh.otherProblems!.constipation && <Badge variant="outline" className="text-[10px]">Constipation</Badge>}
                            {mh.otherProblems!.amebiasis && <Badge variant="outline" className="text-[10px]">Amebiasis</Badge>}
                            {mh.otherProblems!.bp && <Badge variant="outline" className="text-[10px]">Hypertension</Badge>}
                            {mh.otherProblems!.heartProblems && <Badge variant="outline" className="text-[10px]">Heart Problems</Badge>}
                            {hasData(mh.otherProblems!.other) && (
                              <p className="text-xs text-muted-foreground italic w-full">Other: {mh.otherProblems!.other}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Advice & Follow-up */}
                      {(showAdvice || showFollowUp) && (
                        <div className="space-y-4">
                          {showAdvice && (
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Doctor's Advice
                              </h4>
                              <div className="text-sm bg-primary/5 p-4 border border-primary/10 rounded-xl italic">
                                "{mh.advice}"
                              </div>
                            </div>
                          )}

                          {showFollowUp && (
                            <div className="flex items-center justify-between p-3 bg-green-50/50 border border-green-100 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-700">Follow-up Date:</span>
                              </div>
                              <Badge className="bg-green-600 text-white border-none font-bold">
                                {new Date(mh.followUpDate!).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No detailed medical records for this visit.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default PatientHistory;
