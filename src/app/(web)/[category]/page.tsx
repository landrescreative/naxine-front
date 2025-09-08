import { notFound } from "next/navigation";
import { categoriesData } from "@/data/categories";
import CategoryServicePage from "@/components/ui/CategoryServicePage";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  return Object.keys(categoriesData).map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = categoriesData[category];

  if (!categoryData) {
    return {
      title: "Categoría no encontrada",
    };
  }

  return {
    title: `${categoryData.name} - Naxine`,
    description: categoryData.subtitle,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = categoriesData[category];

  if (!categoryData) {
    notFound();
  }

  return <CategoryServicePage categorySlug={category} />;
}
