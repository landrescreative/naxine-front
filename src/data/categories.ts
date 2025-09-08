import { Professional } from "@/components/ui/ProfessionalCard";

export interface ServiceData {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  description: string;
  keywords: string[];
  backgroundImage?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  backgroundImage?: string;
  professionals: Professional[];
  services: ServiceData[];
}

export const categoriesData: Record<string, CategoryData> = {
  dietas: {
    id: "dietas",
    name: "Dietas y Nutrición",
    title: "Encuentra al nutricionista ideal para tu dieta",
    subtitle: "Profesionales especializados en nutrición y dietética",
    searchPlaceholder: "Buscar nutricionista, dietista...",
    services: [
      {
        id: "perdida-de-peso",
        name: "Pérdida de peso",
        title: "Nutricionistas especializados en pérdida de peso",
        subtitle:
          "Profesionales expertos en dietas para adelgazar de forma saludable",
        searchPlaceholder: "Buscar nutricionista para perder peso...",
        description:
          "Encuentra nutricionistas especializados en pérdida de peso saludable. Dietas personalizadas para adelgazar de forma segura y efectiva.",
        keywords: [
          "pérdida de peso",
          "adelgazar",
          "dieta",
          "nutricionista",
          "obesidad",
          "sobrepeso",
        ],
      },
      {
        id: "deportiva",
        name: "Nutrición deportiva",
        title: "Nutricionistas especializados en deporte",
        subtitle: "Profesionales expertos en nutrición deportiva y rendimiento",
        searchPlaceholder: "Buscar nutricionista deportivo...",
        description:
          "Nutricionistas especializados en deporte y rendimiento. Dietas personalizadas para deportistas y atletas.",
        keywords: [
          "nutrición deportiva",
          "deporte",
          "rendimiento",
          "atletas",
          "fitness",
          "musculación",
        ],
      },
      {
        id: "vegetarianos-y-veganos",
        name: "Vegetarianos y veganos",
        title: "Nutricionistas especializados en dietas vegetarianas y veganas",
        subtitle: "Profesionales expertos en alimentación plant-based",
        searchPlaceholder: "Buscar nutricionista vegano...",
        description:
          "Nutricionistas especializados en dietas vegetarianas y veganas. Alimentación plant-based equilibrada y saludable.",
        keywords: [
          "vegetariano",
          "vegano",
          "plant-based",
          "dieta vegetal",
          "proteína vegetal",
        ],
      },
      {
        id: "tcas-trastornos-conducta-alimentaria",
        name: "TCAs (trastornos de la conducta alimentaria)",
        title: "Nutricionistas especializados en trastornos alimentarios",
        subtitle: "Profesionales expertos en tratamiento de TCA",
        searchPlaceholder: "Buscar nutricionista TCA...",
        description:
          "Nutricionistas especializados en trastornos de la conducta alimentaria. Tratamiento nutricional para anorexia, bulimia y otros TCA.",
        keywords: [
          "TCA",
          "trastornos alimentarios",
          "anorexia",
          "bulimia",
          "tratamiento nutricional",
        ],
      },
      {
        id: "embarazo-y-lactancia",
        name: "Embarazo y lactancia",
        title: "Nutricionistas especializados en embarazo y lactancia",
        subtitle: "Profesionales expertos en nutrición materno-infantil",
        searchPlaceholder: "Buscar nutricionista embarazo...",
        description:
          "Nutricionistas especializados en embarazo y lactancia. Alimentación saludable durante el embarazo y la lactancia materna.",
        keywords: [
          "embarazo",
          "lactancia",
          "nutrición materna",
          "gestación",
          "bebé",
        ],
      },
      {
        id: "nutricion-infantil",
        name: "Nutrición infantil",
        title: "Nutricionistas especializados en niños",
        subtitle: "Profesionales expertos en alimentación infantil",
        searchPlaceholder: "Buscar nutricionista infantil...",
        description:
          "Nutricionistas especializados en nutrición infantil. Alimentación saludable para niños y adolescentes.",
        keywords: [
          "nutrición infantil",
          "niños",
          "adolescentes",
          "alimentación pediátrica",
          "crecimiento",
        ],
      },
      {
        id: "aumento-de-peso",
        name: "Aumento de peso",
        title: "Nutricionistas especializados en aumento de peso saludable",
        subtitle: "Profesionales expertos en ganancia de peso controlada",
        searchPlaceholder: "Buscar nutricionista aumento peso...",
        description:
          "Nutricionistas especializados en aumento de peso saludable. Dietas para ganar peso de forma controlada y saludable.",
        keywords: [
          "aumento de peso",
          "ganar peso",
          "delgadez",
          "bajo peso",
          "masa muscular",
        ],
      },
      {
        id: "menopausia",
        name: "Menopausia",
        title: "Nutricionistas especializados en menopausia",
        subtitle: "Profesionales expertos en nutrición durante la menopausia",
        searchPlaceholder: "Buscar nutricionista menopausia...",
        description:
          "Nutricionistas especializados en menopausia. Alimentación saludable durante el climaterio y la menopausia.",
        keywords: [
          "menopausia",
          "climaterio",
          "hormonas",
          "osteoporosis",
          "mujer madura",
        ],
      },
      {
        id: "salud-intestinal",
        name: "Salud intestinal",
        title: "Nutricionistas especializados en salud digestiva",
        subtitle: "Profesionales expertos en microbiota y digestión",
        searchPlaceholder: "Buscar nutricionista digestivo...",
        description:
          "Nutricionistas especializados en salud intestinal. Tratamiento nutricional para problemas digestivos y microbiota.",
        keywords: [
          "salud intestinal",
          "digestión",
          "microbiota",
          "intestino",
          "problemas digestivos",
        ],
      },
      {
        id: "sibo-y-fodmap",
        name: "SIBO y dieta FODMAP",
        title: "Nutricionistas especializados en SIBO y dieta FODMAP",
        subtitle: "Profesionales expertos en trastornos digestivos",
        searchPlaceholder: "Buscar nutricionista SIBO...",
        description:
          "Nutricionistas especializados en SIBO y dieta FODMAP. Tratamiento nutricional para sobrecrecimiento bacteriano.",
        keywords: [
          "SIBO",
          "FODMAP",
          "sobrecrecimiento bacteriano",
          "intestino irritable",
          "dieta baja FODMAP",
        ],
      },
      {
        id: "obesidad",
        name: "Obesidad",
        title: "Nutricionistas especializados en obesidad",
        subtitle: "Profesionales expertos en tratamiento de la obesidad",
        searchPlaceholder: "Buscar nutricionista obesidad...",
        description:
          "Nutricionistas especializados en obesidad. Tratamiento nutricional integral para el manejo del sobrepeso y obesidad.",
        keywords: [
          "obesidad",
          "sobrepeso",
          "tratamiento obesidad",
          "bariátrica",
          "metabolismo",
        ],
      },
      {
        id: "tiroides",
        name: "Tiroides",
        title: "Nutricionistas especializados en tiroides",
        subtitle:
          "Profesionales expertos en nutrición para problemas tiroideos",
        searchPlaceholder: "Buscar nutricionista tiroides...",
        description:
          "Nutricionistas especializados en tiroides. Alimentación saludable para hipotiroidismo, hipertiroidismo y otros problemas tiroideos.",
        keywords: [
          "tiroides",
          "hipotiroidismo",
          "hipertiroidismo",
          "hormonas tiroideas",
          "metabolismo",
        ],
      },
      {
        id: "alergias-e-intolerancias",
        name: "Alergias e intolerancias",
        title: "Nutricionistas especializados en alergias e intolerancias",
        subtitle: "Profesionales expertos en alimentación sin alérgenos",
        searchPlaceholder: "Buscar nutricionista alergias...",
        description:
          "Nutricionistas especializados en alergias e intolerancias alimentarias. Dietas de exclusión y alternativas saludables.",
        keywords: [
          "alergias",
          "intolerancias",
          "celiaquía",
          "lactosa",
          "gluten",
          "alérgenos",
        ],
      },
      {
        id: "nutricion-clinica",
        name: "Nutrición clínica",
        title: "Nutricionistas especializados en nutrición clínica",
        subtitle: "Profesionales expertos en patologías y hospitalización",
        searchPlaceholder: "Buscar nutricionista clínico...",
        description:
          "Nutricionistas especializados en nutrición clínica. Tratamiento nutricional para pacientes hospitalizados y patologías.",
        keywords: [
          "nutrición clínica",
          "hospital",
          "patologías",
          "enfermedades",
          "tratamiento médico",
        ],
      },
      {
        id: "nutricionista-oncologico",
        name: "Nutricionista oncológico",
        title: "Nutricionistas especializados en oncología",
        subtitle: "Profesionales expertos en nutrición durante el cáncer",
        searchPlaceholder: "Buscar nutricionista oncológico...",
        description:
          "Nutricionistas especializados en oncología. Alimentación durante el tratamiento del cáncer y recuperación.",
        keywords: [
          "nutrición oncológica",
          "cáncer",
          "quimioterapia",
          "radioterapia",
          "recuperación",
        ],
      },
    ],
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
        slug: "julio-basulto-marset",
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
        slug: "ximena-de-la-serna",
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
        slug: "carlos-rios-crespo",
      },
    ],
  },
  terapias: {
    id: "terapias",
    name: "Terapias Psicológicas",
    title: "Conecta con el terapeuta perfecto para ti",
    subtitle: "Psicólogos y terapeutas especializados en diferentes enfoques",
    searchPlaceholder: "Buscar psicólogo, terapeuta...",
    services: [
      {
        id: "depresion",
        name: "Depresión",
        title: "Psicólogos especializados en depresión",
        subtitle: "Profesionales expertos en tratamiento de la depresión",
        searchPlaceholder: "Buscar psicólogo depresión...",
        description:
          "Psicólogos especializados en depresión. Tratamiento psicológico efectivo para superar la depresión y mejorar el bienestar mental.",
        keywords: [
          "depresión",
          "tratamiento depresión",
          "psicólogo",
          "terapia",
          "bienestar mental",
        ],
      },
      {
        id: "ansiedad",
        name: "Ansiedad",
        title: "Psicólogos especializados en ansiedad",
        subtitle: "Profesionales expertos en tratamiento de la ansiedad",
        searchPlaceholder: "Buscar psicólogo ansiedad...",
        description:
          "Psicólogos especializados en ansiedad. Terapia psicológica para controlar la ansiedad y mejorar la calidad de vida.",
        keywords: [
          "ansiedad",
          "tratamiento ansiedad",
          "psicólogo",
          "terapia",
          "estrés",
        ],
      },
      {
        id: "fobias",
        name: "Fobias",
        title: "Psicólogos especializados en fobias",
        subtitle: "Profesionales expertos en tratamiento de fobias específicas",
        searchPlaceholder: "Buscar psicólogo fobias...",
        description:
          "Psicólogos especializados en fobias. Tratamiento psicológico para superar miedos irracionales y fobias específicas.",
        keywords: [
          "fobias",
          "miedos",
          "tratamiento fobias",
          "psicólogo",
          "terapia",
        ],
      },
      {
        id: "pareja",
        name: "Terapia de pareja",
        title: "Psicólogos especializados en terapia de pareja",
        subtitle: "Profesionales expertos en relaciones de pareja",
        searchPlaceholder: "Buscar psicólogo pareja...",
        description:
          "Psicólogos especializados en terapia de pareja. Mejora la comunicación y fortalece tu relación de pareja.",
        keywords: [
          "terapia pareja",
          "relaciones",
          "psicólogo pareja",
          "matrimonio",
          "comunicación",
        ],
      },
      {
        id: "trastornos-conducta-alimentaria",
        name: "Trastornos de conducta alimentaria",
        title: "Psicólogos especializados en TCA",
        subtitle: "Profesionales expertos en trastornos alimentarios",
        searchPlaceholder: "Buscar psicólogo TCA...",
        description:
          "Psicólogos especializados en trastornos de la conducta alimentaria. Tratamiento psicológico para anorexia, bulimia y otros TCA.",
        keywords: [
          "TCA",
          "trastornos alimentarios",
          "anorexia",
          "bulimia",
          "psicólogo",
        ],
      },
      {
        id: "duelo",
        name: "Duelo: pérdida de un ser querido",
        title: "Psicólogos especializados en duelo",
        subtitle: "Profesionales expertos en acompañamiento en el duelo",
        searchPlaceholder: "Buscar psicólogo duelo...",
        description:
          "Psicólogos especializados en duelo. Acompañamiento psicológico para superar la pérdida de un ser querido.",
        keywords: ["duelo", "pérdida", "luto", "psicólogo", "acompañamiento"],
      },
      {
        id: "baja-autoestima",
        name: "Baja autoestima",
        title: "Psicólogos especializados en autoestima",
        subtitle: "Profesionales expertos en mejora de la autoestima",
        searchPlaceholder: "Buscar psicólogo autoestima...",
        description:
          "Psicólogos especializados en autoestima. Terapia psicológica para mejorar la confianza y el amor propio.",
        keywords: [
          "autoestima",
          "confianza",
          "psicólogo",
          "terapia",
          "bienestar",
        ],
      },
      {
        id: "obsesiones",
        name: "Obsesiones",
        title: "Psicólogos especializados en obsesiones",
        subtitle: "Profesionales expertos en TOC y pensamientos obsesivos",
        searchPlaceholder: "Buscar psicólogo obsesiones...",
        description:
          "Psicólogos especializados en obsesiones y TOC. Tratamiento psicológico para pensamientos obsesivos y compulsiones.",
        keywords: ["obsesiones", "TOC", "compulsiones", "psicólogo", "terapia"],
      },
      {
        id: "trauma-y-tept",
        name: "Trauma y TEPT",
        title: "Psicólogos especializados en trauma",
        subtitle: "Profesionales expertos en TEPT y trauma psicológico",
        searchPlaceholder: "Buscar psicólogo trauma...",
        description:
          "Psicólogos especializados en trauma y TEPT. Tratamiento psicológico para superar experiencias traumáticas.",
        keywords: [
          "trauma",
          "TEPT",
          "estrés postraumático",
          "psicólogo",
          "terapia",
        ],
      },
      {
        id: "problemas-sexuales",
        name: "Problemas sexuales",
        title: "Psicólogos especializados en sexualidad",
        subtitle: "Profesionales expertos en terapia sexual",
        searchPlaceholder: "Buscar psicólogo sexual...",
        description:
          "Psicólogos especializados en sexualidad. Terapia psicológica para problemas sexuales y mejora de la intimidad.",
        keywords: [
          "sexualidad",
          "terapia sexual",
          "psicólogo",
          "intimidad",
          "problemas sexuales",
        ],
      },
      {
        id: "psico-oncologia",
        name: "Psico-oncología",
        title: "Psicólogos especializados en oncología",
        subtitle:
          "Profesionales expertos en apoyo psicológico durante el cáncer",
        searchPlaceholder: "Buscar psicólogo oncológico...",
        description:
          "Psicólogos especializados en psico-oncología. Apoyo psicológico durante el tratamiento del cáncer y recuperación.",
        keywords: [
          "psico-oncología",
          "cáncer",
          "apoyo psicológico",
          "psicólogo",
          "recuperación",
        ],
      },
    ],
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
        slug: "lucia-redondo-ruiz",
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
        slug: "fernanda-alvarado-aguilar",
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
        slug: "samantha-pena-rodriguez",
      },
    ],
  },
  logopedas: {
    id: "logopedas",
    name: "Logopedia y Terapia del Habla",
    title: "Especialistas en comunicación y lenguaje",
    subtitle: "Logopedas certificados para todas las edades",
    searchPlaceholder: "Buscar logopeda, fonoaudiólogo...",
    services: [
      {
        id: "trastornos-del-habla",
        name: "Trastornos del habla",
        title: "Logopedas especializados en trastornos del habla",
        subtitle:
          "Profesionales expertos en problemas de pronunciación y articulación",
        searchPlaceholder: "Buscar logopeda habla...",
        description:
          "Logopedas especializados en trastornos del habla. Tratamiento para problemas de pronunciación, articulación y fluidez.",
        keywords: [
          "trastornos habla",
          "pronunciación",
          "articulación",
          "logopeda",
          "dislalia",
        ],
      },
      {
        id: "trastornos-del-lenguaje",
        name: "Trastornos del lenguaje",
        title: "Logopedas especializados en trastornos del lenguaje",
        subtitle: "Profesionales expertos en desarrollo del lenguaje",
        searchPlaceholder: "Buscar logopeda lenguaje...",
        description:
          "Logopedas especializados en trastornos del lenguaje. Tratamiento para retrasos y alteraciones del desarrollo del lenguaje.",
        keywords: [
          "trastornos lenguaje",
          "desarrollo lenguaje",
          "retraso lenguaje",
          "logopeda",
          "TEL",
        ],
      },
      {
        id: "trastornos-auditivos",
        name: "Trastornos auditivos",
        title: "Logopedas especializados en trastornos auditivos",
        subtitle: "Profesionales expertos en rehabilitación auditiva",
        searchPlaceholder: "Buscar logopeda auditivo...",
        description:
          "Logopedas especializados en trastornos auditivos. Rehabilitación del lenguaje en personas con problemas de audición.",
        keywords: [
          "trastornos auditivos",
          "rehabilitación auditiva",
          "hipoacusia",
          "logopeda",
          "implante coclear",
        ],
      },
      {
        id: "dificultades-neurologicas",
        name: "Dificultades de origen neurológico",
        title: "Logopedas especializados en neurología",
        subtitle: "Profesionales expertos en rehabilitación neurológica",
        searchPlaceholder: "Buscar logopeda neurológico...",
        description:
          "Logopedas especializados en dificultades neurológicas. Rehabilitación del lenguaje tras daño cerebral o enfermedades neurológicas.",
        keywords: [
          "neurología",
          "daño cerebral",
          "ictus",
          "logopeda",
          "rehabilitación neurológica",
        ],
      },
      {
        id: "dificultades-de-aprendizaje",
        name: "Dificultades de aprendizaje",
        title: "Logopedas especializados en dificultades de aprendizaje",
        subtitle: "Profesionales expertos en problemas escolares",
        searchPlaceholder: "Buscar logopeda aprendizaje...",
        description:
          "Logopedas especializados en dificultades de aprendizaje. Tratamiento para dislexia, disgrafía y otros problemas escolares.",
        keywords: [
          "dificultades aprendizaje",
          "dislexia",
          "disgrafía",
          "logopeda",
          "problemas escolares",
        ],
      },
      {
        id: "problemas-de-deglucion",
        name: "Problemas de deglución",
        title: "Logopedas especializados en deglución",
        subtitle: "Profesionales expertos en trastornos de la deglución",
        searchPlaceholder: "Buscar logopeda deglución...",
        description:
          "Logopedas especializados en problemas de deglución. Tratamiento para disfagia y trastornos de la alimentación.",
        keywords: [
          "deglución",
          "disfagia",
          "alimentación",
          "logopeda",
          "terapia miofuncional",
        ],
      },
    ],
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
        slug: "mariana-camarena-meza",
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
        slug: "silvia-romero-montes",
      },
    ],
  },
  "consultas-legales": {
    id: "consultas-legales",
    name: "Consultas Legales",
    title: "Asesoría legal profesional y confiable",
    subtitle: "Abogados especializados en diferentes áreas del derecho",
    searchPlaceholder: "Buscar abogado, asesor legal...",
    services: [
      {
        id: "divorcio",
        name: "Divorcio",
        title: "Abogados especializados en divorcio",
        subtitle: "Profesionales expertos en procesos de separación y divorcio",
        searchPlaceholder: "Buscar abogado divorcio...",
        description:
          "Abogados especializados en divorcio. Asesoría legal para procesos de separación, divorcio y custodia de menores.",
        keywords: [
          "divorcio",
          "separación",
          "custodia",
          "abogado",
          "derecho familiar",
        ],
      },
      {
        id: "compraventa-inmuebles",
        name: "Compraventa de inmuebles",
        title: "Abogados especializados en compraventa inmobiliaria",
        subtitle: "Profesionales expertos en transacciones inmobiliarias",
        searchPlaceholder: "Buscar abogado inmobiliario...",
        description:
          "Abogados especializados en compraventa de inmuebles. Asesoría legal para transacciones inmobiliarias seguras.",
        keywords: [
          "compraventa",
          "inmuebles",
          "inmobiliario",
          "abogado",
          "transacciones",
        ],
      },
      {
        id: "herencias",
        name: "Herencias",
        title: "Abogados especializados en herencias",
        subtitle: "Profesionales expertos en derecho sucesorio",
        searchPlaceholder: "Buscar abogado herencias...",
        description:
          "Abogados especializados en herencias. Asesoría legal para procesos sucesorios, testamentos y reparto de bienes.",
        keywords: [
          "herencias",
          "sucesiones",
          "testamento",
          "abogado",
          "derecho sucesorio",
        ],
      },
      {
        id: "nie-comunitarios",
        name: "Tramitación de NIE para comunitarios",
        title: "Abogados especializados en NIE comunitarios",
        subtitle: "Profesionales expertos en documentación de extranjeros",
        searchPlaceholder: "Buscar abogado NIE...",
        description:
          "Abogados especializados en NIE para ciudadanos comunitarios. Asesoría legal para documentación de extranjeros.",
        keywords: [
          "NIE",
          "comunitarios",
          "extranjeros",
          "abogado",
          "documentación",
        ],
      },
      {
        id: "custodia",
        name: "Custodia",
        title: "Abogados especializados en custodia de menores",
        subtitle: "Profesionales expertos en derecho de familia",
        searchPlaceholder: "Buscar abogado custodia...",
        description:
          "Abogados especializados en custodia de menores. Asesoría legal para régimen de visitas y custodia compartida.",
        keywords: [
          "custodia",
          "menores",
          "visitas",
          "abogado",
          "derecho familiar",
        ],
      },
      {
        id: "reclamacion-pensiones",
        name: "Reclamación de pensiones",
        title: "Abogados especializados en reclamación de pensiones",
        subtitle:
          "Profesionales expertos en derecho laboral y seguridad social",
        searchPlaceholder: "Buscar abogado pensiones...",
        description:
          "Abogados especializados en reclamación de pensiones. Asesoría legal para reclamar pensiones y prestaciones.",
        keywords: [
          "pensiones",
          "reclamación",
          "seguridad social",
          "abogado",
          "derecho laboral",
        ],
      },
      {
        id: "matrimonio-y-filiaciones",
        name: "Matrimonio y filiaciones",
        title: "Abogados especializados en matrimonio y filiaciones",
        subtitle: "Profesionales expertos en derecho de familia",
        searchPlaceholder: "Buscar abogado matrimonio...",
        description:
          "Abogados especializados en matrimonio y filiaciones. Asesoría legal para uniones matrimoniales y reconocimiento de paternidad.",
        keywords: [
          "matrimonio",
          "filiaciones",
          "paternidad",
          "abogado",
          "derecho familiar",
        ],
      },
      {
        id: "contrato-de-alquiler",
        name: "Contrato de alquiler",
        title: "Abogados especializados en contratos de alquiler",
        subtitle: "Profesionales expertos en derecho inmobiliario",
        searchPlaceholder: "Buscar abogado alquiler...",
        description:
          "Abogados especializados en contratos de alquiler. Asesoría legal para arrendamientos y conflictos inquilino-propietario.",
        keywords: [
          "alquiler",
          "arrendamiento",
          "inquilino",
          "abogado",
          "derecho inmobiliario",
        ],
      },
      {
        id: "desahucios",
        name: "Desahucios",
        title: "Abogados especializados en desahucios",
        subtitle: "Profesionales expertos en procedimientos de desalojo",
        searchPlaceholder: "Buscar abogado desahucio...",
        description:
          "Abogados especializados en desahucios. Asesoría legal para procedimientos de desalojo y defensa de inquilinos.",
        keywords: [
          "desahucio",
          "desalojo",
          "inquilino",
          "abogado",
          "derecho inmobiliario",
        ],
      },
      {
        id: "estafas-inmobiliarias",
        name: "Estafas inmobiliarias",
        title: "Abogados especializados en estafas inmobiliarias",
        subtitle:
          "Profesionales expertos en defensa contra fraudes inmobiliarios",
        searchPlaceholder: "Buscar abogado estafa...",
        description:
          "Abogados especializados en estafas inmobiliarias. Asesoría legal para víctimas de fraudes inmobiliarios.",
        keywords: ["estafas", "fraudes", "inmobiliario", "abogado", "defensa"],
      },
      {
        id: "comunidades-de-propietarios",
        name: "Comunidades de propietarios",
        title: "Abogados especializados en comunidades de propietarios",
        subtitle: "Profesionales expertos en derecho de propiedad horizontal",
        searchPlaceholder: "Buscar abogado comunidad...",
        description:
          "Abogados especializados en comunidades de propietarios. Asesoría legal para conflictos vecinales y administración.",
        keywords: [
          "comunidad",
          "propietarios",
          "vecinos",
          "abogado",
          "propiedad horizontal",
        ],
      },
      {
        id: "testamento-notarial",
        name: "Testamento notarial",
        title: "Abogados especializados en testamentos notariales",
        subtitle: "Profesionales expertos en planificación sucesoria",
        searchPlaceholder: "Buscar abogado testamento...",
        description:
          "Abogados especializados en testamentos notariales. Asesoría legal para planificación sucesoria y testamentos.",
        keywords: [
          "testamento",
          "notarial",
          "sucesiones",
          "abogado",
          "planificación",
        ],
      },
      {
        id: "donaciones",
        name: "Donaciones",
        title: "Abogados especializados en donaciones",
        subtitle: "Profesionales expertos en derecho civil y fiscal",
        searchPlaceholder: "Buscar abogado donaciones...",
        description:
          "Abogados especializados en donaciones. Asesoría legal para donaciones inter vivos y aspectos fiscales.",
        keywords: [
          "donaciones",
          "inter vivos",
          "fiscal",
          "abogado",
          "derecho civil",
        ],
      },
      {
        id: "fiscalidad-de-herencias",
        name: "Fiscalidad de herencias",
        title: "Abogados especializados en fiscalidad de herencias",
        subtitle: "Profesionales expertos en derecho fiscal y sucesorio",
        searchPlaceholder: "Buscar abogado fiscal herencias...",
        description:
          "Abogados especializados en fiscalidad de herencias. Asesoría legal para optimización fiscal en sucesiones.",
        keywords: [
          "fiscalidad",
          "herencias",
          "impuestos",
          "abogado",
          "optimización fiscal",
        ],
      },
      {
        id: "reclamacion-de-herencias",
        name: "Reclamación de herencias",
        title: "Abogados especializados en reclamación de herencias",
        subtitle: "Profesionales expertos en derecho sucesorio y hereditario",
        searchPlaceholder: "Buscar abogado reclamar herencia...",
        description:
          "Abogados especializados en reclamación de herencias. Asesoría legal para reclamar derechos hereditarios.",
        keywords: [
          "reclamación",
          "herencias",
          "derechos hereditarios",
          "abogado",
          "sucesiones",
        ],
      },
      {
        id: "renuncia-de-herencias",
        name: "Renuncia de herencias",
        title: "Abogados especializados en renuncia de herencias",
        subtitle: "Profesionales expertos en derecho sucesorio",
        searchPlaceholder: "Buscar abogado renuncia herencia...",
        description:
          "Abogados especializados en renuncia de herencias. Asesoría legal para renunciar a herencias y sus consecuencias.",
        keywords: [
          "renuncia",
          "herencias",
          "sucesiones",
          "abogado",
          "derecho sucesorio",
        ],
      },
      {
        id: "nacionalidad-espanola",
        name: "Nacionalidad española",
        title: "Abogados especializados en nacionalidad española",
        subtitle: "Profesionales expertos en derecho de extranjería",
        searchPlaceholder: "Buscar abogado nacionalidad...",
        description:
          "Abogados especializados en nacionalidad española. Asesoría legal para obtener la nacionalidad española.",
        keywords: [
          "nacionalidad",
          "española",
          "extranjería",
          "abogado",
          "ciudadanía",
        ],
      },
      {
        id: "residencia-extranjeros-no-comunitarios",
        name: "Residencia para extranjeros no comunitarios",
        title: "Abogados especializados en residencia de extranjeros",
        subtitle: "Profesionales expertos en derecho de extranjería",
        searchPlaceholder: "Buscar abogado residencia...",
        description:
          "Abogados especializados en residencia para extranjeros no comunitarios. Asesoría legal para permisos de residencia.",
        keywords: [
          "residencia",
          "extranjeros",
          "permisos",
          "abogado",
          "derecho extranjería",
        ],
      },
    ],
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
        slug: "roberto-mendoza",
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
        slug: "ana-garcia-lopez",
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
        slug: "miguel-torres",
      },
    ],
  },
  "desarrollo-personal": {
    id: "desarrollo-personal",
    name: "Desarrollo Personal",
    title: "Coaches y mentores para tu crecimiento",
    subtitle: "Especialistas en desarrollo personal y profesional",
    searchPlaceholder: "Buscar coach, mentor, desarrollo...",
    services: [
      {
        id: "liderazgo",
        name: "Liderazgo",
        title: "Coaches especializados en liderazgo",
        subtitle:
          "Profesionales expertos en desarrollo de habilidades de liderazgo",
        searchPlaceholder: "Buscar coach liderazgo...",
        description:
          "Coaches especializados en liderazgo. Desarrollo de habilidades directivas y de gestión de equipos.",
        keywords: ["liderazgo", "coaching", "directivos", "gestión", "equipos"],
      },
      {
        id: "habilidades-sociales",
        name: "Habilidades sociales",
        title: "Coaches especializados en habilidades sociales",
        subtitle: "Profesionales expertos en comunicación interpersonal",
        searchPlaceholder: "Buscar coach habilidades sociales...",
        description:
          "Coaches especializados en habilidades sociales. Mejora de la comunicación y relaciones interpersonales.",
        keywords: [
          "habilidades sociales",
          "comunicación",
          "relaciones",
          "coaching",
          "interpersonal",
        ],
      },
      {
        id: "hablar-en-publico",
        name: "Hablar en público",
        title: "Coaches especializados en oratoria",
        subtitle:
          "Profesionales expertos en presentaciones y hablar en público",
        searchPlaceholder: "Buscar coach oratoria...",
        description:
          "Coaches especializados en hablar en público. Superación del miedo escénico y mejora de presentaciones.",
        keywords: [
          "oratoria",
          "presentaciones",
          "miedo escénico",
          "coaching",
          "comunicación",
        ],
      },
      {
        id: "comunicacion-no-verbal",
        name: "Comunicación no verbal",
        title: "Coaches especializados en comunicación no verbal",
        subtitle: "Profesionales expertos en lenguaje corporal y expresión",
        searchPlaceholder: "Buscar coach comunicación no verbal...",
        description:
          "Coaches especializados en comunicación no verbal. Mejora del lenguaje corporal y expresión gestual.",
        keywords: [
          "comunicación no verbal",
          "lenguaje corporal",
          "expresión",
          "coaching",
          "gestos",
        ],
      },
      {
        id: "relaciones-de-pareja",
        name: "Relaciones de pareja",
        title: "Coaches especializados en relaciones de pareja",
        subtitle: "Profesionales expertos en coaching de pareja",
        searchPlaceholder: "Buscar coach pareja...",
        description:
          "Coaches especializados en relaciones de pareja. Mejora de la comunicación y fortalecimiento de vínculos.",
        keywords: [
          "relaciones pareja",
          "coaching pareja",
          "comunicación",
          "vínculos",
          "coaching",
        ],
      },
      {
        id: "relaciones-interpersonales",
        name: "Relaciones interpersonales",
        title: "Coaches especializados en relaciones interpersonales",
        subtitle: "Profesionales expertos en habilidades de relación",
        searchPlaceholder: "Buscar coach relaciones...",
        description:
          "Coaches especializados en relaciones interpersonales. Desarrollo de habilidades para relacionarse mejor.",
        keywords: [
          "relaciones interpersonales",
          "habilidades",
          "coaching",
          "comunicación",
          "social",
        ],
      },
    ],
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
        slug: "monica-katz-goldstein",
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
        slug: "carlos-martinez",
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
        slug: "laura-fernandez",
      },
    ],
  },
};
