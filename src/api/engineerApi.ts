import api from './api';

export const getAllEngineers = async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const response = await api.get('/engineer/admin/getEngineers', { params });
  return response.data;
};

export const updateEngineer = async (id: string, data: any) => {
  const response = await api.put(`/engineer/updateEngineer/${id}`, data);
  return response.data;
};

export const getAvailableEngineers = async () => {
  const response = await api.get('/engineer/getAvialbleEngineers');
  return response.data;
};
