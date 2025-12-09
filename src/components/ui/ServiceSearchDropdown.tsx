"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { usePublicSpecialties } from "@/hooks/usePublicSpecialties";
import type { PublicService } from "@/services/api/specialties";

interface ServiceSearchDropdownProps {
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  showButton?: boolean;
  onSelect?: (value: string) => void;
}

type SearchOption = {
  label: string;
  slug: string; // sin slash inicial
  kind: "Especialidad" | "Servicio";
  parentLabel?: string;
};

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ServiceSearchDropdown({
  placeholder = "Categoría o servicio",
  className = "",
  buttonClassName = "",
  showButton = true,
  onSelect,
}: ServiceSearchDropdownProps) {
  const router = useRouter();
  const { specialties, loading, loadServicesForSpecialty } = usePublicSpecialties();

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [servicesBySpecialty, setServicesBySpecialty] = useState<
    Record<string, PublicService[]>
  >({});
  const loadedSpecialtiesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    specialties.forEach((specialty) => {
      const specialtyId = specialty.specialtyId;
      if (!specialtyId || loadedSpecialtiesRef.current.has(specialtyId)) return;

      loadedSpecialtiesRef.current.add(specialtyId);
      loadServicesForSpecialty(specialtyId)
        .then((services) => {
          if (services) {
            setServicesBySpecialty((prev) => ({
              ...prev,
              [specialtyId]: services,
            }));
          }
        })
        .catch((err) => {
          console.warn(
            "[ServiceSearchDropdown] Error cargando servicios de",
            specialtyId,
            err
          );
        });
    });
  }, [loadServicesForSpecialty, specialties]);

  const options = useMemo<SearchOption[]>(() => {
    const list: SearchOption[] = [];

    specialties.forEach((specialty) => {
      const slug = specialty.href?.replace(/^\//, "") ?? "";

      if (specialty.title) {
        list.push({
          label: specialty.title,
          slug,
          kind: "Especialidad",
        });
      }

      specialty.items?.forEach((item) => {
        const itemSlug = item.href.replace(/^\//, "");
        list.push({
          label: item.label,
          slug: itemSlug,
          kind: "Servicio",
          parentLabel: specialty.title,
        });
      });

      const services = servicesBySpecialty[specialty.specialtyId] || [];
      services.forEach((service) => {
        const serviceLabel =
          service.nombre_servicio || service.nombre || service.name || "Servicio";
        const serviceSlug =
          service.slug || generateSlug(serviceLabel) || generateSlug(serviceLabel);
        const baseSlug = specialty.href?.replace(/^\//, "") ?? "";
        const fullSlug = baseSlug ? `${baseSlug}/${serviceSlug}` : serviceSlug;

        list.push({
          label: serviceLabel,
          slug: fullSlug,
          kind: "Servicio",
          parentLabel: specialty.title,
        });
      });
    });

    return list;
    // Depende de servicesBySpecialty para incluir nuevos servicios cargados
  }, [servicesBySpecialty, specialties]);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;

    const q = normalizeText(query);
    return options
      .filter((option) => {
        const labelMatch = normalizeText(option.label).includes(q);
        const parentMatch = option.parentLabel
          ? normalizeText(option.parentLabel).includes(q)
          : false;
        return labelMatch || parentMatch;
      });
  }, [options, query]);

  const bestOption =
    highlightIndex !== null
      ? filteredOptions[highlightIndex]
      : filteredOptions[0];

  const navigateToSlug = (slug: string) => {
    const cleanSlug = slug.replace(/^\/+/, "");
    if (!cleanSlug) return;

    if (onSelect) {
      onSelect(cleanSlug);
    } else {
      router.push(`/${cleanSlug}`);
    }
  };

  const handleSelect = (option: SearchOption) => {
    setQuery(option.label);
    setIsFocused(false);
    setHighlightIndex(null);
    navigateToSlug(option.slug);
  };

  const handleSubmit = () => {
    if (!bestOption) return;
    handleSelect(bestOption);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredOptions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev === null ? 0 : Math.min(prev + 1, filteredOptions.length - 1);
        return next;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev === null ? filteredOptions.length - 1 : Math.max(prev - 1, 0);
        return next;
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    } else if (event.key === "Escape") {
      setIsFocused(false);
      setHighlightIndex(null);
    }
  };

  const openSuggestions = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsFocused(true);
  };

  const closeSuggestions = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      setHighlightIndex(null);
    }, 120);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row gap-3 w-full items-stretch sm:items-end ${className}`}
    >
      <div className="relative flex-1 min-w-[260px]">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M21.71 20.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 5.9-2.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z" />
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightIndex(null);
            }}
            onFocus={openSuggestions}
            onBlur={closeSuggestions}
            onKeyDown={handleKeyDown}
            placeholder={loading ? "Cargando..." : placeholder}
            aria-label="Buscar servicios o especialidades"
            disabled={loading}
            className={`w-full h-12 bg-white/95 backdrop-blur text-gray-800 pl-10 pr-4 rounded-md border border-white/60 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary/70 focus:bg-white focus:shadow-lg hover:border-white text-base ${
              className.includes("rounded-xl") ? "rounded-xl" : ""
            } ${className.includes("text-lg") ? "text-lg" : ""}`}
          />
        </div>

        {isFocused && (
          <div className="absolute z-20 mt-2 w-full bg-white shadow-lg rounded-md border border-gray-100 max-h-72 overflow-auto">
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500">Cargando...</div>
            )}

            {!loading && filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">
                No encontramos resultados
              </div>
            )}

            {!loading &&
              filteredOptions.map((option, index) => (
                <button
                  key={`${option.slug}-${index}`}
                  type="button"
                  className={`w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors ${
                    index === highlightIndex
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-50"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // evita blur antes de seleccionar
                    handleSelect(option);
                  }}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                      {option.kind}
                    </span>
                    {option.parentLabel && `• ${option.parentLabel}`}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {showButton && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!bestOption || loading}
          className={`w-full sm:w-auto shrink-0 whitespace-nowrap min-w-[120px] font-semibold px-4 rounded-md transition-colors duration-200 text-sm md:text-base flex items-center justify-center gap-2 sm:h-12 ${
            bestOption && !loading
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
