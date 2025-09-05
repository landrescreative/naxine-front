import { Professional } from "@/components/ui/ProfessionalCard";

export interface CategoryData {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  backgroundImage?: string;
  professionals: Professional[];
}

export const categoriesData: Record<string, CategoryData> = {
  dietas: {
    id: "dietas",
    name: "Dietas y Nutrición",
    title: "Encuentra al nutricionista ideal para tu dieta",
    subtitle: "Profesionales especializados en nutrición y dietética",
    searchPlaceholder: "Buscar nutricionista, dietista...",
    professionals: [
      {
        id: "1",
        name: "Dr. Julio Basulto Marset",
        title: "Nutricionista y Dietista",
        description:
          "Nutricionista y dietista español, reconocido por su enfoque basado en evidencia científica.",
        rating: 4.8,
        reviewCount: 125,
        price: 100,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        isPopular: true,
        specialties: ["Nutrición Clínica", "Deportiva", "Vegetariana"],
      },
      {
        id: "2",
        name: "Lic. Ximena de la Serna",
        title: "Nutricionista Clínica",
        description:
          "Especializada en trastornos alimentarios y nutrición pediátrica. Certificada en terapia nutricional.",
        rating: 4.7,
        reviewCount: 89,
        price: 85,
        image:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
        specialties: ["Pediatría", "Trastornos Alimentarios", "Diabetes"],
      },
      {
        id: "3",
        name: "Carlos Ríos Crespo",
        title: "Dietista-Nutricionista",
        description:
          "Experto en nutrición basada en evidencia científica. Especialista en dietas para deportistas de élite.",
        rating: 4.9,
        reviewCount: 156,
        price: 120,
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        isPopular: true,
        specialties: ["Deportiva", "Científica", "Rendimiento"],
      },
    ],
  },
  terapias: {
    id: "terapias",
    name: "Terapias Psicológicas",
    title: "Conecta con el terapeuta perfecto para ti",
    subtitle: "Psicólogos y terapeutas especializados en diferentes enfoques",
    searchPlaceholder: "Buscar psicólogo, terapeuta...",
    professionals: [
      {
        id: "4",
        name: "Dra. Lucía Redondo Ruiz",
        title: "Psicóloga Clínica",
        description:
          "Especialista en terapia cognitivo-conductual y tratamiento de ansiedad y depresión. Más de 10 años de experiencia.",
        rating: 4.8,
        reviewCount: 98,
        price: 90,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        isPopular: true,
        specialties: ["Ansiedad", "Depresión", "TCC"],
      },
      {
        id: "5",
        name: "Fernanda Alvarado Aguilar",
        title: "Psicoterapeuta",
        description:
          "Especializada en terapia familiar y de pareja. Enfoque humanista y sistémico.",
        rating: 4.6,
        reviewCount: 76,
        price: 80,
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        specialties: ["Familiar", "Pareja", "Humanista"],
      },
      {
        id: "6",
        name: "Samantha Peña Rodríguez",
        title: "Psicóloga Infantil",
        description:
          "Especialista en desarrollo infantil y terapia de juego. Certificada en psicología educativa.",
        rating: 4.9,
        reviewCount: 112,
        price: 75,
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
        specialties: ["Infantil", "Desarrollo", "Educativa"],
      },
    ],
  },
  logopedas: {
    id: "logopedas",
    name: "Logopedia y Terapia del Habla",
    title: "Especialistas en comunicación y lenguaje",
    subtitle: "Logopedas certificados para todas las edades",
    searchPlaceholder: "Buscar logopeda, fonoaudiólogo...",
    professionals: [
      {
        id: "7",
        name: "Mariana Camarena Meza",
        title: "Logopeda",
        description:
          "Especialista en trastornos del habla y lenguaje en niños y adultos. Certificada en terapia miofuncional.",
        rating: 4.7,
        reviewCount: 64,
        price: 70,
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
        specialties: ["Infantil", "Miofuncional", "Lenguaje"],
      },
      {
        id: "8",
        name: "Silvia Romero Montes",
        title: "Fonoaudióloga",
        description:
          "Experta en rehabilitación de voz y deglución. Especialista en pacientes neurológicos.",
        rating: 4.8,
        reviewCount: 87,
        price: 85,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        isPopular: true,
        specialties: ["Voz", "Deglución", "Neurológica"],
      },
    ],
  },
  "consultas-legales": {
    id: "consultas-legales",
    name: "Consultas Legales",
    title: "Asesoría legal profesional y confiable",
    subtitle: "Abogados especializados en diferentes áreas del derecho",
    searchPlaceholder: "Buscar abogado, asesor legal...",
    professionals: [
      {
        id: "9",
        name: "Dr. Roberto Mendoza",
        title: "Abogado Civil",
        description:
          "Especialista en derecho civil y familiar. Más de 20 años de experiencia en divorcios y herencias.",
        rating: 4.9,
        reviewCount: 134,
        price: 150,
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        isPopular: true,
        specialties: ["Civil", "Familiar", "Herencias"],
      },
      {
        id: "10",
        name: "Lic. Ana García López",
        title: "Abogada Laboral",
        description:
          "Especializada en derecho laboral y seguridad social. Defensora de derechos de trabajadores.",
        rating: 4.7,
        reviewCount: 92,
        price: 120,
        image:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
        specialties: ["Laboral", "Seguridad Social", "Trabajadores"],
      },
      {
        id: "11",
        name: "Dr. Miguel Torres",
        title: "Abogado Penal",
        description:
          "Experto en derecho penal y criminal. Defensa en casos complejos y asesoría preventiva.",
        rating: 4.8,
        reviewCount: 78,
        price: 180,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        specialties: ["Penal", "Criminal", "Defensa"],
      },
    ],
  },
  "desarrollo-personal": {
    id: "desarrollo-personal",
    name: "Desarrollo Personal",
    title: "Coaches y mentores para tu crecimiento",
    subtitle: "Especialistas en desarrollo personal y profesional",
    searchPlaceholder: "Buscar coach, mentor, desarrollo...",
    professionals: [
      {
        id: "12",
        name: "Mónica Katz Goldstein",
        title: "Coach de Vida",
        description:
          "Especialista en desarrollo personal y liderazgo. Certificada en coaching ontológico y PNL.",
        rating: 4.8,
        reviewCount: 105,
        price: 95,
        image:
          "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=400&fit=crop&crop=face",
        isPopular: true,
        specialties: ["Liderazgo", "PNL", "Ontológico"],
      },
      {
        id: "13",
        name: "Carlos Martínez",
        title: "Coach Ejecutivo",
        description:
          "Especialista en coaching empresarial y desarrollo de equipos. Certificado por ICF.",
        rating: 4.6,
        reviewCount: 73,
        price: 110,
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        specialties: ["Ejecutivo", "Empresarial", "Equipos"],
      },
      {
        id: "14",
        name: "Laura Fernández",
        title: "Mentora de Carrera",
        description:
          "Especializada en desarrollo profesional y transiciones de carrera. Experta en networking.",
        rating: 4.7,
        reviewCount: 89,
        price: 85,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        specialties: ["Carrera", "Transiciones", "Networking"],
      },
    ],
  },
};
