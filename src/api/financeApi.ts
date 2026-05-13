import api from './api';

export const getPendingRefunds = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get('/admin/refunds/pending', { params });
  return response.data;
};

export const getPendingPayouts = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get('/admin/payouts/pending', { params });
  return response.data;
};

export const approvePayout = async (id: string) => {
  const response = await api.post(`/admin/payouts/approve/${id}`);
  return response.data;
};

export const rejectPayout = async (id: string, reason: string) => {
  const response = await api.post(`/admin/payouts/reject/${id}`, { reason });
  return response.data;
};

export const getAllWallets = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await api.get('/admin/wallets', { params });
  return response.data;
};

export const getLedger = async (params?: { page?: number; limit?: number; engineerId?: string; category?: string; type?: string; search?: string }) => {
  const response = await api.get('/admin/ledger', { params });
  return response.data;
};

export const getFinanceStats = async () => {
  const response = await api.get('/admin/finance/stats');
  return response.data;
};

export const getPayoutHistory = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await api.get('/admin/payouts/history', { params });
  return response.data;
};

export const exportLedger = async (params?: { startDate?: string; endDate?: string }) => {
  const response = await api.get('/admin/ledger/export', { params, responseType: 'blob' });
  return response.data;
};
