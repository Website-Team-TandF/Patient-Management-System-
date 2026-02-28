import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

interface PatientSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  slipData: any;
}

import { calculateAge } from '@/utils/dateUtils';

const formatDominant = (d?: string) => {
  if (!d) return '-';
  if (d.includes('-')) return d.toUpperCase();
  // Capitalize first letter
  return d.charAt(0).toUpperCase() + d.slice(1);
};

const PatientSlipModal: React.FC<PatientSlipModalProps> = ({ isOpen, onClose, slipData }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Slip - ${slipData?.patient?.name || 'Patient'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px;
            background: #fff;
          }
          .slip-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #2e7d32;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%);
            color: white;
            padding: 20px;
            text-align: center;
          }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .sub-header {
            background: #e8f5e9;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #c8e6c9;
          }
          .content { padding: 20px; }
          .section { margin-bottom: 15px; }
          .section-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 5px;
            font-weight: 600;
          }
          .section-content { font-size: 14px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }
          .badge-green { background: #c8e6c9; color: #2e7d32; }
          .badge-blue { background: #bbdefb; color: #1565c0; }
          .badge-amber { background: #fff3e0; color: #e65100; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 8px 12px; text-align: left; border: 1px solid #e0e0e0; font-size: 13px; }
          th { background: #f5f5f5; font-weight: 600; }
          .medicine-row { background: #fafafa; }
          .substitute { color: #e65100; font-style: italic; }
          .not-dispensed { text-decoration: line-through; color: #999; }
          .footer {
            background: #f5f5f5;
            padding: 15px 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          @media print {
            body { padding: 0; }
            .slip-container { border: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!slipData) return null;

  const patient = slipData.patient || {};
  const hospital = slipData.hospital || {};
  const doctor = slipData.doctor || {};
  const visitDate = slipData.createdAt ? format(new Date(slipData.createdAt), 'dd MMM yyyy, hh:mm a') : '-';
  const age = calculateAge(patient.dob);
  
  // Use prescribed medicines
  const medicines = (slipData.prescribedMedicines?.length > 0 
    ? slipData.prescribedMedicines 
    : slipData.medicinesGiven?.map((name: string) => ({ medicineName: name, quantity: '-', dosage: '-' }))) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Patient Slip</DialogTitle>
          <div className="flex gap-2">
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Content */}
        <div ref={printRef} className="slip-container">
          {/* Header */}
          <div className="header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <img src="/src/assets/Ayurvishwa-Logo.svg" alt="Ayurvishwa Logo" style={{ height: '50px', filter: 'brightness(0) invert(1)' }} />
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ margin: 0 }}>Ayurvishwa Healthcare</h1>
                <p style={{ margin: 0 }}>{hospital.address?.street}, {hospital.address?.city}, {hospital.address?.state}</p>
                <p style={{ marginTop: '2px', fontSize: '12px' }}>
                  {hospital.phone && `Phone: ${hospital.phone}`}
                </p>
              </div>
            </div>
          </div>

          {/* Sub Header */}
          <div className="sub-header">
            <div>
              <span style={{ fontWeight: 600 }}>Token: </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#2e7d32' }}>
                #{slipData.visitToken}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>Date: </span>
              <span>{visitDate}</span>
            </div>
            <div>
              <span className="badge badge-green">
                {slipData.status === 'done' ? 'EXAMINED' : 'WAITING'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="content">
            {/* Patient Info */}
            <div className="grid" style={{ marginBottom: '20px' }}>
              <div className="section">
                <div className="section-title">Patient Information</div>
                <div className="section-content">
                  <p style={{ fontSize: '16px', fontWeight: 600 }}>{patient.name}</p>
                  <p>Patient ID: {patient.patientId || patient._id}</p>
                  <p>Phone: {patient.phoneNo}</p>
                  <p>Age: {age || '-'} yrs | Sex: {patient.sex}</p>
                  {patient.address && (
                    <p>Address: {patient.address.street}, {patient.address.city}, {patient.address.state}</p>
                  )}
                </div>
              </div>
              
              {doctor && doctor.fullName && (
                <div className="section">
                  <div className="section-title">Consulting Doctor</div>
                  <div className="section-content">
                    <p style={{ fontSize: '16px', fontWeight: 600 }}>Dr. {doctor.fullName}</p>
                    {doctor.specializations && (
                      <p>{doctor.specializations.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Diagnosis - Only if status is done */}
            {slipData.status === 'done' && slipData.disease && slipData.disease.length > 0 && (
              <div className="section">
                <div className="section-title">Diagnosis</div>
                <div className="section-content">
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {slipData.disease.map((d: string, i: number) => (
                      <span key={i} className="badge badge-blue">{d}</span>
                    ))}
                  </div>
                  {slipData.diseaseDuration && (
                    <p style={{ marginTop: '5px' }}>Duration: {slipData.diseaseDuration}</p>
                  )}
                </div>
              </div>
            )}

            {/* Vitals & Ayurvedic Observations */}
            {(slipData.vitals || slipData.nadi || slipData.ayurvedicBaseline || slipData.dosha) && (
              <div className="section">
                <div className="section-title">Clinical & Ayurvedic Observations</div>
                <div className="section-content">
                  {/* Modern Vitals */}
                  {slipData.vitals && (slipData.vitals.pulse || slipData.vitals.bp || slipData.vitals.temperature) && (
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', padding: '10px', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px' }}>
                      {slipData.vitals.pulse && <span><b>Pulse:</b> {slipData.vitals.pulse} bpm</span>}
                      {slipData.vitals.bp && <span><b>BP:</b> {slipData.vitals.bp}</span>}
                      {slipData.vitals.temperature && <span><b>Temp:</b> {slipData.vitals.temperature}°F</span>}
                    </div>
                  )}

                  {/* Nadi */}
                  {slipData.nadi && (slipData.nadi.gati || slipData.nadi.bala || slipData.nadi.tala) && (
                    <div style={{ padding: '10px', border: '1px solid #c8e6c9', background: '#f1f8e9', borderRadius: '4px', marginBottom: '10px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: '#2e7d32', marginBottom: '5px' }}>NADI PARIKSHA ({slipData.nadi.wrist?.toUpperCase()})</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                        <span><b>Gati:</b> {slipData.nadi.gati || '-'}</span>
                        <span><b>Bala:</b> {slipData.nadi.bala || '-'}</span>
                        <span><b>Tala:</b> {slipData.nadi.tala || '-'}</span>
                        <span><b>Temp:</b> {slipData.nadi.temperature || '-'}</span>
                      </div>
                    </div>
                  )}

                  {/* Ayurvedic Baseline / Dosha */}
                  {(slipData.ayurvedicBaseline || slipData.dosha) && (
                    <div style={{ padding: '10px', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '4px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: '#2e7d32', marginBottom: '5px' }}>
                        AYURVEDIC ANALYSIS
                      </p>
                      {slipData.ayurvedicBaseline ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <p style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>DOSHA STATUS</p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                              <span><b>V:</b> {slipData.ayurvedicBaseline.dosha?.vata}%</span>
                              <span><b>P:</b> {slipData.ayurvedicBaseline.dosha?.pitta}%</span>
                              <span><b>K:</b> {slipData.ayurvedicBaseline.dosha?.kapha}%</span>
                            </div>
                            <div style={{ marginTop: '5px', fontSize: '12px' }}>
                              <span><b>Dominant:</b> {formatDominant(slipData.ayurvedicBaseline.dosha?.dominant)}</span>
                            </div>
                          </div>
                          <div>
                            <p style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>STATUS & HABITS</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '12px' }}>
                              <span><b>Agni:</b> {slipData.ayurvedicBaseline.agni}</span>
                              <span><b>Ama:</b> {slipData.ayurvedicBaseline.amaStatus}</span>
                              <span><b>Sleep:</b> {slipData.ayurvedicBaseline.dailyHabits?.sleep}</span>
                              <span><b>Appetite:</b> {slipData.ayurvedicBaseline.dailyHabits?.appetite}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '20px' }}>
                          <span><b>Vata:</b> {slipData.dosha.vata}%</span>
                          <span><b>Pitta:</b> {slipData.dosha.pitta}%</span>
                          <span><b>Kapha:</b> {slipData.dosha.kapha}%</span>
                          <span><b>Indication:</b> {slipData.dosha.indication}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medicines */}
            {medicines.length > 0 && (
              <div className="section">
                <div className="section-title">
                  Prescribed Medicines
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}>#</th>
                      <th>Medicine Name</th>
                      <th>Qty</th>
                      <th>Freq</th>
                      <th>Kala</th>
                      <th>Anupana</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med: any, i: number) => (
                      <tr key={i} className="medicine-row">
                        <td style={{ textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>
                          {med.medicineName}
                        </td>
                        <td style={{ textAlign: 'center' }}>{med.quantity}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{med.dosage || '-'}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{med.kala || med.timing || '-'}</td>
                        <td style={{ textAlign: 'center', fontSize: '11px' }}>{med.anupana || '-'}</td>
                        <td>{med.instructions || med.duration || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Advice */}
            {slipData.advice && (
              <div className="section">
                <div className="section-title">Doctor's Advice</div>
                <div className="section-content" style={{ padding: '12px', background: '#fff9c4', border: '1px solid #fff176', borderRadius: '4px', fontStyle: 'italic', fontSize: '14px' }}>
                  {slipData.advice}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {slipData.followUpDate && (
              <div className="section">
                <div className="section-title">Follow-up Date</div>
                <div className="section-content">
                  <span className="badge badge-green" style={{ fontSize: '14px' }}>
                    {format(new Date(slipData.followUpDate), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="footer">
            <p>Thank you for choosing Ayurvishwa Healthcare. Get well soon! 🌿</p>
            <p style={{ marginTop: '5px' }}>For queries, contact: {hospital.phone || 'N/A'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientSlipModal;
