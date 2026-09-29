import api from "./api.js";

export const getAdminUsers = async ({ search = "", page = 0, size = 10 }) => {
  const response = await api.get("/admin/users", {
    params: {
      search: search.trim() || undefined,
      page,
      size,
    },
  });

  return response.data;
};

export const updateAdminUserStatus = async (userId, enabled) => {
  const response = await api.patch(`/admin/users/${userId}/status`, {
    enabled,
  });

  return response.data;
};
