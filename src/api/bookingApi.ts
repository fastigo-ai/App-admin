import api from './api';

export const getAllBookings = async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const response = await api.get('/services/admin/allBookings', { params });
  return response.data;
};

export const getAllVendorBookings = async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const response = await api.get('/services/admin/allVendorBookings', { params });
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await api.put(`/services/admin/updateOrderStatus/${id}`, { status });
  return response.data;
};

// Add unassigning logic if needed later
export const unassignEngineer = async (orderId: string) => {
  const response = await api.put(`/engineer/unAssignEngineerFromOrder/${orderId}`);
  return response.data;
};

export const assignEngineer = async (orderId: string, engineerId: string) => {
  const response = await api.put(`/engineer/assignEngineerToOrder/${orderId}`, { engineerId });
  return response.data;
};
