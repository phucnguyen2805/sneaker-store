import api from './api.js';

export const getCart = async () => {
  const response = await api.get('/cart');

  return response.data;
};

export const addCartItem = async (productVariantId, quantity) => {
  const response = await api.post('/cart/items', {
    productVariantId,
    quantity,
  });

  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/items/${itemId}`, {
    quantity,
  });

  return response.data;
};

export const deleteCartItem = async (itemId) => {
  const response = await api.delete(`/cart/items/${itemId}`);

  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart/items');

  return response.data;
};