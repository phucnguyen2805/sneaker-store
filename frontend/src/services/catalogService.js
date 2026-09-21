import api from './api.js';

export const getBrands = async () => {
  const response = await api.get('/brands');

  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');

  return response.data;
};

export const getSizes = async () => {
  const response = await api.get('/sizes');

  return response.data;
};