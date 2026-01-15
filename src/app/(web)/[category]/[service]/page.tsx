import { notFound } from "next/navigation";
import { Suspense } from "react";
import { specialtiesService } from "@/services/api/specialties";
import CategoryServicePage from "@/components/ui/CategoryServicePage";

interface ServicePageProps {
  params: Promise<{
    category: string;
    service: string;
  }>;
}

export async function generateStaticParams() {
  // Para páginas dinámicas, retornar array vacío para generar en runtime
  // O puedes generar algunos params estáticos si lo necesitas
  return [];
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { category, service: serviceSlug } = await params;

  try {
    console.log("[ServicePage][generateMetadata] params:", {
      category,
      serviceSlug,
    });
    // Obtener la especialidad por su slug
    const specialtyResponse = await specialtiesService.getSpecialtyBySlugOrId(
      category
    );
    console.log(
      "[ServicePage][generateMetadata] specialtyResponse.success:",
      specialtyResponse?.success
    );

    if (!specialtyResponse.success || !specialtyResponse.data) {
      console.warn(
        "[ServicePage][generateMetadata] specialty not found for category:",
        category
      );
      return {
        title: "Especialidad no encontrada",
        description: "La especialidad solicitada no existe en NAXINE",
      };
    }

    const specialty = specialtyResponse.data;
    const specialtyId = String(specialty.id_especialidad || specialty.id || "");
    console.log("[ServicePage][generateMetadata] specialtyId:", specialtyId);

    // Obtener el servicio específico
    const serviceResponse = await specialtiesService.getServiceBySlugOrId(
      specialtyId,
      serviceSlug
    );
    console.log(
      "[ServicePage][generateMetadata] serviceResponse.success:",
      serviceResponse?.success
    );

    if (!serviceResponse.success || !serviceResponse.data) {
      // Si no se encuentra el servicio, usar datos de la especialidad
      const specialtyName =
        specialty.nombre || specialty.name || "Especialidad";
      console.warn(
        "[ServicePage][generateMetadata] service not found. Using specialty metadata fallback for:",
        { specialtyId, serviceSlug }
      );
      return {
        title: `${specialtyName} | Naxine`,
        description: specialty.descripcion || `Servicios de ${specialtyName}`,
      };
    }

    const service = serviceResponse.data;
    const serviceName =
      service.nombre_servicio || service.nombre || service.name || "Servicio";
    const specialtyName = specialty.nombre || specialty.name || "Especialidad";
    const serviceDescription =
      service.descripcion || `Servicio de ${serviceName} en ${specialtyName}`;

    return {
      title: `${serviceName} - ${specialtyName}`,
      description: serviceDescription,
      keywords: [
        serviceName,
        specialtyName,
        "servicios profesionales",
        "profesionales verificados",
        "cita online",
      ],
      openGraph: {
        title: `${serviceName} - ${specialtyName} | NAXINE`,
        description: serviceDescription,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${serviceName} - ${specialtyName} | NAXINE`,
        description: serviceDescription,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Servicio",
      description: "Página de servicio en NAXINE",
    };
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { category, service: serviceSlug } = await params;

  try {
    console.log("[ServicePage] params:", { category, serviceSlug });
    // Obtener la especialidad por su slug
    const specialtyResponse = await specialtiesService.getSpecialtyBySlugOrId(
      category
    );
    console.log(
      "[ServicePage] specialtyResponse.success:",
      specialtyResponse?.success
    );

    if (!specialtyResponse.success || !specialtyResponse.data) {
      console.warn("[ServicePage] specialty not found for category:", category);
      notFound();
    }

    const specialty = specialtyResponse.data;
    const specialtyId = String(specialty.id_especialidad || specialty.id || "");
    console.log("[ServicePage] specialtyId:", specialtyId);

    // Obtener el servicio específico
    const serviceResponse = await specialtiesService.getServiceBySlugOrId(
      specialtyId,
      serviceSlug
    );
    console.log(
      "[ServicePage] serviceResponse.success:",
      serviceResponse?.success
    );

    if (!serviceResponse.success || !serviceResponse.data) {
      console.warn("[ServicePage] service not found for specialty/service:", {
        specialtyId,
        serviceSlug,
      });
      notFound();
    }

    // Pasar los datos dinámicos al componente
    console.log("[ServicePage] Rendering CategoryServicePage with IDs:", {
      categorySlug: category,
      serviceSlug,
      specialtyId,
    });
    return (
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>}>
        <CategoryServicePage
          categorySlug={category}
          serviceSlug={serviceSlug}
          specialtyData={specialty}
          serviceData={serviceResponse.data}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error loading service page:", error);
    notFound();
  }
}
