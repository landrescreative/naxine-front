// src/components/examples/CategoriesExample.tsx
"use client";

import { useState, useEffect } from "react";
import { categoriesService } from "@/services";
import { ApiCategory, ApiService } from "@/services/types/api";

export const CategoriesExample = () => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ApiCategory | null>(
    null
  );
  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoriesService.getCategories({
        page: 1,
        limit: 50,
      });

      if (response.success && response.data) {
        setCategories(response.data.data);
      } else {
        setError(response.error || "Error al cargar categorías");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryDetails = async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoriesService.getCategoryById(categoryId);

      if (response.success && response.data) {
        setSelectedCategory(response.data);
        setServices(response.data.services || []);
      } else {
        setError(response.error || "Error al cargar detalles de la categoría");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error loading category details:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchCategories = async () => {
    if (!searchQuery.trim()) {
      loadCategories();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await categoriesService.searchCategories(searchQuery);

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.error || "Error en la búsqueda");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error searching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCategories();
  };

  const clearSearch = () => {
    setSearchQuery("");
    loadCategories();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Categorías y Servicios</h1>

        {/* Búsqueda */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Buscar
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={loadCategories}
            className="ml-2 text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de categorías */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">
                {searchQuery
                  ? `Resultados para "${searchQuery}"`
                  : "Todas las Categorías"}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Cargando...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No se encontraron categorías
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => loadCategoryDetails(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {category.subtitle}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {category.title}
                        </p>
                      </div>
                      <div className="ml-4">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detalles de categoría seleccionada */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">
                {selectedCategory ? "Detalles" : "Selecciona una categoría"}
              </h2>
            </div>

            {selectedCategory ? (
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedCategory.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCategory.subtitle}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Servicios disponibles:
                  </h4>
                  {services.length > 0 ? (
                    <div className="space-y-2">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="p-3 bg-gray-50 rounded-md"
                        >
                          <h5 className="font-medium text-gray-900">
                            {service.name}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </p>
                          {service.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {service.keywords.slice(0, 3).map((keyword) => (
                                <span
                                  key={keyword}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {service.keywords.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{service.keywords.length - 3} más
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay servicios disponibles
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    Ver Profesionales
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Reservar Cita
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>
                  Haz clic en una categoría para ver sus detalles y servicios
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
