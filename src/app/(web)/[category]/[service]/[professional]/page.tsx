import { notFound } from "next/navigation";
import { professionalsService } from "@/services";
import { lazyLoad } from "@/lib/lazy-loading";
import { Suspense } from "react";

// Lazy load del componente pesado - ProfessionalPageClient tiene más de 2600 líneas
const ProfessionalPageClient = lazyLoad(() => import("./ProfessionalPageClient"));

interface ProfessionalPageProps {
  params: Promise<{
    category: string;
    service: string;
    professional: string;
  }>;
}

export async function generateMetadata({ params }: ProfessionalPageProps) {
  const { professional: professionalId } = await params;

  // Validar que el ID del profesional sea válido antes de intentar cargar
  // Los IDs de profesionales son números enteros (INT AUTO_INCREMENT en la BD)
  const isValidId = /^\d+$/.test(professionalId);
  
  if (!isValidId || professionalId.length < 1 || professionalId.length > 10) {
    return {
      title: "Profesional no encontrado",
    };
  }

  try {
    const response = await professionalsService.getPublicProfessionalById(
      professionalId
    );

    if (response.success && response.data) {
      const professionalName =
        response.data.fullName || response.data.name || "Profesional";
      const professionalBio =
        response.data.bio ||
        `Perfil profesional de ${professionalName} en NAXINE. Profesional verificado y colegiado.`;
      const specialty = response.data.specialty || "";

      return {
        title: `${professionalName}`,
        description: professionalBio,
        keywords: [
          professionalName,
          "profesional verificado",
          "profesional colegiado",
          specialty,
          "cita online",
          "servicios profesionales",
        ],
        openGraph: {
          title: `${professionalName} | NAXINE`,
          description: professionalBio,
          type: "profile",
        },
        twitter: {
          card: "summary_large_image",
          title: `${professionalName} | NAXINE`,
          description: professionalBio,
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Profesional no encontrado",
  };
}

export default async function ProfessionalPage({
  params,
}: ProfessionalPageProps) {
  const { professional: professionalId } = await params;

  console.log(
    `[ProfessionalPage] Loading professional with ID: ${professionalId}`
  );

  // Validar que el ID del profesional sea válido
  // Los IDs de profesionales son números enteros (INT AUTO_INCREMENT en la BD)
  // Rechazar cualquier cosa que no sea un número o que contenga caracteres inválidos
  const isValidId = /^\d+$/.test(professionalId);
  
  if (!isValidId || professionalId.length < 1 || professionalId.length > 10) {
    console.error(
      `[ProfessionalPage] Invalid professional ID format: ${professionalId}. Expected numeric ID.`
    );
    notFound();
  }

  // Cargar el perfil del profesional desde el API
  const response = await professionalsService.getPublicProfessionalById(
    professionalId
  );

  console.log(`[ProfessionalPage] Response:`, {
    success: response.success,
    hasData: !!response.data,
    error: response.error,
  });

  if (!response.success || !response.data) {
    console.error(
      `[ProfessionalPage] Failed to load professional:`,
      response.error
    );
    notFound();
  }

  console.log(
    `[ProfessionalPage] Professional data:`,
    JSON.stringify(response.data, null, 2)
  );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil del profesional...</p>
          </div>
        </div>
      }
    >
      <ProfessionalPageClient professional={response.data} />
    </Suspense>
  );
}
