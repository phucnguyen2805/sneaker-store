import api from './api.js';

export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);

  return response.data;
};

export const getProductVariants = async (productId) => {
  const response = await api.get(`/products/${productId}/variants`);

  return response.data;
};

export const getProductImages = async (productId) => {
  const response = await api.get(`/products/${productId}/images`);

  return response.data;
};