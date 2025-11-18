import { notFound } from "next/navigation";
import { specialtiesService } from "@/services/api/specialties";
import CategoryServicePage from "@/components/ui/CategoryServicePage";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  // Para páginas dinámicas, retornar array vacío para generar en runtime
  // O puedes generar algunos params estáticos si lo necesitas
  return [];
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;

  try {
    // Obtener la especialidad por su slug
    const specialtyResponse = await specialtiesService.getSpecialtyBySlugOrId(
      category
    );

    if (!specialtyResponse.success || !specialtyResponse.data) {
      return {
        title: "Categoría no encontrada",
        description: "La categoría solicitada no existe en NAXINE",
      };
    }

    const specialty = specialtyResponse.data;
    const specialtyName = specialty.nombre || specialty.name || "Categoría";

    return {
      title: `${specialtyName} | NAXINE`,
      description:
        specialty.descripcion ||
        specialty.description ||
        `Explora servicios profesionales de ${specialtyName} en NAXINE. Encuentra profesionales verificados y colegiados.`,
      keywords: [
        specialtyName,
        "servicios profesionales",
        "profesionales verificados",
        specialty.descripcion || specialty.description || "",
      ],
      openGraph: {
        title: `${specialtyName} | NAXINE`,
        description:
          specialty.descripcion ||
          specialty.description ||
          `Explora servicios profesionales de ${specialtyName} en NAXINE.`,
        type: "website",
      },
    };
  } catch (error) {
    return {
      title: "Categoría no encontrada",
      description: "La categoría solicitada no existe en NAXINE",
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  try {
    // Obtener la especialidad por su slug
    const specialtyResponse = await specialtiesService.getSpecialtyBySlugOrId(
      category
    );

    if (!specialtyResponse.success || !specialtyResponse.data) {
      notFound();
    }

    const specialty = specialtyResponse.data;

    // Pasar los datos dinámicos al componente
    return (
      <CategoryServicePage
        categorySlug={category}
        specialtyData={specialty}
      />
    );
  } catch (error) {
    console.error("Error loading category page:", error);
    notFound();
  }
}
