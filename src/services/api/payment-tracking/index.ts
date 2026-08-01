import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  PaymentTracking,
  PaymentTrackingStats,
} from "./payment-tracking.types";

export * from "./payment-tracking.types";


/**
 * Get paginated list of payment tracking records
 */
export const GetPaymentTrackings = async (
  page: string,
  limit: string,
  search?: string,
  status?: string,
  serviceId?: string,
  startDate?: string,
  endDate?: string
): Promise<PaginatedResponse<PaymentTracking>> => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) params.append("q", search);
    if (status) params.append("status", status);
    if (serviceId) params.append("serviceId", serviceId);
    if (startDate) params.append("startdate", startDate);
    if (endDate) params.append("enddate", endDate);

    const url = `/admin/payment-tracking?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as PaginatedResponse<PaymentTracking>;
  } catch (err) {
    throw err;
  }
};

/**
 * Get single payment tracking record by ID
 */
export const GetPaymentTrackingById = async (
  id: string
): Promise<ApiResponse<PaymentTracking>> => {
  try {
    const url = `/admin/payment-tracking/${id}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<PaymentTracking>;
  } catch (err) {
    throw err;
  }
};

/**
 * Get payment tracking statistics
 */
export const GetPaymentTrackingStats = async (): Promise<
  ApiResponse<PaymentTrackingStats>
> => {
  try {
    const url = `/admin/payment-tracking/stats`;
    const res = await axios.get(url);
    return res.data as ApiResponse<PaymentTrackingStats>;
  } catch (err) {
    throw err;
  }
};

/**
 * Manually confirm a payment tracking record
 * For customer support to confirm payments that haven't been auto-confirmed
 */
export const ConfirmPaymentTracking = async (
  reference: string
): Promise<ApiResponse<PaymentTracking>> => {
  try {
    const url = `/admin/payment-tracking/${reference}/confirm`;
    const res = await axios.post(url);
    return res.data as ApiResponse<PaymentTracking>;
  } catch (err) {
    throw err;
  }
};

/**
 * Resend RSVP for a confirmed payment that wasn't processed
 * Handles the edge case where payment is confirmed but isProcessed is false
 */
export const ResendPaymentTrackingRsvp = async (
  id: number
): Promise<ApiResponse<PaymentTracking>> => {
  try {
    const url = `/admin/payment-tracking/${id}/resend-rsvp`;
    const res = await axios.post(url);
    return res.data as ApiResponse<PaymentTracking>;
  } catch (err) {
    throw err;
  }
};

/**
 * Waive amount difference and resend RSVP for partial payments
 * Handles the edge case where payment is partial with small remaining amount
 */
export const WaiveAmountAndResendRsvp = async (
  id: number
): Promise<ApiResponse<PaymentTracking>> => {
  try {
    const url = `/admin/payment-tracking/${id}/waive-and-resend`;
    const res = await axios.post(url);
    return res.data as ApiResponse<PaymentTracking>;
  } catch (err) {
    throw err;
  }
};

/**
 * Assign ticket for a duplicate payment
 * Processes the duplicate payment and creates the guest/order
 */
export const AssignDuplicateTicket = async (
  reference: string
): Promise<ApiResponse<PaymentTracking>> => {
  try {
    const url = `/admin/payment-tracking/${reference}/assign-ticket`;
    const res = await axios.post(url);
    return res.data as ApiResponse<PaymentTracking>;
  } catch (err) {
    throw err;
  }
};

/**
 * Escalate a duplicate payment to finance team
 * Sends an email with payment details for manual review
 */
export const EscalateToFinance = async (
  reference: string
): Promise<ApiResponse<PaymentTracking>> => {
  try {
    const url = `/admin/payment-tracking/${reference}/escalate`;
    const res = await axios.post(url);
    return res.data as ApiResponse<PaymentTracking>;
  } catch (err) {
    throw err;
  }
};

/**
 * Resend webhook for a payment tracking record
 * Used when actualAmount is N/A (webhook was never received)
 */
export const ResendPaymentTrackingWebhook = async (
  id: number
): Promise<ApiResponse<PaymentTracking>> => {
  try {
    const url = `/admin/payment-tracking/${id}/resend-webhook`;
    const res = await axios.post(url);
    return res.data as ApiResponse<PaymentTracking>;
  } catch (err) {
    throw err;
  }
};
