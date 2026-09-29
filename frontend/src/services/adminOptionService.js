import api from "./api.js";

export const createSize = async (name) => {
  const response = await api.post("/admin/sizes", {
    name,
  });

  return response.data;
};

export const createColor = async (name, hexCode) => {
  const response = await api.post("/admin/colors", {
    name,
    hexCode,
  });

  return response.data;
};
