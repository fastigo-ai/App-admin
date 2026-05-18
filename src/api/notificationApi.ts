import api from './api';

export interface SendNotificationParams {
  userIds: string[];
  userModel?: 'User' | 'Engineer';
  type?: string;
  title: string;
  body: string;
  image?: string;
  screen?: string;
  data?: any;
  scheduledAt?: string;
  batchSize?: number;
  staggerMinutes?: number;
}

export interface SendCampaignParams {
  target: 'all' | 'segment' | 'city';
  segment?: string;
  city?: string;
  userModel?: 'User' | 'Engineer';
  type?: string;
  title: string;
  body: string;
  image?: string;
  screen?: string;
  data?: any;
  scheduledAt?: string;
  batchSize?: number;
  staggerMinutes?: number;
}

export interface NotificationHistoryItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    mobile: string;
  };
  userModel: string;
  type: string;
  title: string;
  body: string;
  image?: string;
  screen?: string;
  status: string;
  openedAt?: string;
  createdAt: string;
}

export interface NotificationHistoryResponse {
  success: boolean;
  data: NotificationHistoryItem[];
  stats: {
    total: number;
    opened: number;
    openRate: number | string;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const sendNotification = async (params: SendNotificationParams) => {
  const response = await api.post('/admin/notification/send', params);
  return response.data;
};

export const sendCampaign = async (params: SendCampaignParams) => {
  const response = await api.post('/admin/notification/campaign', params);
  return response.data;
};

export const getNotificationHistory = async (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }): Promise<NotificationHistoryResponse> => {
  const response = await api.get('/admin/notification/history', { params });
  return response.data;
};
