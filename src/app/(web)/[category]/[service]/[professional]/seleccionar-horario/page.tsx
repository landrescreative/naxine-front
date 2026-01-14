import { notFound } from "next/navigation";
import { professionalsService } from "@/services";
import { lazyLoad } from "@/lib/lazy-loading";
import { Suspense } from "react";

// Lazy load del componente cliente
const SelectTimePageClient = lazyLoad(() => import("./SelectTimePageClient"));

interface SelectTimePageProps {
  params: Promise<{
    category: string;
    service: string;
    professional: string;
  }>;
  searchParams: Promise<{
    fecha?: string;
    precioId?: string;
    tipoAtencion?: string;
    horario?: string;
  }>;
}

export default async function SelectTimePage({
  params,
  searchParams,
}: SelectTimePageProps) {
  const { professional } = await params;
  const searchParamsResolved = await searchParams;

  // Cargar el perfil del profesional desde el API
  const response = await professionalsService.getPublicProfessionalById(
    professional
  );

  if (!response.success || !response.data) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <SelectTimePageClient
        professional={response.data}
        initialDate={searchParamsResolved.fecha}
        precioId={searchParamsResolved.precioId}
        tipoAtencion={searchParamsResolved.tipoAtencion}
        initialHorario={searchParamsResolved.horario}
      />
    </Suspense>
  );
}
