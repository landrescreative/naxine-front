import Image from "next/image";
import Link from "next/link";

interface Professional {
  id: string;
  name: string;
  title: string;
  description: string;
  rating: number;
  reviewCount: number;
  price: number;
  image: string;
  isPopular?: boolean;
  specialties: string[];
  slug: string; // ← Agregar slug para la URL
}

interface ProfessionalCardProps {
  professional: Professional;
  categorySlug: string; // ← Necesitamos la categoría para la URL
  serviceSlug?: string; // ← Servicio opcional para la URL
  modalidad?: string; // ← Modalidad seleccionada
}

export default function ProfessionalCard({
  professional,
  categorySlug,
  serviceSlug,
  modalidad,
}: ProfessionalCardProps) {
  // Generar URL basada en si hay servicio o no, incluyendo modalidad como query param
  const baseHref = serviceSlug
    ? `/${categorySlug}/${serviceSlug}/${professional.slug}`
    : `/${categorySlug}/${professional.slug}`;
  
  // Agregar modalidad como query parameter si está disponible
  const href = modalidad
    ? `${baseHref}?modalidad=${encodeURIComponent(modalidad)}`
    : baseHref;

  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 overflow-hidden group relative hover:shadow-lg transition-shadow duration-300"
    >
      {/* Popular Badge */}
      {professional.isPopular && (
        <div className="absolute top-0 left-0 z-10">
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-br-lg">
            Mas popular
          </span>
        </div>
      )}

      {/* Professional Image */}
      <div className="relative h-96 overflow-hidden">
        <Image
          src={professional.image}
          alt={professional.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-3">
        {/* Name */}
        <h3 className="text-xl font-bold text-primary group-hover:text-purple-700 transition-colors">
          {professional.name}
        </h3>

        {/* Title/Description */}
        <p className="text-gray-700 text-sm leading-relaxed">
          {professional.description}
        </p>

        {/* Price */}
        <div className="pt-2">
          {professional.price > 0 ? (
            <span className="text-xl font-bold text-primary">
              Desde {Number(professional.price).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export type { Professional };
