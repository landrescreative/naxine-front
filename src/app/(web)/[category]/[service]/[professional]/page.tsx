import { notFound } from "next/navigation";
import { categoriesData } from "@/data/categories";
import ProfessionalPageClient from "./ProfessionalPageClient";

interface ProfessionalPageProps {
  params: {
    category: string;
    service: string;
    professional: string;
  };
}

export async function generateStaticParams() {
  const params: { category: string; service: string; professional: string }[] =
    [];

  Object.entries(categoriesData).forEach(([categorySlug, categoryData]) => {
    categoryData.professionals.forEach((professional) => {
      // Generar rutas para cada servicio de la categoría
      categoryData.services.forEach((service) => {
        params.push({
          category: categorySlug,
          service: service.id,
          professional: professional.slug,
        });
      });
    });
  });

  return params;
}

export async function generateMetadata({ params }: ProfessionalPageProps) {
  const { category, professional: professionalSlug } = await params;
  const categoryData = categoriesData[category];

  if (!categoryData) {
    return {
      title: "Categoría no encontrada",
    };
  }

  const professional = categoryData.professionals.find(
    (p) => p.slug === professionalSlug
  );

  if (!professional) {
    return {
      title: "Profesional no encontrado",
    };
  }

  return {
    title: `${professional.name} - ${categoryData.name} | Naxine`,
    description: professional.description,
  };
}

export default async function ProfessionalPage({
  params,
}: ProfessionalPageProps) {
  const { category, professional: professionalSlug } = await params;
  const categoryData = categoriesData[category];

  if (!categoryData) {
    notFound();
  }

  const professional = categoryData.professionals.find(
    (p) => p.slug === professionalSlug
  );

  if (!professional) {
    notFound();
  }

  return <ProfessionalPageClient professional={professional} />;
}
