import { notFound } from "next/navigation";
import { categoriesData } from "@/data/categories";
import Image from "next/image";
import Link from "next/link";

interface DetailsPageProps {
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

export async function generateMetadata({ params }: DetailsPageProps) {
  const { category, professional: professionalSlug } = await params;
  const categoryData = categoriesData[category];

  if (!categoryData) return { title: "Categoría no encontrada" };

  const professional = categoryData.professionals.find(
    (p) => p.slug === professionalSlug
  );
  if (!professional) return { title: "Profesional no encontrado" };

  return {
    title: `Detalles de ${professional.name} | ${categoryData.name}`,
    description: professional.description,
  };
}

export default async function DetailsPage({ params }: DetailsPageProps) {
  const { category, service, professional: professionalSlug } = await params;
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

  return (
    <div className="min-h-screen bg-white mb-20">
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-6">
          {/* Page Title */}
          <div className="text-center mb-8">
            <p className="text-primary text-sm mb-2 font-normal">
              Conoce a tu especialista
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-black">
              Perfil Profesional
            </h1>
          </div>

          {/* Professional Card */}
          <div className="bg-[#E3DCFF] rounded-3xl p-5 sm:p-6 md:p-8">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              {/* Left Side - Image and Basic Info */}
              <div className="space-y-6">
                {/* Professional Image */}
                <div className="relative flex justify-center">
                  <Image
                    src={professional.image}
                    alt={professional.name}
                    width={300}
                    height={225}
                    className="rounded-2xl object-cover w-full max-w-sm aspect-[4/3]"
                  />
                </div>

                {/* Professional Type and Location */}
                <div className="space-y-3 flex flex-col items-center">
                  <button className="bg-[#1a0082] text-white px-5 py-2.5 rounded-full font-bold text-sm sm:text-base">
                    {professional.title}
                  </button>
                  <button className="bg-[#F37E1F] text-white px-5 py-2.5 rounded-full font-medium text-sm sm:text-base flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>Madrid, España</span>
                  </button>
                </div>
              </div>

              {/* Right Side - About Section */}
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-4">
                    {professional.name.toUpperCase()}
                  </h2>

                  {/* Modality Buttons */}
                  <div className="flex space-x-3 mb-6">
                    <button className="bg-primary-foreground text-white px-4 py-2 rounded-full flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span>Presencial</span>
                    </button>
                    <button className="bg-primary-foreground text-white px-4 py-2 rounded-full flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-8-2c-1.38 0-2.5-1.12-2.5-2.5S10.62 11 12 11s2.5 1.12 2.5 2.5S13.38 16 12 16z" />
                      </svg>
                      <span>En línea</span>
                    </button>
                  </div>

                  {/* About Section */}
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-2">
                      Sobre mi
                    </h3>
                    <p className="text-secondary leading-relaxed text-sm">
                      ¡Hola! Soy {professional.name.split(" ")[0]},{" "}
                      {professional.title.toLowerCase()}. Mi pasión es
                      acompañarte en una de las etapas más extraordinarias de tu
                      vida, asegurando que recibas el acompañamiento óptimo que
                      necesitas para florecer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column */}
          <div className="lg:col-span-7">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Un plan personalizado, fácil de seguir y basado en resultados
              reales.
            </h1>
            <p className="text-gray-700 leading-relaxed mb-6">
              Pierde peso de forma saludable, sin pasar hambre y sin dietas
              extremas. Incluye guía nutricional, menús semanales, recetas y
              acompañamiento.
            </p>

            <div className="space-y-6 text-gray-800">
              <section>
                <h2 className="font-semibold text-lg mb-2">
                  ✅ ¿Qué incluye el plan?
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>📅 Menú semanal personalizado</li>
                  <li>
                    🧭 Adaptado a tu peso, estatura, edad, nivel de actividad y
                    metas.
                  </li>
                  <li>
                    🧩 Opciones variadas (omnivora, vegetariana, keto, etc.).
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-semibold text-lg mb-2">
                  📖 Guía nutricional práctica
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Aprende a comer mejor sin obsesionarte.</li>
                  <li>Explicaciones claras, sin tecnicismos.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-semibold text-lg mb-2">
                  👩‍🍳 Recetas fáciles y sabrosas
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Paso a paso, con ingredientes accesibles.</li>
                  <li>Opciones rápidas y económicas.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-semibold text-lg mb-2">
                  🧠 Tips psicológicos y de motivación
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Cómo evitar el rebote y construir hábitos sostenibles.
                  </li>
                  <li>Seguimiento opcional por WhatsApp o email.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-semibold text-lg mb-2">
                  🎯 ¿Para quién es este plan?
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personas que quieren perder peso sin sufrir.</li>
                  <li>Quienes ya intentaron dietas y buscan algo realista.</li>
                  <li>
                    Personas con poco tiempo que necesitan menús listos y
                    prácticos.
                  </li>
                </ul>
              </section>
            </div>
          </div>

          {/* Right column */}
          <aside className="lg:col-span-5">
            <div className="bg-white overflow-hidden">
              {/* Image Section */}
              <div className="relative h-64 sm:h-72">
                <Image
                  src={professional.image}
                  alt={professional.name}
                  fill
                  className="object-cover"
                />
                {/* Discount Badge */}
                <div className="absolute top-0 left-0">
                  <span className="bg-[#6D28D9] text-white text-sm font-bold px-3 py-1.5 rounded-lg font-heading">
                    -20%
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="mt-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-[#6D28D9] mb-2">
                  Plan alimenticio
                </h3>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400 text-2xl">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-gray-500 ml-2 text-sm">(56)</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-base mb-6 leading-relaxed">
                  Mejora tu calidad de vida con este plan alimenticio listo para
                  ti.
                </p>

                {/* CTA Button */}
                <Link
                  href={`/${category}/${service}/${professional.slug}`}
                  className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-lg py-4 rounded transition-colors duration-200 block text-center uppercase tracking-wide"
                >
                  COMPRAR
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
