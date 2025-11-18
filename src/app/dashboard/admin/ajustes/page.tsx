"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Plus,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
} from "lucide-react";

type SpecialtyCategory = {
  id: string;
  specialty: string;
  subcategories: string;
  services: number;
  professionals: number;
  description?: string;
};

type SpecialtyProfessional = {
  id: string;
  name: string;
  email: string;
  phone: string;
  professionalNumber: string;
  specialty: string;
};

type SpecialtyServiceItem = {
  id: string;
  name: string;
  professionals: number;
  professionalsList: SpecialtyProfessional[];
  description?: string;
};

type PolicyKey =
  | "Politica de Privacidad"
  | "Politica de Cookies"
  | "Politica de Cancelacion"
  | "Términos y Condiciones";

export default function AdminAjustesPage() {
  const [activeSection, setActiveSection] = useState("categorias");
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [creatingService, setCreatingService] = useState(false);
  const [createServiceError, setCreateServiceError] = useState<string | null>(
    null
  );
  const [isProfessionalsModalOpen, setIsProfessionalsModalOpen] =
    useState(false);
  const [selectedService, setSelectedService] =
    useState<SpecialtyServiceItem | null>(null);
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>(
    []
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [isAddSpecialtyModalOpen, setIsAddSpecialtyModalOpen] = useState(false);
  const [newSpecialtyName, setNewSpecialtyName] = useState("");
  const [newSpecialtySubcategories, setNewSpecialtySubcategories] =
    useState("");
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [policiesError, setPoliciesError] = useState<string | null>(null);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [savePolicyError, setSavePolicyError] = useState<string | null>(null);
  const [policyContent, setPolicyContent] = useState<Record<PolicyKey, string>>(
    {
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
    }
  );
  const [categoriesData, setCategoriesData] = useState<SpecialtyCategory[]>([]);
  const [servicesData, setServicesData] = useState<
    Record<string, SpecialtyServiceItem[]>
  >({});
  const [specialtyProfessionals, setSpecialtyProfessionals] = useState<
    Record<string, SpecialtyProfessional[]>
  >({});
  const [currentProfessionals, setCurrentProfessionals] = useState<
    SpecialtyProfessional[]
  >([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [specialtiesError, setSpecialtiesError] = useState<string | null>(null);
  const [creatingSpecialty, setCreatingSpecialty] = useState(false);
  const [createSpecialtyError, setCreateSpecialtyError] = useState<
    string | null
  >(null);
  const [servicesBySpecialty, setServicesBySpecialty] = useState<
    Record<string, string[]>
  >({});
  const [loadingServices, setLoadingServices] = useState<
    Record<string, boolean>
  >({});
  const [isDeleteSpecialtyModalOpen, setIsDeleteSpecialtyModalOpen] =
    useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] =
    useState<SpecialtyCategory | null>(null);
  const [deletingSpecialty, setDeletingSpecialty] = useState(false);
  const [deleteSpecialtyError, setDeleteSpecialtyError] = useState<
    string | null
  >(null);

  const apiBaseUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    return base.replace(/\/$/, "");
  }, []);

  const getAdminToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const storedUser = window.localStorage.getItem("user");
      if (!storedUser) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[AdminAjustesPage] No hay usuario almacenado");
        }
        return null;
      }

      const parsedUser = JSON.parse(storedUser);
      const role = String(parsedUser?.role || "").toLowerCase();
      if (role === "admin" || role === "administracion") {
        return parsedUser?.token || null;
      }

      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[AdminAjustesPage] El usuario no posee rol de administrador:",
          role
        );
      }
    } catch (tokenError) {
      console.error(
        "[AdminAjustesPage] Error al leer el token de administrador:",
        tokenError
      );
    }

    return null;
  }, []);

  const servicesForSelectedSpecialty = useMemo(() => {
    if (!selectedSpecialty) return [] as SpecialtyServiceItem[];
    return servicesData[selectedSpecialty] || [];
  }, [servicesData, selectedSpecialty]);

  const professionalsFallback = useMemo(() => {
    if (!selectedSpecialty) return [] as SpecialtyProfessional[];
    return specialtyProfessionals[selectedSpecialty] || [];
  }, [selectedSpecialty, specialtyProfessionals]);

  const extractSpecialtiesArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.especialidades))
      return data.data.especialidades;
    if (Array.isArray(data?.especialidades)) return data.especialidades;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.result)) return data.result;
    return [];
  };

  const mapBackendProfessional = (
    specialtyName: string,
    backendProfessional: any,
    index: number
  ): SpecialtyProfessional => {
    const professionalId =
      backendProfessional?.id_profesional ??
      backendProfessional?.id_usuario ??
      backendProfessional?.id ??
      backendProfessional?.uuid ??
      `${specialtyName}-professional-${index}`;

    const name =
      backendProfessional?.nombre_completo ??
      backendProfessional?.nombre ??
      backendProfessional?.name ??
      "Profesional sin nombre";

    const email =
      backendProfessional?.email ??
      backendProfessional?.email_usuario ??
      backendProfessional?.correo ??
      backendProfessional?.mail ??
      "";

    const phone =
      backendProfessional?.telefono ??
      backendProfessional?.phone ??
      backendProfessional?.telefono_contacto ??
      "";

    const professionalNumber =
      backendProfessional?.numero_colegiado ??
      backendProfessional?.professionalNumber ??
      backendProfessional?.numero_profesional ??
      backendProfessional?.id_colegiado ??
      "";

    const specialty =
      backendProfessional?.especialidad ??
      backendProfessional?.specialty ??
      specialtyName;

    return {
      id: String(professionalId),
      name,
      email,
      phone,
      professionalNumber: String(professionalNumber || ""),
      specialty,
    };
  };

  const mapBackendSpecialty = (backendSpecialty: any, index: number) => {
    const specialtyId =
      backendSpecialty?.id_especialidad ??
      backendSpecialty?.id ??
      backendSpecialty?.uuid ??
      `specialty-${index}`;

    const specialtyName =
      backendSpecialty?.nombre ??
      backendSpecialty?.name ??
      "Especialidad sin nombre";

    const description =
      backendSpecialty?.descripcion ?? backendSpecialty?.description ?? "";

    const subcategoriesSource =
      backendSpecialty?.subcategorias ??
      backendSpecialty?.sub_especialidades ??
      backendSpecialty?.subspecialties ??
      backendSpecialty?.sub_especialidades ??
      backendSpecialty?.detalle ??
      null;

    let subcategoriesText = "";

    if (Array.isArray(subcategoriesSource)) {
      subcategoriesText = subcategoriesSource
        .filter(Boolean)
        .map((sub: any) =>
          typeof sub === "string"
            ? sub
            : sub?.nombre ?? sub?.name ?? JSON.stringify(sub)
        )
        .join(", ");
    } else if (typeof subcategoriesSource === "string") {
      subcategoriesText = subcategoriesSource;
    } else if (description) {
      subcategoriesText = description;
    } else {
      subcategoriesText = "Sin subcategorías especificadas";
    }

    const servicesSource = Array.isArray(backendSpecialty?.servicios)
      ? backendSpecialty.servicios
      : Array.isArray(backendSpecialty?.services)
      ? backendSpecialty.services
      : [];

    const generalProfessionalsSource = Array.isArray(
      backendSpecialty?.profesionales
    )
      ? backendSpecialty.profesionales
      : Array.isArray(backendSpecialty?.professionals)
      ? backendSpecialty.professionals
      : [];

    const mappedGeneralProfessionals = generalProfessionalsSource.map(
      (professional: any, professionalIndex: number) =>
        mapBackendProfessional(specialtyName, professional, professionalIndex)
    );

    const mappedServices: SpecialtyServiceItem[] = servicesSource.map(
      (service: any, serviceIndex: number) => {
        const serviceId =
          service?.id_servicio ??
          service?.id ??
          service?.uuid ??
          `${specialtyId}-service-${serviceIndex}`;

        const serviceName =
          service?.nombre ?? service?.name ?? `Servicio ${serviceIndex + 1}`;

        const serviceProfessionalsSource = Array.isArray(service?.profesionales)
          ? service.profesionales
          : Array.isArray(service?.professionals)
          ? service.professionals
          : [];

        const mappedServiceProfessionals = serviceProfessionalsSource.map(
          (professional: any, professionalIndex: number) =>
            mapBackendProfessional(
              specialtyName,
              professional,
              professionalIndex
            )
        );

        const professionalsCount =
          service?.total_profesionales ??
          service?.professionals_count ??
          service?.numero_profesionales ??
          mappedServiceProfessionals.length;

        return {
          id: String(serviceId),
          name: serviceName,
          professionals: professionalsCount ?? 0,
          professionalsList: mappedServiceProfessionals,
          description: service?.descripcion ?? service?.description ?? "",
        };
      }
    );

    const servicesCount =
      backendSpecialty?.total_servicios ??
      backendSpecialty?.services_count ??
      mappedServices.length;

    const professionalsCount =
      backendSpecialty?.total_profesionales ??
      backendSpecialty?.professionals_count ??
      (mappedServices.length > 0
        ? mappedServices.reduce((total, service) => {
            const professionalsValue =
              typeof service.professionals === "number"
                ? service.professionals
                : service.professionalsList.length;
            return total + professionalsValue;
          }, 0)
        : mappedGeneralProfessionals.length);

    const category: SpecialtyCategory = {
      id: String(specialtyId),
      specialty: specialtyName,
      subcategories: subcategoriesText,
      services: typeof servicesCount === "number" ? servicesCount : 0,
      professionals:
        typeof professionalsCount === "number" ? professionalsCount : 0,
      description,
    };

    return {
      category,
      services: mappedServices,
      generalProfessionals: mappedGeneralProfessionals,
    };
  };

  const fetchSpecialties = useCallback(async () => {
    setLoadingSpecialties(true);
    setSpecialtiesError(null);

    try {
      const adminToken = getAdminToken();

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Token admin encontrado:",
          adminToken ? `${adminToken.substring(0, 12)}...` : "null"
        );
      }

      if (!adminToken) {
        setSpecialtiesError(
          "No se encontró un token de administrador. Por favor, inicia sesión nuevamente."
        );
        return;
      }

      const specialtiesEndpoint = `${apiBaseUrl}/especialidades`;

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Solicitando especialidades reales al backend:",
          specialtiesEndpoint
        );
      }

      const response = await fetch(specialtiesEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Respuesta de especialidades:",
          response.status,
          response.statusText
        );
      }

      if (!response.ok) {
        let errorMessage = `Error ${response.status} al cargar las especialidades.`;

        try {
          const cloned = response.clone();
          const errorData = await cloned.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;

          if (process.env.NODE_ENV === "development") {
            console.error(
              "[AdminAjustesPage] Error JSON especialidades:",
              errorData
            );
          }
        } catch (parseJsonError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
            if (process.env.NODE_ENV === "development") {
              console.error(
                "[AdminAjustesPage] Error texto especialidades:",
                errorText
              );
            }
          } catch (parseTextError) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                "[AdminAjustesPage] Error leyendo respuesta de especialidades:",
                parseTextError
              );
            }
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (process.env.NODE_ENV === "development") {
        console.log("[AdminAjustesPage] Datos de especialidades:", data);
      }

      const specialtiesArray = extractSpecialtiesArray(data);

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Especialidades mapeadas:",
          specialtiesArray.length
        );
      }

      const categories: SpecialtyCategory[] = [];
      const servicesRecord: Record<string, SpecialtyServiceItem[]> = {};
      const professionalsRecord: Record<string, SpecialtyProfessional[]> = {};

      specialtiesArray.forEach((item: any, index: number) => {
        const mapped = mapBackendSpecialty(item, index);
        categories.push(mapped.category);
        servicesRecord[mapped.category.specialty] = mapped.services;
        professionalsRecord[mapped.category.specialty] =
          mapped.generalProfessionals;
      });

      setCategoriesData(categories);
      setServicesData(servicesRecord);
      setSpecialtyProfessionals(professionalsRecord);

      // Obtener servicios para cada especialidad
      await fetchServicesForSpecialties(categories, adminToken);
    } catch (error: any) {
      console.error(
        "[AdminAjustesPage] Error al obtener especialidades:",
        error
      );
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[AdminAjustesPage] Detalles del error de especialidades:",
          error?.stack || error
        );
      }
      setSpecialtiesError(
        error?.message ||
          "Ocurrió un error al cargar las especialidades. Por favor, intenta de nuevo."
      );
    } finally {
      setLoadingSpecialties(false);
    }
  }, [apiBaseUrl, getAdminToken]);

  // Cargar páginas de información (políticas)
  const fetchPolicies = useCallback(async () => {
    setLoadingPolicies(true);
    setPoliciesError(null);
    try {
      const endpoint = `${apiBaseUrl}/paginas-informacion`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(
          txt || `Error ${response.status} al obtener páginas de información`
        );
      }
      const data = await response.json();
      const item = data?.data || {
        politicas_de_privacidad: "",
        politicas_de_cookies: "",
        politicas_de_cancelacion: "",
        Terminos_y_condiciones: "",
      };
      setPolicyContent({
        "Politica de Privacidad": String(item.politicas_de_privacidad || ""),
        "Politica de Cookies": String(item.politicas_de_cookies || ""),
        "Politica de Cancelacion": String(item.politicas_de_cancelacion || ""),
        "Términos y Condiciones": String(item.Terminos_y_condiciones || ""),
      });
    } catch (e: any) {
      console.error("[AdminAjustesPage] Error cargando políticas:", e);
      setPoliciesError(
        e?.message || "Ocurrió un error al cargar las páginas de información."
      );
    } finally {
      setLoadingPolicies(false);
    }
  }, [apiBaseUrl]);

  // Función para obtener servicios de cada especialidad
  const fetchServicesForSpecialties = useCallback(
    async (specialties: SpecialtyCategory[], token: string | null) => {
      if (!token) return;

      const servicesMap: Record<string, string[]> = {};
      const loadingMap: Record<string, boolean> = {};

      // Inicializar estados de carga
      specialties.forEach((specialty) => {
        loadingMap[specialty.id] = true;
      });
      setLoadingServices(loadingMap);

      // Obtener servicios para cada especialidad en paralelo
      const servicePromises = specialties.map(async (specialty) => {
        try {
          const servicesEndpoint = `${apiBaseUrl}/servicios/especialidad/${specialty.id}`;

          if (process.env.NODE_ENV === "development") {
            console.log(
              `[AdminAjustesPage] Obteniendo servicios para especialidad ${specialty.specialty} (ID: ${specialty.id})`
            );
          }

          const response = await fetch(servicesEndpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();

            if (process.env.NODE_ENV === "development") {
              console.log(
                `[AdminAjustesPage] Respuesta completa de servicios para especialidad ${specialty.id}:`,
                JSON.stringify(data, null, 2)
              );
            }

            // Extraer array de servicios de la respuesta - probar diferentes estructuras
            let servicesArray: any[] = [];

            // Caso 1: Array directo
            if (Array.isArray(data)) {
              servicesArray = data;
            }
            // Caso 2: { data: [...] }
            else if (Array.isArray(data?.data)) {
              servicesArray = data.data;
            }
            // Caso 3: { data: { servicios: [...] } }
            else if (Array.isArray(data?.data?.servicios)) {
              servicesArray = data.data.servicios;
            }
            // Caso 4: { servicios: [...] }
            else if (Array.isArray(data?.servicios)) {
              servicesArray = data.servicios;
            }
            // Caso 5: { success: true, data: [...] }
            else if (data?.success && Array.isArray(data?.data)) {
              servicesArray = data.data;
            }
            // Caso 6: { success: true, data: { servicios: [...] } }
            else if (data?.success && Array.isArray(data?.data?.servicios)) {
              servicesArray = data.data.servicios;
            }
            // Caso 7: { success: true, data: { data: [...] } }
            else if (data?.success && Array.isArray(data?.data?.data)) {
              servicesArray = data.data.data;
            }

            if (process.env.NODE_ENV === "development") {
              console.log(
                `[AdminAjustesPage] Array de servicios extraído para especialidad ${specialty.id}:`,
                servicesArray
              );
            }

            // Extraer nombres de servicios - probar diferentes campos
            const serviceNames = servicesArray
              .map((service: any) => {
                // Intentar diferentes campos posibles
                return (
                  service?.nombre ||
                  service?.name ||
                  service?.nombre_servicio ||
                  service?.service_name ||
                  service?.titulo ||
                  service?.title ||
                  ""
                );
              })
              .filter((name: string) => name.trim() !== "");

            servicesMap[specialty.id] = serviceNames;

            if (process.env.NODE_ENV === "development") {
              console.log(
                `[AdminAjustesPage] Nombres de servicios extraídos para ${specialty.specialty}:`,
                serviceNames
              );
              console.log(
                `[AdminAjustesPage] Total de servicios encontrados: ${serviceNames.length}`
              );
            }
          } else {
            const errorText = await response.text().catch(() => "");
            console.warn(
              `[AdminAjustesPage] Error al obtener servicios para especialidad ${specialty.id}:`,
              response.status,
              response.statusText,
              errorText
            );
            servicesMap[specialty.id] = [];
          }
        } catch (error) {
          console.error(
            `[AdminAjustesPage] Error al obtener servicios para especialidad ${specialty.id}:`,
            error
          );
          servicesMap[specialty.id] = [];
        } finally {
          loadingMap[specialty.id] = false;
        }
      });

      await Promise.all(servicePromises);

      setServicesBySpecialty(servicesMap);
      setLoadingServices({});
    },
    [apiBaseUrl]
  );

  useEffect(() => {
    fetchSpecialties();
    fetchPolicies();
  }, [fetchSpecialties, fetchPolicies]);

  const handleModifySpecialty = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setIsSpecialtyModalOpen(true);
  };

  const handleDeleteSpecialty = (category: SpecialtyCategory) => {
    setSpecialtyToDelete(category);
    setDeleteSpecialtyError(null);
    setIsDeleteSpecialtyModalOpen(true);
  };

  const handleCloseDeleteSpecialtyModal = () => {
    setIsDeleteSpecialtyModalOpen(false);
    setSpecialtyToDelete(null);
    setDeleteSpecialtyError(null);
    setDeletingSpecialty(false);
  };

  const handleConfirmDeleteSpecialty = async () => {
    if (!specialtyToDelete) return;

    setDeletingSpecialty(true);
    setDeleteSpecialtyError(null);

    try {
      const adminToken = getAdminToken();

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Eliminando especialidad:",
          specialtyToDelete.specialty,
          "ID:",
          specialtyToDelete.id
        );
      }

      if (!adminToken) {
        setDeleteSpecialtyError(
          "No se encontró un token de administrador. Por favor, inicia sesión nuevamente."
        );
        setDeletingSpecialty(false);
        return;
      }

      const deleteEndpoint = `${apiBaseUrl}/especialidades/${specialtyToDelete.id}`;

      if (process.env.NODE_ENV === "development") {
        console.log("[AdminAjustesPage] Enviando DELETE a:", deleteEndpoint);
      }

      const response = await fetch(deleteEndpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      let responseData: any = null;
      try {
        responseData = await response.clone().json();
      } catch (parseError) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[AdminAjustesPage] No se pudo parsear la respuesta de eliminación:",
            parseError
          );
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Respuesta eliminación especialidad:",
          response.status,
          response.statusText,
          responseData
        );
      }

      if (!response.ok || responseData?.success === false) {
        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `Error ${response.status} al eliminar la especialidad.`;
        throw new Error(errorMessage);
      }

      // Refrescar la lista de especialidades
      await fetchSpecialties();

      handleCloseDeleteSpecialtyModal();
    } catch (error: any) {
      console.error(
        "[AdminAjustesPage] Error al eliminar especialidad:",
        error
      );
      setDeleteSpecialtyError(
        error?.message ||
          "Ocurrió un error al eliminar la especialidad. Por favor, intenta nuevamente."
      );
    } finally {
      setDeletingSpecialty(false);
    }
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
    setCreateServiceError(null);
    setCreatingService(false);
  };

  const handleConfirmAddService = async () => {
    const trimmedName = newServiceName.trim();
    if (!trimmedName || !selectedSpecialty) return;

    // Obtener el ID de la especialidad seleccionada
    const selectedCategory = categoriesData.find(
      (cat) => cat.specialty === selectedSpecialty
    );

    if (!selectedCategory) {
      setCreateServiceError(
        "No se pudo encontrar la especialidad seleccionada."
      );
      return;
    }

    setCreatingService(true);
    setCreateServiceError(null);

    try {
      const adminToken = getAdminToken();

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Preparando creación de servicio:",
          trimmedName,
          "para especialidad ID:",
          selectedCategory.id
        );
      }

      if (!adminToken) {
        setCreateServiceError(
          "No se encontró un token de administrador. Por favor, inicia sesión nuevamente."
        );
        setCreatingService(false);
        return;
      }

      const payload = {
        nombre_servicio: trimmedName,
        id_especialidad: selectedCategory.id,
      };

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Enviando payload de servicio:",
          payload
        );
      }

      const response = await fetch(`${apiBaseUrl}/servicios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      let responseData: any = null;
      try {
        responseData = await response.clone().json();
      } catch (parseError) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[AdminAjustesPage] No se pudo parsear la respuesta de creación de servicio:",
            parseError
          );
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Respuesta creación servicio:",
          response.status,
          response.statusText,
          responseData
        );
      }

      if (!response.ok || responseData?.success === false) {
        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `Error ${response.status} al crear el servicio.`;
        throw new Error(errorMessage);
      }

      // Refrescar las especialidades (esto también refrescará los servicios)
      await fetchSpecialties();

      handleCloseAddServiceModal();
    } catch (error: any) {
      console.error("[AdminAjustesPage] Error al crear servicio:", error);
      setCreateServiceError(
        error?.message ||
          "Ocurrió un error al crear el servicio. Por favor, intenta nuevamente."
      );
    } finally {
      setCreatingService(false);
    }
  };

  const handleModifyService = (
    specialtyName: string,
    service: SpecialtyServiceItem
  ) => {
    setSelectedService(service);
    const professionalsList =
      service.professionalsList.length > 0
        ? service.professionalsList
        : specialtyProfessionals[specialtyName] || [];
    setCurrentProfessionals(professionalsList);
    setSelectedProfessionals(professionalsList.map((prof) => prof.id));
    setIsProfessionalsModalOpen(true);
  };

  const handleCloseProfessionalsModal = () => {
    setIsProfessionalsModalOpen(false);
    setSelectedService(null);
    setSelectedProfessionals([]);
    setCurrentProfessionals([]);
  };

  const handleSelectProfessional = (professionalId: string) => {
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
      selectedService?.name || selectedService?.id,
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

  const handleSavePolicy = async () => {
    if (!selectedPolicy) return;
    setSavingPolicy(true);
    setSavePolicyError(null);
    try {
      const adminToken = getAdminToken();
      if (!adminToken) {
        throw new Error(
          "No se encontró un token de administrador. Inicia sesión nuevamente."
        );
      }
      // Mapear clave seleccionada al campo del backend
      const selectedValue =
        policyContent[selectedPolicy as keyof typeof policyContent] || "";
      const payload: any = {};
      if (selectedPolicy === "Politica de Privacidad") {
        payload.politicas_de_privacidad = selectedValue;
      } else if (selectedPolicy === "Politica de Cookies") {
        payload.politicas_de_cookies = selectedValue;
      } else if (selectedPolicy === "Politica de Cancelacion") {
        payload.politicas_de_cancelacion = selectedValue;
      } else if (selectedPolicy === "Términos y Condiciones") {
        payload.Terminos_y_condiciones = selectedValue;
      }
      const response = await fetch(`${apiBaseUrl}/paginas-informacion`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Error ${response.status} al guardar la política.`
        );
      }
      // Refrescar desde el backend para mantener consistencia
      await fetchPolicies();
      alert(`Política "${selectedPolicy}" guardada exitosamente`);
    } catch (e: any) {
      console.error("[AdminAjustesPage] Error guardando política:", e);
      setSavePolicyError(
        e?.message || "Ocurrió un error al guardar la política."
      );
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleAddSpecialty = () => {
    setCreateSpecialtyError(null);
    setCreatingSpecialty(false);
    setIsAddSpecialtyModalOpen(true);
  };

  const handleCloseAddSpecialtyModal = () => {
    setIsAddSpecialtyModalOpen(false);
    setNewSpecialtyName("");
    setNewSpecialtySubcategories("");
    setCreateSpecialtyError(null);
    setCreatingSpecialty(false);
  };

  const handleConfirmAddSpecialty = async () => {
    const trimmedName = newSpecialtyName.trim();
    if (!trimmedName) return;

    const trimmedDescription = newSpecialtySubcategories.trim();

    setCreatingSpecialty(true);
    setCreateSpecialtyError(null);

    try {
      const adminToken = getAdminToken();

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Preparando creación de especialidad:",
          trimmedName
        );
      }

      if (!adminToken) {
        setCreateSpecialtyError(
          "No se encontró un token de administrador. Por favor, inicia sesión nuevamente."
        );
        return;
      }

      const payload = {
        nombre: trimmedName,
        descripcion: trimmedDescription || "",
      };

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Enviando payload de especialidad:",
          payload
        );
      }

      const response = await fetch(`${apiBaseUrl}/especialidades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      let responseData: any = null;
      try {
        responseData = await response.clone().json();
      } catch (parseError) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[AdminAjustesPage] No se pudo parsear la respuesta de creación:",
            parseError
          );
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[AdminAjustesPage] Respuesta creación especialidad:",
          response.status,
          response.statusText,
          responseData
        );
      }

      if (!response.ok || responseData?.success === false) {
        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `Error ${response.status} al crear la especialidad.`;
        throw new Error(errorMessage);
      }

      await fetchSpecialties();

      handleCloseAddSpecialtyModal();
    } catch (error: any) {
      console.error("[AdminAjustesPage] Error al crear especialidad:", error);
      setCreateSpecialtyError(
        error?.message ||
          "Ocurrió un error al crear la especialidad. Por favor, intenta nuevamente."
      );
    } finally {
      setCreatingSpecialty(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 -mx-6 px-6 mb-6">
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
        <div className="flex-1">
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

              {/* Loading State */}
              {loadingSpecialties && (
                <div className="p-12 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-700">
                    Cargando especialidades...
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Por favor espera mientras obtenemos los datos del servidor
                  </p>
                </div>
              )}

              {/* Error State */}
              {!loadingSpecialties && specialtiesError && (
                <div className="p-6">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 mb-1">
                          Error al cargar especialidades
                        </h3>
                        <p className="text-sm text-red-700">
                          {specialtiesError}
                        </p>
                        <button
                          onClick={() => fetchSpecialties()}
                          className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                        >
                          Intentar nuevamente
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Content - Only show when not loading and no error */}
              {!loadingSpecialties && !specialtiesError && (
                <>
                  {/* Table Header */}
                  <div className="border-b border-gray-200">
                    <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-50">
                      <div className="text-sm font-medium text-gray-900 text-left">
                        Especialidad
                      </div>
                      <div className="text-sm font-medium text-gray-900 text-left">
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
                    {categoriesData.length > 0 ? (
                      categoriesData.map((category) => {
                        const services = servicesBySpecialty[category.id] || [];
                        const isLoadingServices = loadingServices[category.id];
                        const servicesText =
                          isLoadingServices && services.length === 0
                            ? "Cargando servicios..."
                            : services.length > 0
                            ? services.join(", ")
                            : category.subcategories || "Sin servicios";

                        return (
                          <div
                            key={category.id}
                            className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-sm text-gray-900 font-medium">
                              {category.specialty}
                            </div>
                            <div className="text-sm text-gray-600">
                              {servicesText}
                            </div>
                            <div className="text-sm text-gray-900 text-center">
                              {category.professionals}
                            </div>
                            <div className="text-center flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleModifySpecialty(category.specialty)
                                }
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Modificar
                              </button>
                              <button
                                onClick={() => handleDeleteSpecialty(category)}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                                title="Eliminar especialidad"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <p className="text-sm text-gray-500">
                          No hay especialidades registradas. Haz clic en
                          "Agregar Especialidad" para crear una nueva.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
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
                    disabled={savingPolicy}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      savingPolicy
                        ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                        : "text-white bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {savingPolicy ? "Guardando..." : "Confirmar Cambios"}
                  </button>
                </div>

                {policiesError && (
                  <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {policiesError}
                  </div>
                )}
                {savePolicyError && (
                  <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {savePolicyError}
                  </div>
                )}

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
                  disabled={loadingPolicies}
                />
                {loadingPolicies && (
                  <p className="mt-2 text-xs text-gray-500">
                    Cargando contenido desde el servidor...
                  </p>
                )}
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
                    {(() => {
                      // Obtener el ID de la especialidad seleccionada
                      const selectedCategory = categoriesData.find(
                        (cat) => cat.specialty === selectedSpecialty
                      );
                      const specialtyServices = selectedCategory
                        ? servicesBySpecialty[selectedCategory.id] || []
                        : [];

                      if (specialtyServices.length > 0) {
                        return specialtyServices.map((serviceName, index) => (
                          <div
                            key={`${selectedCategory?.id}-service-${index}`}
                            className="grid grid-cols-3 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-sm text-gray-900 font-medium">
                              {serviceName}
                            </div>
                            <div className="text-sm text-gray-900 text-center">
                              -
                            </div>
                            <div className="text-center">
                              <button
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
                                disabled
                                title="Funcionalidad próximamente"
                              >
                                <Edit className="w-4 h-4" />
                                Modificar
                              </button>
                            </div>
                          </div>
                        ));
                      } else if (loadingServices[selectedCategory?.id || ""]) {
                        return (
                          <div className="px-6 py-6 text-center text-sm text-gray-500">
                            Cargando servicios...
                          </div>
                        );
                      } else {
                        return (
                          <div className="px-6 py-6 text-center text-sm text-gray-500">
                            No hay servicios registrados para esta especialidad.
                          </div>
                        );
                      }
                    })()}
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
              {createServiceError && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {createServiceError}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del servicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ej: Dietas para..."
                  disabled={creatingService}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  El servicio se asociará a la especialidad:{" "}
                  <span className="font-medium">{selectedSpecialty}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseAddServiceModal}
                  disabled={creatingService}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAddService}
                  disabled={creatingService || !newServiceName.trim()}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    creatingService || !newServiceName.trim()
                      ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                      : "text-white bg-primary hover:bg-primary/90"
                  }`}
                >
                  {creatingService ? "Agregando..." : "Agregar"}
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
                    {currentProfessionals.length > 0 ? (
                      currentProfessionals.map((professional) => (
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
                      ))
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <p className="text-sm text-gray-500">
                          No hay profesionales disponibles para esta
                          especialidad.
                        </p>
                      </div>
                    )}
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
                profesionales al servicio "
                {selectedService?.name ||
                  selectedService?.id ||
                  "este servicio"}
                "?
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
              {createSpecialtyError && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {createSpecialtyError}
                </div>
              )}
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
                  disabled={creatingSpecialty || !newSpecialtyName.trim()}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    creatingSpecialty || !newSpecialtyName.trim()
                      ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                      : "text-white bg-primary hover:bg-primary/90"
                  }`}
                >
                  {creatingSpecialty ? "Agregando..." : "Agregar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Specialty Modal */}
      {isDeleteSpecialtyModalOpen && specialtyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Eliminar Especialidad
              </h2>
              <button
                onClick={handleCloseDeleteSpecialtyModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={deletingSpecialty}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {deleteSpecialtyError && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {deleteSpecialtyError}
                </div>
              )}
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  ¿Estás seguro que deseas eliminar la especialidad{" "}
                  <span className="font-semibold text-gray-900">
                    "{specialtyToDelete.specialty}"
                  </span>
                  ?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Advertencia:</strong> Esta acción no se puede
                    deshacer. La especialidad y todos sus datos relacionados
                    serán eliminados permanentemente.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseDeleteSpecialtyModal}
                  disabled={deletingSpecialty}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDeleteSpecialty}
                  disabled={deletingSpecialty}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    deletingSpecialty
                      ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                      : "text-white bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deletingSpecialty ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
