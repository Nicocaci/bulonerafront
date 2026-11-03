import axiosInstance from "../utils/axiosConfig.js";

// Listado del panel admin: incluye los productos inactivos (la tienda usa /api/products).
export const getProductsAdmin = async ({ page, limit, q, estado }) => {
  const { data } = await axiosInstance.get("/api/products/admin", {
    params: { page, limit, search: q, estado },
  });
  return data;
};
