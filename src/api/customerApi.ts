import api from './api';

export const getAllCustomers = async (params?: { page?: number; limit?: number; search?: string; city?: string; status?: string; isPhoneVerified?: string }) => {
  const response = await api.get('/auth/admin/allCustomers', { params });
  return response.data;
};
