import api from './api.js';

export const getProducts = async (params = {}) => {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined,
    ),
  );

  const hasFilters = Object.keys(cleanedParams).length > 0;

  const endpoint = hasFilters ? '/products/search' : '/products';

  const response = await api.get(endpoint, {
    params: cleanedParams,
  });

  return response.data;
};