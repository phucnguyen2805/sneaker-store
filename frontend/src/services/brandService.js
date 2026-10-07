import api from "./api.js";

export const getBrands = async () => {
  const response = await api.get("/brands");
  return Array.isArray(response.data) ? response.data : [];
};

export const createBrand = async (name) => {
  const response = await api.post("/admin/brands", { name });
  return response.data;
};

export const updateBrand = async (id, name) => {
  const response = await api.put(`/admin/brands/${id}`, { name });
  return response.data;
};

export const deleteBrand = async (id) => {
  await api.delete(`/admin/brands/${id}`);
};

export const uploadBrandLogo = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/admin/brands/${id}/logo`, formData);
  return response.data;
};

export const deleteBrandLogo = async (id) => {
  const response = await api.delete(`/admin/brands/${id}/logo`);
  return response.data;
};
