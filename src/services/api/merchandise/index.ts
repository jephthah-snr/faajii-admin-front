import axios from '@/services/axios';

export type AdminMerchandiseOrder = {
  id: number; orderReference: string; checkoutReference?: string | null;
  eventId: number; eventName?: string | null; eventReference?: string | null;
  buyer: {name?: string | null; email?: string | null; paymentPhone?: string | null; deliveryPhone: string; deliveryAddress: string};
  currency: 'NGN' | 'XOF'; status: 'pending' | 'fulfilled' | 'completed' | 'cancelled';
  paidAt?: string | null; fulfilledAt?: string | null; completedAt?: string | null; createdAt: string;
};

export type AdminMerchandiseOrderDetail = AdminMerchandiseOrder & {items: Array<{id: number; name: string; category: string; quantity: number; unitPrice: number; lineTotal: number; imageUrl?: string | null}>};

export const getAdminMerchandiseOrders = (params: {page?: number; limit?: number; search?: string; status?: string}) =>
  axios.get('/admin/merchandise-orders', {params});
export const getAdminMerchandiseOrder = (id: number) => axios.get(`/admin/merchandise-orders/${id}`);
