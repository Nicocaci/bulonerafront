import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProductsAdmin } from "../services/productService.js";

// Listado del panel admin (activos e inactivos). Mientras carga otra página se sigue
// mostrando la anterior.
// (`keepPreviousData: true` era la opción de React Query v4: en la v5 se ignoraba.)
export const useProducts = ({ page, limit, search, estado }) => {
  return useQuery({
    queryKey: ["admin-products", page, limit, search, estado],
    queryFn: () =>
      getProductsAdmin({
        page,
        limit,
        q: search,
        estado,
      }),
    placeholderData: keepPreviousData,
  });
};
