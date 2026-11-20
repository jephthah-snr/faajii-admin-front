import axios from '@/services/axios';
import {ApiResponse} from '../utils/utils.types';
import {AdminWristbandOrderDetail, AdminWristbandOrdersPage, AdminWristbandStatistics, WristbandOrderStatus, WristbandPaymentState} from './wristband.types';
import {AdminWristbandProduct, UploadedWristbandImage, WristbandProductInput} from './wristband-catalog.types';

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

/* ------------------------------- Catalog ---------------------------------- */

export async function GetAdminWristbandProducts(): Promise<ApiResponse<AdminWristbandProduct[]>> {
  return (await axios.get('/admin/wristbands/products')).data;
}
export async function CreateAdminWristbandProduct(payload: WristbandProductInput): Promise<ApiResponse<AdminWristbandProduct>> {
  return (await axios.post('/admin/wristbands/products', payload)).data;
}
export async function UpdateAdminWristbandProduct(id: number, payload: WristbandProductInput): Promise<ApiResponse<AdminWristbandProduct>> {
  return (await axios.put(`/admin/wristbands/products/${id}`, payload)).data;
}
/** Shows or hides a band in the app without touching existing orders. */
export async function SetAdminWristbandProductActive(id: number, isActive: boolean): Promise<ApiResponse<AdminWristbandProduct>> {
  return (await axios.patch(`/admin/wristbands/products/${id}/status`, {isActive})).data;
}
export async function UploadAdminWristbandImage(file: File): Promise<ApiResponse<UploadedWristbandImage>> {
  const formData = new FormData();
  formData.append('file', file);
  return (await axios.post('/admin/wristbands/products/images', formData)).data;
}

export * from './wristband.types';
export * from './wristband-catalog.types';
