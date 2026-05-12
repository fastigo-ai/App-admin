import api from './api';

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'FLAT' | 'PERCENTAGE';
  value: number;
  maxDiscount?: number;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  perUserLimit: number;
  usedCount: number;
  isActive: boolean;
  targeting?: {
    firstTimeUserOnly: boolean;
    cities: string[];
    userSegments: string[];
  };
  stats?: {
    totalApplied: number;
    totalRedeemed: number;
  };
  conversionRate?: number;
}

export const getAllCoupons = async (): Promise<Coupon[]> => {
  const response = await api.get('/coupon/admin/list');
  return response.data.data;
};

export const createCoupon = async (data: Partial<Coupon>): Promise<Coupon> => {
  const response = await api.post('/coupon/admin/create', data);
  return response.data.data;
};

export const updateCoupon = async (couponId: string, data: Partial<Coupon>): Promise<Coupon> => {
  const response = await api.put(`/coupon/admin/update/${couponId}`, data);
  return response.data.data;
};

export const toggleCouponStatus = async (couponId: string, isActive: boolean): Promise<Coupon> => {
  const response = await api.patch(`/coupon/admin/toggle/${couponId}`, { isActive });
  return response.data.data;
};

export const deleteCoupon = async (couponId: string): Promise<void> => {
  await api.delete(`/coupon/admin/delete/${couponId}`);
};

export const searchUsers = async (query: string): Promise<any[]> => {
  const response = await api.get(`/admin/users/search?query=${query}`);
  return response.data.data;
};
