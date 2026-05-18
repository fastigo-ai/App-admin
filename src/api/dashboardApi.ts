import api from './api';

export const getDashboardAnalytics = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};
