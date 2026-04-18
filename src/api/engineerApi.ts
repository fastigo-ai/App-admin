import api from './api';

export const getAllEngineers = async () => {
  const response = await api.get('/engineer/getEngineers');
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
