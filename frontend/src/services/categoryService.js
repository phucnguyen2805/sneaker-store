import api from "./api.js";

export const getCategories = async () => {
  const response = await api.get("/categories");
  return Array.isArray(response.data) ? response.data : [];
};

export const createCategory = async (name) => {
  const response = await api.post("/admin/categories", { name });
  return response.data;
};

export const updateCategory = async (id, name) => {
  const response = await api.put(`/admin/categories/${id}`, { name });
  return response.data;
};

export const deleteCategory = async (id) => {
  await api.delete(`/admin/categories/${id}`);
};

export const uploadCategoryImage = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/admin/categories/${id}/image`, formData);
  return response.data;
};

export const deleteCategoryImage = async (id) => {
  const response = await api.delete(`/admin/categories/${id}/image`);
  return response.data;
};
