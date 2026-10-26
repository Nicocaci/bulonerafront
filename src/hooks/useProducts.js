import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/productService.js";

// Listado del panel admin. Mientras carga otra página se sigue mostrando la anterior.
// (`keepPreviousData: true` era la opción de React Query v4: en la v5 se ignoraba.)
export const useProducts = ({ page, limit, search }) => {
  return useQuery({
    queryKey: ["admin-products", page, limit, search],
    queryFn: () =>
      getProducts({
        page,
        limit,
        q: search,
      }),
    placeholderData: keepPreviousData,
  });
};