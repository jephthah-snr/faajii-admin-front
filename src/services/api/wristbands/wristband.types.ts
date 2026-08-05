import {Pagination} from '../utils/utils.types';

export type WristbandOrderStatus = 'pending_payment' | 'placed' | 'in_production' | 'quality_check' | 'shipped' | 'delivered' | 'payment_failed' | 'cancelled';
export type WristbandPaymentState = 'paid' | 'pending' | 'failed';

export interface AdminWristbandOrder {
  id: number;
  reference: string;
  eventId: number;
  eventRef: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  status: WristbandOrderStatus;
  paymentState: WristbandPaymentState;
  paymentMethod: 'momo' | 'wallet' | 'purse';
  paymentProviderRef?: string | null;
  amount: number;
  currency: string;
  totalQuantity: number;
  paidAt?: string | null;
  createdAt: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  fulfillmentNote?: string | null;
  reconciledAt?: string | null;
  reconciliationReference?: string | null;
  reconciliationAmount?: number | null;
  reconciliationNote?: string | null;
}

export interface WristbandOrderItem {
  id: number;
  productName: string;
  productCode: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  designUrl: string;
  designSourceUrl?: string | null;
  mockupUrl?: string | null;
  tierLabel?: string | null;
}

export interface WristbandOrderAudit {
  id: number;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  actorRole?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface AdminWristbandOrderDetail extends AdminWristbandOrder {
  items: WristbandOrderItem[];
  history: WristbandOrderAudit[];
}

export interface AdminWristbandOrdersPage {data: AdminWristbandOrder[]; pagination: Pagination;}
export interface AdminWristbandStatistics {
  byStatus: Array<{status: WristbandOrderStatus; orders: number; amount: number}>;
  paid: Array<{currency: string; orders: number; amount: number}>;
  pendingReconciliation: number;
}
