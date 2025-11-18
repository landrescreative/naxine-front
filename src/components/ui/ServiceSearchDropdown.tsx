"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicSpecialties } from "@/hooks/usePublicSpecialties";

interface ServiceSearchDropdownProps {
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  showButton?: boolean;
  onSelect?: (value: string) => void;
}

export default function ServiceSearchDropdown({
  placeholder = "Categoría",
  className = "",
  buttonClassName = "",
  showButton = true,
  onSelect,
}: ServiceSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const router = useRouter();
  const { specialties, loading } = usePublicSpecialties();

  // Función auxiliar para generar slugs
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSearch = () => {
    if (selectedOption) {
      if (onSelect) {
        onSelect(selectedOption);
      } else {
        router.push(`/${selectedOption}`);
      }
    }
  };

  // Generar opciones de categorías
  const categoryOptions = specialties.map((specialty) => {
    const specialtySlug =
      specialty.href?.replace(/^\//, "") || generateSlug(specialty.title);
    return {
      value: specialtySlug,
      label: specialty.title,
      specialtyId: specialty.specialtyId,
    };
  });

  return (
    <div
      className={`flex flex-col sm:flex-row gap-3 w-full items-stretch sm:items-end ${className}`}
    >
      {/* Dropdown */}
      <div className="relative flex-1 min-w-[260px]">
        <select
          className={`appearance-none w-full h-12 bg-white/95 backdrop-blur text-gray-800 px-4 pr-12 rounded-md border border-white/60 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary/70 focus:bg-white focus:shadow-lg hover:border-white text-base ${
            className.includes("rounded-xl") ? "rounded-xl" : ""
          } ${className.includes("text-lg") ? "text-lg" : ""}`}
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          aria-label="Buscar categorías"
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          disabled={loading}
        >
          <option value="" disabled>
            {loading ? "Cargando..." : placeholder}
          </option>

          {/* Categorías */}
          {categoryOptions.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        {/* Icono de dropdown */}
        <div
          className={`pointer-events-none absolute inset-y-0 right-3 flex items-center text-primary/80 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M12 14.5a1 1 0 0 1-.707-.293l-5-5a1 1 0 1 1 1.414-1.414L12 12.086l4.293-4.293a1 1 0 0 1 1.414 1.414l-5 5A1 1 0 0 1 12 14.5z" />
          </svg>
        </div>
      </div>

      {/* Botón de búsqueda */}
      {showButton && (
        <button
          type="button"
          onClick={handleSearch}
          disabled={!selectedOption || loading}
          className={`w-full sm:w-auto shrink-0 whitespace-nowrap min-w-[120px] font-semibold px-4 rounded-md transition-colors duration-200 text-sm md:text-base flex items-center justify-center gap-2 sm:h-12 ${
            selectedOption && !loading
              ? "bg-white text-primary hover:bg-gray-100 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } ${buttonClassName}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M21.71 20.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 5.9-2.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z" />
          </svg>
          Buscar
        </button>
      )}
    </div>
  );
}
