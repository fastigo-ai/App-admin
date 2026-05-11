import api from './api';

export const getAllServices = async (params?: { page?: number; limit?: number; search?: string; category?: string; planType?: string }) => {
  const response = await api.get('/services/admin/allServicesDashboard', { params });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/services/category');
  return response.data;
};

export const getPlanTypes = async () => {
  const response = await api.get('/services/planTypes');
  return response.data;
};

export const createServicePlan = async (formData: FormData) => {
  const response = await api.post('/services/createServicePlan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateServicePlan = async (id: string, formData: FormData) => {
  const response = await api.put(`/services/editServicePlan/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteService = async (id: string) => {
  const response = await api.delete(`/services/deleteService/${id}`);
  return response.data;
};

// Category APIs
export const getAllCategories = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await api.get('/services/category', { params });
  return response.data;
};

export const createCategory = async (formData: FormData) => {
  const response = await api.post('/services/createCategory', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const editCategory = async (id: string, formData: FormData) => {
  const response = await api.put(`/services/editCategory/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteCategory = async (id: string) => {
  console.log('API: Deleting category ID:', id);
  try {
    const response = await fetch(`http://localhost:8080/api/services/deleteCategory/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    console.log('API: Delete response:', data);
    return data;
  } catch (error) {
    console.error('API: Delete fetch error:', error);
    throw error;
  }
};
