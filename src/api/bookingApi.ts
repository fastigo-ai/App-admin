import api from './api';

export const getAllBookings = async () => {
  const response = await api.get('/services/allBookings');
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await api.put(`/services/updateOrderStatus/${id}`, { status });
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
