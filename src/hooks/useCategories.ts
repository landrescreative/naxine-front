import { useState, useEffect, useCallback } from "react";
import { categoriesService } from "@/services";
import { CategoryData } from "@/data/categories";

interface UseCategoriesOptions {
  page?: number;
  limit?: number;
  search?: string;
  autoLoad?: boolean;
}

export const useCategories = (options: UseCategoriesOptions = {}) => {
  const { page = 1, limit = 10, search, autoLoad = true } = options;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(
    null
  );

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit };

      const response = await categoriesService.getCategories(params);

      if (response.success && response.data) {
        const categoriesData = (response.data as any).data || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } else {
        setError(response.error || "Error al cargar categorías");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const searchCategories = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await categoriesService.searchCategories(query);

        if (response.success && response.data) {
          const categoriesData = (response.data as any).data || response.data;
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } else {
          setError(response.error || "Error en la búsqueda");
        }
      } catch (err) {
        setError("Error de conexión");
        console.error("Error searching categories:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  const getCategoryById = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoriesService.getCategoryById(categoryId);

      if (response.success && response.data) {
        setSelectedCategory(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.error || "Error al cargar categoría");
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = "Error de conexión";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getServicesByCategory = useCallback(async (categoryId: string) => {
    try {
      const response = await categoriesService.getServicesByCategory(
        categoryId
      );
      return response;
    } catch (err) {
      console.error("Error getting services:", err);
      return { success: false, error: "Error al obtener servicios" };
    }
  }, []);

  // Cargar datos automáticamente al montar el componente
  useEffect(() => {
    if (autoLoad) {
      loadCategories();
    }
  }, [loadCategories, autoLoad]);

  // Búsqueda automática cuando cambia el parámetro search
  useEffect(() => {
    if (search && search.trim()) {
      searchCategories(search);
    } else if (search === "") {
      loadCategories(); // Recargar todos si se limpia la búsqueda
    }
  }, [search, searchCategories, loadCategories]);

  return {
    categories,
    selectedCategory,
    loading,
    error,
    loadCategories,
    searchCategories,
    getCategoryById,
    getServicesByCategory,
    clearError: () => setError(null),
    clearSelectedCategory: () => setSelectedCategory(null),
  };
};
