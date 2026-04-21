import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/productService.js";

export const useProducts = ({ page, limit, search }) => {
  return useQuery({
    queryKey: ["products", page, search],
    queryFn: () =>
      getProducts({
        page,
        limit,
        q: search,
      }),
    keepPreviousData: true,
  });
};