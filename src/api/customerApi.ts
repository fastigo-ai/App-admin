import api from './api';

export const getAllCustomers = async (params?: { page?: number; limit?: number; search?: string; city?: string }) => {
  const response = await api.get('/user/admin/allCustomers', { params });
  return response.data;
};
