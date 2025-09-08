import { notFound } from "next/navigation";
import { categoriesData } from "@/data/categories";
import CategoryServicePage from "@/components/ui/CategoryServicePage";

interface ServicePageProps {
  params: {
    category: string;
    service: string;
  };
}

export async function generateStaticParams() {
  const params: { category: string; service: string }[] = [];

  Object.entries(categoriesData).forEach(([categorySlug, categoryData]) => {
    categoryData.services.forEach((service) => {
      params.push({
        category: categorySlug,
        service: service.id,
      });
    });
  });

  return params;
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { category, service: serviceId } = await params;
  const categoryData = categoriesData[category];

  if (!categoryData) {
    return {
      title: "Categoría no encontrada",
    };
  }

  const serviceData = categoryData.services.find(
    (service) => service.id === serviceId
  );

  if (!serviceData) {
    return {
      title: "Servicio no encontrado",
    };
  }

  return {
    title: `${serviceData.title} - ${categoryData.name} | Naxine`,
    description: serviceData.description,
    keywords: serviceData.keywords.join(", "),
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { category, service: serviceId } = await params;
  const categoryData = categoriesData[category];

  if (!categoryData) {
    notFound();
  }

  const serviceData = categoryData.services.find(
    (service) => service.id === serviceId
  );

  if (!serviceData) {
    notFound();
  }

  return (
    <CategoryServicePage categorySlug={category} serviceSlug={serviceId} />
  );
}
