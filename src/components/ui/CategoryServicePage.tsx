"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import PurpleSection from "@/components/ui/PurpleSection";
import ProfessionalCard from "@/components/ui/ProfessionalCard";
import { categoriesData, ServiceData } from "@/data/categories";

interface CategoryServicePageProps {
  categorySlug: string;
  serviceSlug?: string;
}

export default function CategoryServicePage({
  categorySlug,
  serviceSlug,
}: CategoryServicePageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const professionalsPerPage = 15; // 5 filas x 3 columnas = 15 profesionales

  const categoryData = categoriesData[categorySlug];

  if (!categoryData) {
    notFound();
  }

  // Si hay serviceSlug, buscar el servicio específico
  let serviceData: ServiceData | null = null;
  if (serviceSlug) {
    serviceData =
      categoryData.services.find((service) => service.id === serviceSlug) ||
      null;
    if (!serviceData) {
      notFound();
    }
  }

  // Usar datos del servicio si existe, sino usar datos de la categoría
  const pageData = serviceData || {
    title: categoryData.title,
    subtitle: categoryData.subtitle,
    searchPlaceholder: categoryData.searchPlaceholder,
    backgroundImage: categoryData.backgroundImage,
  };

  // Lógica de paginación
  const totalProfessionals = categoryData.professionals.length;
  const totalPages = Math.ceil(totalProfessionals / professionalsPerPage);
  const startIndex = (currentPage - 1) * professionalsPerPage;
  const endIndex = startIndex + professionalsPerPage;
  const currentProfessionals = categoryData.professionals.slice(
    startIndex,
    endIndex
  );

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Purple Section */}
      <PurpleSection
        title={pageData.title}
        subtitle={pageData.subtitle}
        searchPlaceholder={pageData.searchPlaceholder}
        backgroundImage={pageData.backgroundImage}
      />

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-lg font-semibold text-purple-600">
              Profesionales Disponibles
            </h2>
          </div>

          <div className="flex justify-center gap-6">
            <div className="relative">
              <select className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]">
                <option value="" disabled selected>
                  Modalidad
                </option>
                <option>Todas</option>
                <option>Presencial</option>
                <option>Online</option>
                <option>Híbrida</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]">
                <option value="" disabled selected>
                  Ubicación
                </option>
                <option>Todas</option>
                <option>Online</option>
                <option>A Coruña</option>
                <option>Álava</option>
                <option>Albacete</option>
                <option>Alcalá de Henares</option>
                <option>Alcobendas</option>
                <option>Alcorcón</option>
                <option>Algeciras</option>
                <option>Almería</option>
                <option>Alzira</option>
                <option>Antequera</option>
                <option>Arrecife</option>
                <option>Ávila</option>
                <option>Badajoz</option>
                <option>Badalona</option>
                <option>Baeza</option>
                <option>Barcelona</option>
                <option>Barakaldo</option>
                <option>Bilbao</option>
                <option>Burgos</option>
                <option>Cáceres</option>
                <option>Cádiz</option>
                <option>Cartagena</option>
                <option>Castellón de la Plana</option>
                <option>Ceuta</option>
                <option>Ciudad Real</option>
                <option>Córdoba</option>
                <option>Cuenca</option>
                <option>Donostia-San Sebastián</option>
                <option>Dos Hermanas</option>
                <option>Elche</option>
                <option>Ferrol</option>
                <option>Fuenlabrada</option>
                <option>Gandía</option>
                <option>Getafe</option>
                <option>Gijón</option>
                <option>Girona</option>
                <option>Granada</option>
                <option>Guadalajara</option>
                <option>Huelva</option>
                <option>Huesca</option>
                <option>Ibiza</option>
                <option>Jaén</option>
                <option>Jerez de la Frontera</option>
                <option>Las Palmas de Gran Canaria</option>
                <option>Leganés</option>
                <option>León</option>
                <option>Lérida</option>
                <option>Linares</option>
                <option>Logroño</option>
                <option>Lorca</option>
                <option>Lugo</option>
                <option>Madrid</option>
                <option>Málaga</option>
                <option>Marbella</option>
                <option>Mataró</option>
                <option>Melilla</option>
                <option>Mérida</option>
                <option>Mijas</option>
                <option>Móstoles</option>
                <option>Murcia</option>
                <option>Ourense</option>
                <option>Oviedo</option>
                <option>Palencia</option>
                <option>Palma de Mallorca</option>
                <option>Pamplona</option>
                <option>Parla</option>
                <option>Pontevedra</option>
                <option>Pozuelo de Alarcón</option>
                <option>Reus</option>
                <option>Sabadell</option>
                <option>Salamanca</option>
                <option>San Cristóbal de La Laguna</option>
                <option>San Fernando</option>
                <option>San Sebastián de los Reyes</option>
                <option>Santa Coloma de Gramenet</option>
                <option>Santa Cruz de Tenerife</option>
                <option>Santander</option>
                <option>Santiago de Compostela</option>
                <option>Segovia</option>
                <option>Sevilla</option>
                <option>Soria</option>
                <option>Tarragona</option>
                <option>Telde</option>
                <option>Teruel</option>
                <option>Toledo</option>
                <option>Torrelavega</option>
                <option>Torrevieja</option>
                <option>Valencia</option>
                <option>Valladolid</option>
                <option>Vélez-Málaga</option>
                <option>Vigo</option>
                <option>Vitoria-Gasteiz</option>
                <option>Zamora</option>
                <option>Zaragoza</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]">
                <option value="" disabled selected>
                  Horario
                </option>
                <option>Todos</option>
                <option>Mañana</option>
                <option>Tarde</option>
                <option>Noche</option>
                <option>Fines de semana</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professionals Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentProfessionals.map((professional) => {
            // Si no hay serviceSlug (página de categoría), usar el primer servicio como fallback
            const effectiveServiceSlug =
              serviceSlug || categoryData.services[0]?.id;

            return (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                categorySlug={categorySlug}
                serviceSlug={effectiveServiceSlug}
              />
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav
              className="flex items-center space-x-2"
              aria-label="Paginación"
            >
              {/* Botón Anterior */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {/* Números de página */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Mostrar solo algunas páginas alrededor de la actual
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Mostrar puntos suspensivos si hay gap
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-3 py-2 text-sm text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? "bg-purple-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Botón Siguiente */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}

        {/* Información de paginación */}
        {totalProfessionals > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(endIndex, totalProfessionals)} de {totalProfessionals}{" "}
            profesionales
          </div>
        )}
      </div>

      {/* Empty State */}
      {totalProfessionals === 0 && (
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay profesionales disponibles
            </h3>
            <p className="text-gray-500">
              Pronto tendremos profesionales disponibles en esta categoría.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
