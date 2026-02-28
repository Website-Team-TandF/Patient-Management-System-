export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  pricing: number;
  photo: string;
  description: string;
  rating: number;
  reviews: number;
}

export const mockDoctors: Doctor[] = [
  {
    id: 'DOC001',
    name: 'Dr. Sameer Khan',
    specialty: 'Ayurvedic Consultant',
    experience: '15+ Years',
    pricing: 500,
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
    description: 'Expert in Nadi Pariksha and chronic disease management through Ayurveda.',
    rating: 4.9,
    reviews: 120
  },
  {
    id: 'DOC002',
    name: 'Dr. Anjali Verma',
    specialty: 'Panchakarma Specialist',
    experience: '10+ Years',
    pricing: 450,
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    description: 'Specializes in detoxification and rejuvenation therapies.',
    rating: 4.8,
    reviews: 85
  },
  {
    id: 'DOC003',
    name: 'Dr. Vikram Malhotra',
    specialty: 'Ayurvedic Dietician',
    experience: '8+ Years',
    pricing: 400,
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    description: 'Expert in Prakriti-based diet planning and lifestyle management.',
    rating: 4.7,
    reviews: 64
  },
  {
    id: 'DOC004',
    name: 'Dr. Priya Sharma',
    specialty: 'Skin & Hair Expert',
    experience: '12+ Years',
    pricing: 600,
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    description: 'Specializes in Ayurvedic dermatology and herbal hair treatments.',
    rating: 4.9,
    reviews: 150
  },
  {
    id: 'DOC005',
    name: 'Dr. Rajesh Iyer',
    specialty: 'Joint & Bone Care',
    experience: '20+ Years',
    pricing: 700,
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    description: 'Renowned for treating arthritis and spondylitis through Marma therapy.',
    rating: 5.0,
    reviews: 210
  },
  {
    id: 'DOC006',
    name: 'Dr. Sneha Reddy',
    specialty: 'Women\'s Health',
    experience: '9+ Years',
    pricing: 450,
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    description: 'Expert in hormonal balance and Ayurvedic maternity care.',
    rating: 4.8,
    reviews: 92
  },
  {
    id: 'DOC007',
    name: 'Dr. Amit Trivedi',
    specialty: 'Stress & Anxiety',
    experience: '11+ Years',
    pricing: 550,
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    description: 'Specializes in Manas Roga and meditation-based healing.',
    rating: 4.7,
    reviews: 78
  },
  {
    id: 'DOC008',
    name: 'Dr. Kavita Joshi',
    specialty: 'Digestive Health',
    experience: '14+ Years',
    pricing: 500,
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    description: 'Expert in Agni management and metabolic disorders.',
    rating: 4.9,
    reviews: 115
  },
  {
    id: 'DOC009',
    name: 'Dr. Manoj Gupta',
    specialty: 'Respiratory Care',
    experience: '16+ Years',
    pricing: 600,
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    description: 'Specializes in asthma and chronic allergy management.',
    rating: 4.8,
    reviews: 88
  },
  {
    id: 'DOC010',
    name: 'Dr. Meera Nair',
    specialty: 'Ayurvedic Neurology',
    experience: '18+ Years',
    pricing: 800,
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    description: 'Expert in neurological disorders and Vata management.',
    rating: 4.9,
    reviews: 134
  }
];
