import api from "./api.js";

export const checkoutOrder = async () => {
  const response = await api.post("/orders/checkout");

  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders");

  return response.data;
};

export const getMyOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);

  return response.data;
};
