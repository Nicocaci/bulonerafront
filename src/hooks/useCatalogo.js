import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosConfig.js";

// Datos del catálogo con React Query: cada consulta se guarda en caché y se comparte
// entre pantallas (por ejemplo, las categorías del menú y las del filtro de Productos).
// Todas las claves empiezan con "catalogo": el panel admin invalida ese prefijo
// después de crear, editar o borrar un producto.

const MINUTO = 60 * 1000;

export const catalogoKeys = {
  todo: ["catalogo"],
  categorias: () => ["catalogo", "categorias"],
  subcategorias: (categoria) => ["catalogo", "subcategorias", categoria],
  productos: (filtros) => ["catalogo", "productos", filtros],
  producto: (id) => ["catalogo", "producto", id],
};

const comoLista = (data) => (Array.isArray(data) ? data : []);

// Opciones reutilizables (el menú del navbar las usa con queryClient.fetchQuery)
export const subcategoriasQuery = (categoria) => ({
  queryKey: catalogoKeys.subcategorias(categoria),
  queryFn: async () => {
    const { data } = await axiosInstance.get(
      `/api/products/subcategorias/${encodeURIComponent(categoria)}`,
    );
    return comoLista(data);
  },
  staleTime: 10 * MINUTO,
});

export const useCategorias = () =>
  useQuery({
    queryKey: catalogoKeys.categorias(),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/products/categorias");
      return comoLista(data);
    },
    staleTime: 10 * MINUTO,
  });

export const useSubcategorias = (categoria) =>
  useQuery({
    ...subcategoriasQuery(categoria),
    enabled: Boolean(categoria),
  });

// Listado paginado. Mientras carga una página nueva se siguen mostrando los
// productos anteriores (placeholderData), así la grilla no "salta".
export const useProductos = (filtros) =>
  useQuery({
    queryKey: catalogoKeys.productos(filtros),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/products", {
        params: { ...filtros, vista: "resumen" }, // sin la descripción (no se usa en las tarjetas)
      });
      return {
        products: comoLista(data?.products),
        pagination: data?.pagination ?? { page: 1, totalPages: 1 },
      };
    },
    placeholderData: keepPreviousData,
    staleTime: MINUTO,
  });

// El backend puede mandar las imágenes como `imagen` (string o array) o `imagenes`:
// se normalizan siempre a `imagenes` (array).
const normalizarImagenes = (producto) => {
  let imagenes = [];
  if (Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
    imagenes = producto.imagenes;
  } else if (Array.isArray(producto.imagen)) {
    imagenes = producto.imagen;
  } else if (producto.imagen) {
    imagenes = [producto.imagen];
  }
  return { ...producto, imagenes };
};

export const useProducto = (id) =>
  useQuery({
    queryKey: catalogoKeys.producto(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/products/${id}`);
      return normalizarImagenes(data);
    },
    enabled: Boolean(id),
    staleTime: MINUTO,
    // Un 404 o un ID inválido no se reintentan
    retry: (intentos, error) => {
      const status = error?.response?.status;
      if (status === 404 || status === 400) return false;
      return intentos < 1;
    },
  });
