import { notFound } from "next/navigation";
import { professionalsService } from "@/services";
import { lazyLoad } from "@/lib/lazy-loading";
import { Suspense } from "react";

// Reutiliza el componente pesado que ya existe para la vista pública
const ProfessionalPageClient = lazyLoad(
  () =>
    import(
      "@/app/(web)/[category]/[service]/[professional]/ProfessionalPageClient"
    )
);

interface ProfessionalPublicPageProps {
  params: Promise<{
    professional: string;
  }>;
}

export async function generateMetadata({ params }: ProfessionalPublicPageProps) {
  const { professional: professionalId } = await params;

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
    console.error("Error generating metadata (public professional):", error);
  }

  return {
    title: "Profesional no encontrado",
  };
}

export default async function ProfessionalPublicPage({
  params,
}: ProfessionalPublicPageProps) {
  const { professional: professionalId } = await params;

  console.log(
    `[ProfessionalPublicPage] Loading professional with ID: ${professionalId}`
  );

  const isValidId = /^\d+$/.test(professionalId);

  if (!isValidId || professionalId.length < 1 || professionalId.length > 10) {
    console.error(
      `[ProfessionalPublicPage] Invalid professional ID format: ${professionalId}. Expected numeric ID.`
    );
    notFound();
  }

  const response = await professionalsService.getPublicProfessionalById(
    professionalId
  );

  console.log(`[ProfessionalPublicPage] Response:`, {
    success: response.success,
    hasData: !!response.data,
    error: response.error,
  });

  if (!response.success || !response.data) {
    console.error(
      `[ProfessionalPublicPage] Failed to load professional:`,
      response.error
    );
    notFound();
  }

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


