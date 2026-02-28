export type AppointmentStatus = 'booked' | 'cancelled' | 'checked_in';

export interface Appointment {
  id: string;
  slotNumber: number;
  patientName: string;
  phoneNumber: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: AppointmentStatus;
  hospitalId: string;
  mode: 'offline' | 'online'; // Added mode
  paymentStatus?: 'pending' | 'completed';
  amount?: number;
  duration?: number;
  visitId?: string; // Link to visit
}

export const mockAppointments: Appointment[] = [
  {
    id: 'APT001',
    slotNumber: 1,
    patientName: 'Rahul Sharma',
    phoneNumber: '9876543210',
    startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(10, 10, 0, 0)).toISOString(),
    status: 'booked',
    hospitalId: '1', // Sagar Ayurvedic Clinic
    mode: 'offline',
    paymentStatus: 'pending',
    amount: 200
  },
  {
    id: 'APT002',
    slotNumber: 2,
    patientName: 'Priya Patel',
    phoneNumber: '9876543211',
    startTime: new Date(new Date().setHours(10, 10, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(10, 20, 0, 0)).toISOString(),
    status: 'checked_in',
    hospitalId: '1',
    mode: 'offline',
    paymentStatus: 'completed',
    amount: 200,
    visitId: 'VIS003'
  },
  {
    id: 'APT003',
    slotNumber: 3,
    patientName: 'Amit Singh',
    phoneNumber: '9876543212',
    startTime: new Date(new Date().setHours(10, 20, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    status: 'cancelled',
    hospitalId: '1',
    mode: 'offline',
    paymentStatus: 'pending',
    amount: 200
  },
  {
    id: 'APT004',
    slotNumber: 1,
    patientName: 'Sneha Gupta',
    phoneNumber: '9876543213',
    startTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    status: 'booked',
    hospitalId: '1',
    mode: 'online', // Online appointment to test filtering
    paymentStatus: 'completed',
    amount: 500,
    duration: 30
  }
];
