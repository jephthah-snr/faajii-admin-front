import axios from '@/services/axios';
import {ApiResponse} from '../utils/utils.types';
import {AdminWristbandOrderDetail, AdminWristbandOrdersPage, AdminWristbandStatistics, WristbandOrderStatus, WristbandPaymentState} from './wristband.types';

export async function GetAdminWristbandOrders(params: {page: number; limit: number; search?: string; status?: WristbandOrderStatus; paymentState?: WristbandPaymentState; paymentMethod?: string;}): Promise<ApiResponse<AdminWristbandOrdersPage>> {
  return (await axios.get('/admin/wristbands/orders', {params})).data;
}
export async function GetAdminWristbandStatistics(): Promise<ApiResponse<AdminWristbandStatistics>> {
  return (await axios.get('/admin/wristbands/statistics')).data;
}
export async function GetAdminWristbandOrder(id: number): Promise<ApiResponse<AdminWristbandOrderDetail>> {
  return (await axios.get(`/admin/wristbands/orders/${id}`)).data;
}
export async function UpdateAdminWristbandFulfillment(id: number, payload: {status: 'in_production' | 'quality_check' | 'shipped' | 'delivered'; carrier?: string; trackingNumber?: string; note?: string;}): Promise<ApiResponse<AdminWristbandOrderDetail>> {
  return (await axios.patch(`/admin/wristbands/orders/${id}/fulfillment`, payload)).data;
}
export async function ReconcileAdminWristbandPayment(id: number, payload: {providerReference?: string; amount?: number; note?: string;}): Promise<ApiResponse<AdminWristbandOrderDetail>> {
  return (await axios.post(`/admin/wristbands/orders/${id}/reconcile`, payload)).data;
}
