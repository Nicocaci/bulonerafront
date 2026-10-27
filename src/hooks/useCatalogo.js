import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosConfig.js";

// Datos del catálogo con React Query: cada consulta se guarda en caché y se comparte
// entre pantallas (por ejemplo, las categorías del menú y las del filtro de Productos).
// Todas las claves empiezan con "catalogo": el panel admin invalida ese prefijo
// después de crear, editar o borrar un producto.

const MINUTO = 60 * 1000;

export const catalogoKeys = {
  todo: ["catalogo"],
  productos: (filtros) => ["catalogo", "productos", filtros],
  facetas: (filtros) => ["catalogo", "facetas", filtros],
  producto: (id) => ["catalogo", "producto", id],
};

const comoLista = (data) => (Array.isArray(data) ? data : []);

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

// Cantidades por categoría, subcategoría y marca para el filtro de Productos y el menú
// del navbar (GET /api/products/facetas). Cada grupo se calcula sin su propio filtro:
// con "Eléctricas" elegida, las otras categorías siguen apareciendo con su cantidad.
const VACIAS = { total: 0, categorias: [], subcategorias: [], marcas: [], enOferta: 0, conStock: 0 };

export const useFacetas = ({ category = "", subcategory = "", marca = "", search = "", soloOfertas = false } = {}) => {
  // Solo se mandan los filtros con valor: así la clave de caché es la misma para
  // el menú del navbar y para la página de productos sin filtros.
  const params = {};
  if (category) params.category = category;
  if (subcategory) params.subcategory = subcategory;
  if (marca) params.marca = marca;
  if (search) params.search = search;
  if (soloOfertas) params.soloOfertas = "true";

  return useQuery({
    queryKey: catalogoKeys.facetas(params),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/products/facetas", { params });
      return { ...VACIAS, ...data };
    },
    placeholderData: keepPreviousData,
    staleTime: MINUTO,
  });
};

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
