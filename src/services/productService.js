import axiosInstance from "../utils/axiosConfig.js";

export const getProducts = async ({ page, limit, q }) => {
  const { data } = await axiosInstance.get("/api/products", {
    params: { page, limit, search: q }, // ← q lo mandás como search
  });
  return data;
};
