"use client";

import { useState } from "react";
import {
  Edit,
  Plus,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function AdminAjustesPage() {
  const [activeSection, setActiveSection] = useState("categorias");
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [isProfessionalsModalOpen, setIsProfessionalsModalOpen] =
    useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedProfessionals, setSelectedProfessionals] = useState<number[]>(
    []
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [isAddSpecialtyModalOpen, setIsAddSpecialtyModalOpen] = useState(false);
  const [newSpecialtyName, setNewSpecialtyName] = useState("");
  const [newSpecialtySubcategories, setNewSpecialtySubcategories] =
    useState("");
  const [policyContent, setPolicyContent] = useState({
    "Politica de Privacidad": `Última actualización: 30 de julio de 2025

En NAXINE, nos comprometemos a proteger tu privacidad y tus datos personales. Esta política explica cómo recopilamos, usamos y protegemos tu información al utilizar nuestra plataforma.

1. ¿Quién es el responsable del tratamiento de tus datos?

NAXINE (nombre comercial operado por un empresario individual)
Email: privacidad@naxine.com
Dirección: Calle de la Princesa 31, planta 2, puerta 2, Madrid, 28008, España.

El tratamiento de datos se realiza conforme al Reglamento (UE) 2016/679 (GDPR) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).

2. ¿Qué datos personales recogemos?

Recopilamos diferentes tipos de datos según el uso que hagas de la plataforma:

- Datos de identificación: nombre, apellidos, email, teléfono
- Datos de acceso: usuario, IP, idioma, país
- Datos profesionales: titulación, número de colegiado, experiencia (para profesionales)
- Datos de reservas: fecha, modalidad (online/presencial/a domicilio), especialidad
- Datos de pago: procesados de forma segura a través de Stripe. NAXINE no almacena números de tarjeta
- Datos de navegación: cookies, preferencias, historial de uso

3. ¿Con qué finalidad tratamos tus datos?

- Gestionar el registro y acceso a la plataforma
- Conectar clientes y profesionales, facilitar reservas y pagos
- Enviar comunicaciones operativas y recordatorios de sesiones
- Fines administrativos, contables y fiscales
- Mejorar la experiencia del usuario (cookies analíticas, personalización)
- Cumplir obligaciones legales (facturación, seguridad, etc.)

4. ¿Cuál es la base legal para el tratamiento?

- Ejecución de contrato: cuando reservas sesiones o prestas servicios a través de NAXINE
- Consentimiento: al aceptar cookies o recibir comunicaciones comerciales
- Obligación legal: para cumplir normativas fiscales, contables y de protección de datos
- Interés legítimo: para garantizar la seguridad de la plataforma y prevenir fraudes`,
    "Politica de Cookies": `Última actualización: 30 de julio de 2025

En NAXINE utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestra plataforma.

¿Qué son las cookies?

Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a recordar tus preferencias y mejorar la funcionalidad del sitio.

Tipos de cookies que utilizamos:

- Cookies técnicas: Necesarias para el funcionamiento básico del sitio
- Cookies de rendimiento: Nos ayudan a entender cómo interactúas con el sitio
- Cookies de funcionalidad: Recuerdan tus preferencias y configuraciones
- Cookies de marketing: Utilizadas para mostrar publicidad relevante

¿Cómo puedes gestionar las cookies?

Puedes configurar tu navegador para aceptar o rechazar cookies. Ten en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.`,
    "Politica de Cancelacion": `Última actualización: 30 de julio de 2025

Política de Cancelación y Reembolsos

Cancelaciones por parte del cliente:

- Cancelación con más de 24 horas de antelación: Reembolso completo
- Cancelación entre 2-24 horas: Reembolso del 50%
- Cancelación con menos de 2 horas: Sin reembolso

Cancelaciones por parte del profesional:

- El profesional debe notificar con al menos 4 horas de antelación
- Se ofrecerá reprogramación o reembolso completo
- En caso de cancelación repetida, se evaluará la continuidad del profesional

Proceso de reembolso:

- Los reembolsos se procesan en un plazo de 5-10 días hábiles
- Se realizarán al método de pago original
- Se enviará confirmación por email una vez procesado

Excepciones:

- En caso de emergencia médica, se aplicarán políticas especiales
- Los paquetes de sesiones tienen políticas específicas de cancelación`,
    "Términos y Condiciones": `Última actualización: 30 de julio de 2025

Términos y Condiciones de Uso de NAXINE

1. Aceptación de los términos

Al acceder y utilizar la plataforma NAXINE, aceptas estos términos y condiciones. Si no estás de acuerdo, no debes usar nuestros servicios.

2. Descripción del servicio

NAXINE es una plataforma que conecta clientes con profesionales de la salud para sesiones de consulta online, presenciales o a domicilio.

3. Registro y cuenta de usuario

- Debes proporcionar información veraz y actualizada
- Eres responsable de mantener la confidencialidad de tu cuenta
- Debes notificarnos inmediatamente cualquier uso no autorizado

4. Uso de la plataforma

- No puedes usar la plataforma para actividades ilegales
- Debes respetar a otros usuarios y profesionales
- No puedes interferir con el funcionamiento de la plataforma

5. Responsabilidades del profesional

- Debe tener las licencias y certificaciones necesarias
- Debe mantener la confidencialidad de la información del cliente
- Debe cumplir con los estándares de calidad establecidos

6. Limitación de responsabilidad

NAXINE actúa como intermediario. No somos responsables de la calidad de los servicios prestados por los profesionales.

7. Modificaciones

Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios se notificarán a través de la plataforma.

8. Ley aplicable

Estos términos se rigen por la legislación española.`,
  });

  const specialtyServices = {
    Nutriología: [
      { id: 1, name: "Dieta para adelgazar", professionals: 8 },
      { id: 2, name: "Dieta deportiva", professionals: 9 },
      { id: 3, name: "Educación Nutricional", professionals: 10 },
      { id: 4, name: "Salud Intestinal", professionals: 4 },
      { id: 5, name: "Perdida de peso", professionals: 6 },
      { id: 6, name: "Vegetarianos y veganos", professionals: 6 },
      { id: 7, name: "Nutricion Infantil", professionals: 6 },
      { id: 8, name: "Embarazo", professionals: 6 },
    ],
    Psicología: [
      { id: 1, name: "Terapia para ansiedad", professionals: 12 },
      { id: 2, name: "Terapia para pareja", professionals: 8 },
      { id: 3, name: "Terapia depresión", professionals: 15 },
      { id: 4, name: "Terapia infantil", professionals: 7 },
      { id: 5, name: "Terapia familiar", professionals: 9 },
      { id: 6, name: "Terapia cognitivo-conductual", professionals: 11 },
      { id: 7, name: "Terapia de duelo", professionals: 5 },
      { id: 8, name: "Terapia de autoestima", professionals: 6 },
      { id: 9, name: "Terapia de estrés", professionals: 10 },
    ],
    Fisioterapia: [
      { id: 1, name: "Fisioterapia deportiva", professionals: 14 },
      { id: 2, name: "Suelo pélvico", professionals: 8 },
      { id: 3, name: "Fisioterapia neurológica", professionals: 6 },
      { id: 4, name: "Fisioterapia ortopédica", professionals: 12 },
      { id: 5, name: "Fisioterapia geriátrica", professionals: 9 },
      { id: 6, name: "Fisioterapia respiratoria", professionals: 7 },
      { id: 7, name: "Fisioterapia pediátrica", professionals: 5 },
      { id: 8, name: "Fisioterapia traumatológica", professionals: 11 },
      { id: 9, name: "Fisioterapia reumatológica", professionals: 4 },
      { id: 10, name: "Fisioterapia cardiovascular", professionals: 3 },
    ],
    "Desarrollo Personal": [
      { id: 1, name: "Liderazgo", professionals: 8 },
      { id: 2, name: "Habilidades sociales", professionals: 6 },
      { id: 3, name: "Hablar en público", professionals: 9 },
      { id: 4, name: "Gestión del tiempo", professionals: 7 },
    ],
    Logopedas: [
      { id: 1, name: "Trastornos del habla", professionals: 8 },
      { id: 2, name: "Trastornos del lenguaje", professionals: 10 },
      { id: 3, name: "Disfonía", professionals: 5 },
      { id: 4, name: "Disfagia", professionals: 4 },
      { id: 5, name: "Afasia", professionals: 6 },
      { id: 6, name: "Dislexia", professionals: 7 },
    ],
  };

  const [servicesData, setServicesData] = useState(specialtyServices);
  const [categoriesData, setCategoriesData] = useState([
    {
      id: 1,
      specialty: "Nutriología",
      subcategories:
        "Dietas para adelgazar, dietas para ansiedad, dieta deportiva...",
      services: 8,
      professionals: 8,
    },
    {
      id: 2,
      specialty: "Psicología",
      subcategories:
        "Terapia para ansiedad, terapia para pareja, terapia depresión...",
      services: 9,
      professionals: 9,
    },
    {
      id: 3,
      specialty: "Fisioterapia",
      subcategories:
        "Deportiva, suelo pélvico, neurológica, ortopédica, geriátrica...",
      services: 10,
      professionals: 10,
    },
    {
      id: 4,
      specialty: "Desarrollo Personal",
      subcategories: "Liderazgo, habilidades sociales, hablar en publico...",
      services: 4,
      professionals: 4,
    },
    {
      id: 5,
      specialty: "Logopedas",
      subcategories: "Trastornos del habla, trastornos del lenguaje...",
      services: 6,
      professionals: 6,
    },
  ]);

  const nutritionProfessionals = [
    {
      id: 1,
      name: "John Bushmill",
      email: "Johnb@mail.com",
      phone: "078 5054 8877",
      professionalNumber: "00000001",
      specialty: "Nutriología",
    },
    {
      id: 2,
      name: "Laura Prichet",
      email: "laura_prichet@mail.com",
      phone: "215 302 3376",
      professionalNumber: "00000002",
      specialty: "Nutriología",
    },
    {
      id: 3,
      name: "Mohammad Karim",
      email: "m_karim@mail.com",
      phone: "050 414 8778",
      professionalNumber: "00000003",
      specialty: "Nutriología",
    },
    {
      id: 4,
      name: "Josh Bill",
      email: "josh_bill@mail.com",
      phone: "216 75 612 706",
      professionalNumber: "00000004",
      specialty: "Nutriología",
    },
    {
      id: 5,
      name: "Josh Adam",
      email: "josh_adam@mail.com",
      phone: "02 75 150 655",
      professionalNumber: "00000005",
      specialty: "Nutriología",
    },
    {
      id: 6,
      name: "Sin Tae",
      email: "sin_tae@mail.com",
      phone: "078 6013 3854",
      professionalNumber: "00000006",
      specialty: "Nutriología",
    },
    {
      id: 7,
      name: "Rajesh Masvidal",
      email: "rajesh_m@mail.com",
      phone: "828 216 2190",
      professionalNumber: "00000007",
      specialty: "Nutriología",
    },
    {
      id: 8,
      name: "Fajar Surya",
      email: "fsurya@mail.com",
      phone: "078 7173 9261",
      professionalNumber: "00000008",
      specialty: "Nutriología",
    },
    {
      id: 9,
      name: "Lisa Greg",
      email: "lisag@mail.com",
      phone: "077 6157 4248",
      professionalNumber: "00000009",
      specialty: "Nutriología",
    },
    {
      id: 10,
      name: "Linda Blair",
      email: "lindablair@mail.com",
      phone: "050 414 8778",
      professionalNumber: "00000010",
      specialty: "Nutriología",
    },
  ];

  const handleModifySpecialty = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setIsSpecialtyModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSpecialtyModalOpen(false);
    setSelectedSpecialty("");
  };

  const handleAddService = () => {
    setIsAddServiceModalOpen(true);
  };

  const handleCloseAddServiceModal = () => {
    setIsAddServiceModalOpen(false);
    setNewServiceName("");
  };

  const handleConfirmAddService = () => {
    if (newServiceName.trim() && selectedSpecialty) {
      const newService = {
        id: Date.now(), // Simple ID generation
        name: newServiceName.trim(),
        professionals: Math.floor(Math.random() * 10) + 1, // Random number between 1-10
      };

      setServicesData((prev) => ({
        ...prev,
        [selectedSpecialty]: [
          ...prev[selectedSpecialty as keyof typeof prev],
          newService,
        ],
      }));

      handleCloseAddServiceModal();
    }
  };

  const handleModifyService = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsProfessionalsModalOpen(true);
  };

  const handleCloseProfessionalsModal = () => {
    setIsProfessionalsModalOpen(false);
    setSelectedService("");
    setSelectedProfessionals([]);
  };

  const handleSelectProfessional = (professionalId: number) => {
    setSelectedProfessionals((prev) =>
      prev.includes(professionalId)
        ? prev.filter((id) => id !== professionalId)
        : [...prev, professionalId]
    );
  };

  const handleConfirmProfessionals = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmChanges = () => {
    console.log(
      "Selected professionals for service:",
      selectedService,
      selectedProfessionals
    );
    setIsConfirmModalOpen(false);
    handleCloseProfessionalsModal();
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  const handleSelectPolicy = (policy: string) => {
    setSelectedPolicy(policy);
    setActiveSection("paginas");
  };

  const handleSavePolicy = () => {
    console.log(
      "Saving policy:",
      selectedPolicy,
      policyContent[selectedPolicy as keyof typeof policyContent]
    );
    // Here you would typically save to a database or API
    alert(`Política "${selectedPolicy}" guardada exitosamente`);
  };

  const handleAddSpecialty = () => {
    setIsAddSpecialtyModalOpen(true);
  };

  const handleCloseAddSpecialtyModal = () => {
    setIsAddSpecialtyModalOpen(false);
    setNewSpecialtyName("");
    setNewSpecialtySubcategories("");
  };

  const handleConfirmAddSpecialty = () => {
    if (newSpecialtyName.trim()) {
      const newSpecialty = {
        id: Date.now(), // Simple ID generation
        specialty: newSpecialtyName.trim(),
        subcategories:
          newSpecialtySubcategories.trim() || "Sin subcategorías especificadas",
        services: 0,
        professionals: 0,
      };

      setCategoriesData((prev) => [...prev, newSpecialty]);

      // Also add to servicesData with empty array
      setServicesData((prev) => ({
        ...prev,
        [newSpecialtyName.trim()]: [],
      }));

      handleCloseAddSpecialtyModal();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Ajustes de la plataforma
        </h1>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection("categorias")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === "categorias"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Categorias
              </button>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Paginas de informacion
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSelectPolicy("Politica de Privacidad")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                      selectedPolicy === "Politica de Privacidad"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Politica de Privacidad
                  </button>
                  <button
                    onClick={() => handleSelectPolicy("Politica de Cookies")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                      selectedPolicy === "Politica de Cookies"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Politica de Cookies
                  </button>
                  <button
                    onClick={() =>
                      handleSelectPolicy("Politica de Cancelacion")
                    }
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                      selectedPolicy === "Politica de Cancelacion"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Politica de Cancelacion
                  </button>
                  <button
                    onClick={() => handleSelectPolicy("Términos y Condiciones")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                      selectedPolicy === "Términos y Condiciones"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Términos y Condiciones
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeSection === "categorias" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Add Specialty Button */}
              <div className="p-6 border-b border-gray-200">
                <button
                  onClick={handleAddSpecialty}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Especialidad
                </button>
              </div>

              {/* Table Header */}
              <div className="border-b border-gray-200">
                <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50">
                  <div className="text-sm font-medium text-gray-900 text-left">
                    Especialidad
                  </div>
                  <div className="text-sm font-medium text-gray-900 text-left">
                    Subcategorías
                  </div>
                  <div className="text-sm font-medium text-gray-900 text-center">
                    Servicios
                  </div>
                  <div className="text-sm font-medium text-gray-900 text-center">
                    Profesionales
                  </div>
                  <div className="text-sm font-medium text-gray-900 text-center">
                    Acciones
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {categoriesData.map((category) => (
                  <div
                    key={category.id}
                    className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm text-gray-900 font-medium">
                      {category.specialty}
                    </div>
                    <div className="text-sm text-gray-600">
                      {category.subcategories}
                    </div>
                    <div className="text-sm text-gray-900 text-center">
                      {category.services}
                    </div>
                    <div className="text-sm text-gray-900 text-center">
                      {category.professionals}
                    </div>
                    <div className="text-center">
                      <button
                        onClick={() =>
                          handleModifySpecialty(category.specialty)
                        }
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Edit className="w-4 h-4" />
                        Modificar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "paginas" && selectedPolicy && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Editor Toolbar */}
              <div className="border-b border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                      />
                    </svg>
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <select className="px-3 py-1 text-sm border border-gray-300 rounded bg-white">
                    <option>Normal text</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                    <option>Heading 3</option>
                  </select>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 6h12M6 12h12M6 18h12"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPolicy}
                  </h2>
                  <button
                    onClick={handleSavePolicy}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Confirmar Cambios
                  </button>
                </div>

                {/* Text Editor */}
                <textarea
                  value={
                    policyContent[selectedPolicy as keyof typeof policyContent]
                  }
                  onChange={(e) =>
                    setPolicyContent((prev) => ({
                      ...prev,
                      [selectedPolicy]: e.target.value,
                    }))
                  }
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Escribe el contenido de la política aquí..."
                />
              </div>
            </div>
          )}

          {activeSection === "paginas" && !selectedPolicy && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Páginas de Información
              </h2>
              <p className="text-gray-600">
                Selecciona una política del menú de la izquierda para editarla.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Specialty Modal */}
      {isSpecialtyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Ajustes De Especialidad: {selectedSpecialty}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex">
              {/* Services Table */}
              <div className="flex-1 p-6">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50">
                      <div className="text-sm font-medium text-gray-900 text-left">
                        Servicio
                      </div>
                      <div className="text-sm font-medium text-gray-900 text-center">
                        Profesionales
                      </div>
                      <div className="text-sm font-medium text-gray-900 text-center">
                        Acciones
                      </div>
                    </div>
                  </div>

                  {/* Table Body with Scroll */}
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
                    {servicesData[
                      selectedSpecialty as keyof typeof servicesData
                    ]?.map((service) => (
                      <div
                        key={service.id}
                        className="grid grid-cols-3 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-sm text-gray-900 font-medium">
                          {service.name}
                        </div>
                        <div className="text-sm text-gray-900 text-center">
                          {service.professionals}
                        </div>
                        <div className="text-center">
                          <button
                            onClick={() => handleModifyService(service.name)}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
                          >
                            <Edit className="w-4 h-4" />
                            Modificar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Panel */}
              <div className="w-80 bg-white border-l border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Acciones
                </h3>
                <button
                  onClick={handleAddService}
                  className="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center"
                >
                  <Plus className="w-5 h-5" />
                  Agregar servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Agregar nuevo servicio
              </h2>
              <button
                onClick={handleCloseAddServiceModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del servicio
                </label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Dietas para..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseAddServiceModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAddService}
                  disabled={!newServiceName.trim()}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    newServiceName.trim()
                      ? "text-white bg-primary hover:bg-primary/90"
                      : "text-gray-400 bg-gray-200 cursor-not-allowed"
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professionals Selection Modal */}
      {isProfessionalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCloseProfessionalsModal}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Volver
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  Ajustes De Especialidad: {selectedSpecialty} - Profesionales
                </h2>
              </div>
              <button
                onClick={handleCloseProfessionalsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex">
              {/* Professionals Table */}
              <div className="flex-1 p-6">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="border-b border-gray-200">
                    <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50">
                      <div className="text-sm font-medium text-gray-900 text-left flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        Nombre Profesional
                        <ChevronDown className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-medium text-gray-900 text-left">
                        Teléfono
                      </div>
                      <div className="text-sm font-medium text-gray-900 text-left">
                        Número de Profesional
                      </div>
                      <div className="text-sm font-medium text-gray-900 text-left">
                        Especialidad
                      </div>
                      <div className="text-sm font-medium text-gray-900 text-center">
                        Acción
                      </div>
                    </div>
                  </div>

                  {/* Table Body with Scroll */}
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
                    {nutritionProfessionals.map((professional) => (
                      <div
                        key={professional.id}
                        className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedProfessionals.includes(
                              professional.id
                            )}
                            onChange={() =>
                              handleSelectProfessional(professional.id)
                            }
                            className="rounded"
                          />
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-medium">
                              {professional.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-900 font-medium">
                              {professional.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {professional.email}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-900">
                          {professional.phone}
                        </div>
                        <div className="text-sm text-gray-900">
                          {professional.professionalNumber}
                        </div>
                        <div className="text-sm text-gray-900">
                          {professional.specialty}
                        </div>
                        <div className="text-center flex items-center justify-center gap-2">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Showing 1-10 from 100
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 text-sm bg-primary text-white rounded">
                        1
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                        2
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                        3
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                        4
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                        5
                      </button>
                      <span className="px-2 text-gray-400">...</span>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Professionals Panel */}
              <div className="w-80 bg-white border-l border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profesionales Seleccionados:
                </h3>
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  {selectedProfessionals.length}
                </div>
                <button
                  onClick={handleConfirmProfessionals}
                  className="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Confirmar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Confirmar Cambios
              </h2>
              <button
                onClick={handleCancelConfirm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                ¿Estás seguro que deseas asignar {selectedProfessionals.length}{" "}
                profesionales al servicio "{selectedService}"?
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancelConfirm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmChanges}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Specialty Modal */}
      {isAddSpecialtyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Agregar nueva especialidad
              </h2>
              <button
                onClick={handleCloseAddSpecialtyModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la especialidad
                </label>
                <input
                  type="text"
                  value={newSpecialtyName}
                  onChange={(e) => setNewSpecialtyName(e.target.value)}
                  placeholder="Ej: Terapia Ocupacional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategorías (opcional)
                </label>
                <textarea
                  value={newSpecialtySubcategories}
                  onChange={(e) => setNewSpecialtySubcategories(e.target.value)}
                  placeholder="Ej: Terapia de mano, rehabilitación neurológica, terapia pediátrica..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseAddSpecialtyModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAddSpecialty}
                  disabled={!newSpecialtyName.trim()}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    newSpecialtyName.trim()
                      ? "text-white bg-primary hover:bg-primary/90"
                      : "text-gray-400 bg-gray-200 cursor-not-allowed"
                  }`}
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
