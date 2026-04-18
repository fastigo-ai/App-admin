import api from './api';

export const getAllPayments = async (params?: { status?: string, userId?: string, page?: number, limit?: number }) => {
  const response = await api.get('/payment/all', { params });
  return response.data;
};

export const getOrderStatus = async (orderId: string) => {
  const response = await api.get(`/payment/order/${orderId}`);
  return response.data;
};
