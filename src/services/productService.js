import axiosInstance from "../utils/axiosConfig.js";

export const getProducts = async ({ page, limit, q }) => {
  const { data } = await axiosInstance.get("/api/products", {
    params: { page, limit, q },
  });
  return data;
};

export const getProductBySku = async (sku) => {
  const { data } = await axiosInstance.get(`/api/products/sku/${sku}`);
  return data;
};

export const createProduct = async (formData) => {
  const { data } = await axiosInstance.post("/api/products", formData);
  return data;
};

export const updateProduct = async ({ id, data }) => {
  return axiosInstance.put(`/api/products/${id}`, data);
};

export const deleteProduct = async (id) => {
  return axiosInstance.delete(`/api/products/${id}`);
};