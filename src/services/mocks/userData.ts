export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'pharmacist';

export interface User {
  id: string; // This corresponds to _id from MongoDB in live API
  fullName: string;
  email: string;
  userRoles: UserRole[];
  departments?: string[];
  specializations?: string[];
  consultationFee?: number;
  extraLine?: string; // e.g., "13 years of exp"
}

export const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@sagarhealth.com',
    userRoles: ['doctor'],
    departments: ['Cardiology'],
    specializations: ['Interventional Cardiologist'],
    consultationFee: 1000,
    extraLine: '15 years of experience',
  },
  {
    id: '2',
    fullName: 'Dr. Priya Sharma',
    email: 'priya.sharma@sagarhealth.com',
    userRoles: ['doctor'],
    departments: ['Pediatrics'],
    specializations: ['Child Specialist'],
    consultationFee: 800,
    extraLine: '10 years of experience',
  },
  {
    id: '3',
    fullName: 'Anita Desai',
    email: 'anita.desai@sagarhealth.com',
    userRoles: ['receptionist'],
  },
  {
    id: '4',
    fullName: 'Suresh Patil',
    email: 'suresh.patil@sagarhealth.com',
    userRoles: ['pharmacist'],
  },
  {
    id: '5',
    fullName: 'Sagar',
    email: 'sagar@sagarhealth.com',
    userRoles: ['admin'],
  },
  {
    id: '6',
    fullName: 'Sagar',
    email: 'sagar1@sagarhealth.com',
    userRoles: ['admin','doctor','receptionist','pharmacist'],
  },
];
