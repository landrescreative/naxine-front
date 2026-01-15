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
    professional: string; // ahora puede ser "123" o un slug basado en el nombre
  }>;
  searchParams: Promise<{
    modalidad?: string;
  }>;
}

export async function generateMetadata({ params }: ProfessionalPageProps) {
  const { professional } = await params;

  try {
    const response = await professionalsService.getPublicProfessionalById(
      professional
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
  searchParams,
}: ProfessionalPageProps) {
  const { professional } = await params;
  const { modalidad } = await searchParams;

  console.log(
    `[ProfessionalPage] Loading professional with identifier: ${professional}`
  );

  // Cargar el perfil del profesional desde el API
  const response = await professionalsService.getPublicProfessionalById(
    professional
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
      <ProfessionalPageClient professional={response.data} modalidadInicial={modalidad} />
    </Suspense>
  );
}
