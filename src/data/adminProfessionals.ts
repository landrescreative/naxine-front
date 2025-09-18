export interface AdminProfessional {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  city: string;
  postalCode: string;
  specialty: string;
  licenseNumber: string;
  experience: number; // years
  rating: number;
  totalSessions: number;
  incomeUsd: number;
  status: "activo" | "inactivo" | "pendiente" | "suspendido";
  joinDate: string;
  lastActive: string;
  profileImage?: string;
  bio: string;
  education: string[];
  certifications: string[];
  languages: string[];
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
}

export const ADMIN_PROFESSIONALS: AdminProfessional[] = [
  {
    id: "prof-001",
    name: "Dr. María González",
    fullName: "Dra. María Elena González Rodríguez",
    email: "maria.gonzalez@naxine.com",
    phone: "+34 612 345 678",
    username: "maria_gonzalez",
    city: "Madrid",
    postalCode: "28001",
    specialty: "Psicología Clínica",
    licenseNumber: "PSI-12345",
    experience: 8,
    rating: 4.8,
    totalSessions: 245,
    incomeUsd: 12500.0,
    status: "activo",
    joinDate: "2023-01-15",
    lastActive: "2024-01-15",
    bio: "Psicóloga clínica especializada en terapia cognitivo-conductual y trastornos de ansiedad.",
    education: [
      "Licenciatura en Psicología - Universidad Complutense de Madrid",
      "Máster en Terapia Cognitivo-Conductual - Universidad de Barcelona",
      "Doctorado en Psicología Clínica - Universidad Autónoma de Madrid",
    ],
    certifications: [
      "Certificación en EMDR",
      "Terapia de Pareja - Instituto de Terapia Familiar",
      "Mindfulness y Meditación - Centro de Estudios Budistas",
    ],
    languages: ["Español", "Inglés", "Francés"],
    availability: {
      monday: ["09:00-13:00", "16:00-20:00"],
      tuesday: ["09:00-13:00", "16:00-20:00"],
      wednesday: ["09:00-13:00", "16:00-20:00"],
      thursday: ["09:00-13:00", "16:00-20:00"],
      friday: ["09:00-13:00", "16:00-20:00"],
      saturday: ["10:00-14:00"],
      sunday: [],
    },
  },
  {
    id: "prof-002",
    name: "Dr. Carlos Ruiz",
    fullName: "Dr. Carlos Alberto Ruiz Martínez",
    email: "carlos.ruiz@naxine.com",
    phone: "+34 623 456 789",
    username: "carlos_ruiz",
    city: "Barcelona",
    postalCode: "08001",
    specialty: "Psiquiatría",
    licenseNumber: "PSQ-67890",
    experience: 12,
    rating: 4.9,
    totalSessions: 320,
    incomeUsd: 18500.0,
    status: "activo",
    joinDate: "2022-11-20",
    lastActive: "2024-01-14",
    bio: "Psiquiatra con amplia experiencia en trastornos del estado de ánimo y esquizofrenia.",
    education: [
      "Licenciatura en Medicina - Universidad de Barcelona",
      "Especialización en Psiquiatría - Hospital Clínic de Barcelona",
      "Máster en Neuropsiquiatría - Universidad Pompeu Fabra",
    ],
    certifications: [
      "Certificación en Terapia Electroconvulsiva",
      "Psicofarmacología Avanzada - Sociedad Española de Psiquiatría",
      "Terapia de Familia Sistémica",
    ],
    languages: ["Español", "Catalán", "Inglés"],
    availability: {
      monday: ["08:00-12:00", "15:00-19:00"],
      tuesday: ["08:00-12:00", "15:00-19:00"],
      wednesday: ["08:00-12:00", "15:00-19:00"],
      thursday: ["08:00-12:00", "15:00-19:00"],
      friday: ["08:00-12:00"],
      saturday: [],
      sunday: [],
    },
  },
  {
    id: "prof-003",
    name: "Dra. Ana Martín",
    fullName: "Dra. Ana Isabel Martín López",
    email: "ana.martin@naxine.com",
    phone: "+34 634 567 890",
    username: "ana_martin",
    city: "Valencia",
    postalCode: "46001",
    specialty: "Terapia Familiar",
    licenseNumber: "TF-11111",
    experience: 6,
    rating: 4.7,
    totalSessions: 180,
    incomeUsd: 9800.0,
    status: "activo",
    joinDate: "2023-03-10",
    lastActive: "2024-01-13",
    bio: "Especialista en terapia familiar sistémica y mediación familiar.",
    education: [
      "Licenciatura en Psicología - Universidad de Valencia",
      "Máster en Terapia Familiar Sistémica - Instituto de Terapia Familiar de Valencia",
      "Postgrado en Mediación Familiar - Universidad Politécnica de Valencia",
    ],
    certifications: [
      "Certificación en Terapia Sistémica",
      "Mediación Familiar - Colegio Oficial de Psicólogos de Valencia",
      "Terapia de Pareja - Instituto de Terapia Familiar",
    ],
    languages: ["Español", "Valenciano", "Inglés"],
    availability: {
      monday: ["10:00-14:00", "17:00-21:00"],
      tuesday: ["10:00-14:00", "17:00-21:00"],
      wednesday: ["10:00-14:00", "17:00-21:00"],
      thursday: ["10:00-14:00", "17:00-21:00"],
      friday: ["10:00-14:00"],
      saturday: ["09:00-13:00"],
      sunday: [],
    },
  },
  {
    id: "prof-004",
    name: "Dr. Miguel Torres",
    fullName: "Dr. Miguel Ángel Torres Sánchez",
    email: "miguel.torres@naxine.com",
    phone: "+34 645 678 901",
    username: "miguel_torres",
    city: "Sevilla",
    postalCode: "41001",
    specialty: "Psicología Deportiva",
    licenseNumber: "PSD-22222",
    experience: 5,
    rating: 4.6,
    totalSessions: 95,
    incomeUsd: 7200.0,
    status: "pendiente",
    joinDate: "2023-08-15",
    lastActive: "2024-01-10",
    bio: "Psicólogo deportivo especializado en rendimiento y motivación deportiva.",
    education: [
      "Licenciatura en Psicología - Universidad de Sevilla",
      "Máster en Psicología del Deporte - Universidad Pablo de Olavide",
      "Curso de Especialización en Coaching Deportivo",
    ],
    certifications: [
      "Certificación en Psicología del Deporte - COP Andalucía",
      "Coaching Deportivo - Instituto de Coaching Deportivo",
      "Mindfulness en el Deporte",
    ],
    languages: ["Español", "Inglés"],
    availability: {
      monday: ["16:00-20:00"],
      tuesday: ["16:00-20:00"],
      wednesday: ["16:00-20:00"],
      thursday: ["16:00-20:00"],
      friday: ["16:00-20:00"],
      saturday: ["09:00-13:00"],
      sunday: [],
    },
  },
  {
    id: "prof-005",
    name: "Dra. Laura Jiménez",
    fullName: "Dra. Laura Patricia Jiménez García",
    email: "laura.jimenez@naxine.com",
    phone: "+34 656 789 012",
    username: "laura_jimenez",
    city: "Bilbao",
    postalCode: "48001",
    specialty: "Neuropsicología",
    licenseNumber: "NP-33333",
    experience: 10,
    rating: 4.9,
    totalSessions: 280,
    incomeUsd: 15200.0,
    status: "activo",
    joinDate: "2022-09-05",
    lastActive: "2024-01-15",
    bio: "Neuropsicóloga especializada en evaluación y rehabilitación cognitiva.",
    education: [
      "Licenciatura en Psicología - Universidad del País Vasco",
      "Máster en Neuropsicología - Universidad de Deusto",
      "Doctorado en Neurociencias - Universidad de Navarra",
    ],
    certifications: [
      "Certificación en Evaluación Neuropsicológica",
      "Rehabilitación Cognitiva - Instituto de Neuropsicología",
      "Neuroimagen Funcional - Universidad de Cambridge",
    ],
    languages: ["Español", "Euskera", "Inglés", "Francés"],
    availability: {
      monday: ["09:00-13:00", "15:00-19:00"],
      tuesday: ["09:00-13:00", "15:00-19:00"],
      wednesday: ["09:00-13:00", "15:00-19:00"],
      thursday: ["09:00-13:00", "15:00-19:00"],
      friday: ["09:00-13:00"],
      saturday: [],
      sunday: [],
    },
  },
  {
    id: "prof-006",
    name: "Dr. Roberto Silva",
    fullName: "Dr. Roberto Carlos Silva Fernández",
    email: "roberto.silva@naxine.com",
    phone: "+34 667 890 123",
    username: "roberto_silva",
    city: "Málaga",
    postalCode: "29001",
    specialty: "Psicología Forense",
    licenseNumber: "PSF-44444",
    experience: 7,
    rating: 4.5,
    totalSessions: 120,
    incomeUsd: 8900.0,
    status: "inactivo",
    joinDate: "2023-05-20",
    lastActive: "2023-12-15",
    bio: "Psicólogo forense especializado en peritajes psicológicos y evaluación de daño psíquico.",
    education: [
      "Licenciatura en Psicología - Universidad de Málaga",
      "Máster en Psicología Forense - Universidad de Granada",
      "Especialización en Peritaje Psicológico - Colegio Oficial de Psicólogos de Andalucía",
    ],
    certifications: [
      "Perito Judicial - Colegio Oficial de Psicólogos",
      "Evaluación de Daño Psíquico - Instituto de Psicología Forense",
      "Mediación Penal - Universidad de Málaga",
    ],
    languages: ["Español", "Inglés"],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  },
  {
    id: "prof-007",
    name: "Dra. Carmen Vega",
    fullName: "Dra. Carmen María Vega Ruiz",
    email: "carmen.vega@naxine.com",
    phone: "+34 678 901 234",
    username: "carmen_vega",
    city: "Zaragoza",
    postalCode: "50001",
    specialty: "Psicología Infantil",
    licenseNumber: "PSI-55555",
    experience: 9,
    rating: 4.8,
    totalSessions: 200,
    incomeUsd: 11200.0,
    status: "activo",
    joinDate: "2023-02-28",
    lastActive: "2024-01-12",
    bio: "Psicóloga infantil especializada en trastornos del desarrollo y terapia familiar.",
    education: [
      "Licenciatura en Psicología - Universidad de Zaragoza",
      "Máster en Psicología Infantil - Universidad de Barcelona",
      "Especialización en Trastornos del Espectro Autista - Universidad de Valencia",
    ],
    certifications: [
      "Certificación en Evaluación Infantil",
      "Terapia de Juego - Instituto de Terapia Infantil",
      "Intervención en TEA - Federación Autismo Aragón",
    ],
    languages: ["Español", "Inglés"],
    availability: {
      monday: ["09:00-13:00", "16:00-20:00"],
      tuesday: ["09:00-13:00", "16:00-20:00"],
      wednesday: ["09:00-13:00", "16:00-20:00"],
      thursday: ["09:00-13:00", "16:00-20:00"],
      friday: ["09:00-13:00"],
      saturday: ["10:00-14:00"],
      sunday: [],
    },
  },
  {
    id: "prof-008",
    name: "Dr. Fernando López",
    fullName: "Dr. Fernando José López Morales",
    email: "fernando.lopez@naxine.com",
    phone: "+34 689 012 345",
    username: "fernando_lopez",
    city: "Murcia",
    postalCode: "30001",
    specialty: "Sexología",
    licenseNumber: "SEX-66666",
    experience: 4,
    rating: 4.4,
    totalSessions: 75,
    incomeUsd: 6800.0,
    status: "suspendido",
    joinDate: "2023-07-10",
    lastActive: "2023-11-20",
    bio: "Sexólogo clínico especializado en disfunciones sexuales y terapia de pareja.",
    education: [
      "Licenciatura en Psicología - Universidad de Murcia",
      "Máster en Sexología Clínica - Instituto de Sexología de Madrid",
      "Especialización en Terapia Sexual - Universidad de Salamanca",
    ],
    certifications: [
      "Certificación en Sexología Clínica",
      "Terapia de Pareja Sexual - Instituto de Sexología",
      "Educación Sexual - Sociedad Española de Sexología",
    ],
    languages: ["Español", "Inglés"],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  },
  {
    id: "prof-009",
    name: "Dra. Isabel Moreno",
    fullName: "Dra. Isabel Cristina Moreno Díaz",
    email: "isabel.moreno@naxine.com",
    phone: "+34 690 123 456",
    username: "isabel_moreno",
    city: "Las Palmas",
    postalCode: "35001",
    specialty: "Psicología de la Salud",
    licenseNumber: "PSH-77777",
    experience: 11,
    rating: 4.7,
    totalSessions: 260,
    incomeUsd: 13800.0,
    status: "activo",
    joinDate: "2022-12-01",
    lastActive: "2024-01-14",
    bio: "Psicóloga de la salud especializada en enfermedades crónicas y adherencia al tratamiento.",
    education: [
      "Licenciatura en Psicología - Universidad de Las Palmas de Gran Canaria",
      "Máster en Psicología de la Salud - Universidad de La Laguna",
      "Doctorado en Psicología de la Salud - Universidad de Barcelona",
    ],
    certifications: [
      "Certificación en Psicología de la Salud",
      "Intervención en Enfermedades Crónicas - Sociedad Española de Psicología de la Salud",
      "Mindfulness en Salud - Universidad de Massachusetts",
    ],
    languages: ["Español", "Inglés"],
    availability: {
      monday: ["08:00-12:00", "15:00-19:00"],
      tuesday: ["08:00-12:00", "15:00-19:00"],
      wednesday: ["08:00-12:00", "15:00-19:00"],
      thursday: ["08:00-12:00", "15:00-19:00"],
      friday: ["08:00-12:00"],
      saturday: [],
      sunday: [],
    },
  },
  {
    id: "prof-010",
    name: "Dr. Antonio Herrera",
    fullName: "Dr. Antonio Manuel Herrera Castro",
    email: "antonio.herrera@naxine.com",
    phone: "+34 601 234 567",
    username: "antonio_herrera",
    city: "Córdoba",
    postalCode: "14001",
    specialty: "Psicología Organizacional",
    licenseNumber: "PSO-88888",
    experience: 6,
    rating: 4.3,
    totalSessions: 110,
    incomeUsd: 8500.0,
    status: "pendiente",
    joinDate: "2023-09-15",
    lastActive: "2024-01-08",
    bio: "Psicólogo organizacional especializado en desarrollo de talento y clima laboral.",
    education: [
      "Licenciatura en Psicología - Universidad de Córdoba",
      "Máster en Psicología del Trabajo - Universidad de Sevilla",
      "Especialización en Coaching Ejecutivo - Instituto de Coaching",
    ],
    certifications: [
      "Certificación en Psicología Organizacional",
      "Coaching Ejecutivo - International Coach Federation",
      "Desarrollo de Liderazgo - Universidad de Harvard (Online)",
    ],
    languages: ["Español", "Inglés"],
    availability: {
      monday: ["10:00-14:00", "16:00-20:00"],
      tuesday: ["10:00-14:00", "16:00-20:00"],
      wednesday: ["10:00-14:00", "16:00-20:00"],
      thursday: ["10:00-14:00", "16:00-20:00"],
      friday: ["10:00-14:00"],
      saturday: [],
      sunday: [],
    },
  },
];

export function getProfessionalById(id: string): AdminProfessional | undefined {
  return ADMIN_PROFESSIONALS.find((professional) => professional.id === id);
}

export function updateProfessional(
  id: string,
  updates: Partial<AdminProfessional>
): boolean {
  const index = ADMIN_PROFESSIONALS.findIndex(
    (professional) => professional.id === id
  );
  if (index !== -1) {
    ADMIN_PROFESSIONALS[index] = { ...ADMIN_PROFESSIONALS[index], ...updates };
    return true;
  }
  return false;
}

export function getProfessionalsByStatus(
  status: AdminProfessional["status"]
): AdminProfessional[] {
  return ADMIN_PROFESSIONALS.filter(
    (professional) => professional.status === status
  );
}

export function getProfessionalsBySpecialty(
  specialty: string
): AdminProfessional[] {
  return ADMIN_PROFESSIONALS.filter((professional) =>
    professional.specialty.toLowerCase().includes(specialty.toLowerCase())
  );
}
