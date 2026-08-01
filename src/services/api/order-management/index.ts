import axios from "@/services/axios";
import { ApiResponse, PaginatedOrderResponse } from "../utils/utils.types";
import { Order } from "./order.types";

/**
 * Description: Send orders data
 * @returns Promise
 */

// Get all orders
export const GetAllOrders = async (
  page: string,
  limit: string,
  search?: string,
  startDate?: string,
  endDate?: string,
  status?: string
): Promise<PaginatedOrderResponse<Order>> => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) {
      params.append("q", search);
    }

    if (startDate) {
      params.append("startDate", startDate);
    }

    if (endDate) {
      params.append("endDate", endDate);
    }

    if (status) {
      params.append("filter", status);
    }

    const url = `/admin/order-management?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as PaginatedOrderResponse<Order>;
  } catch (err) {
    throw err;
  }
};

// Update order status
export const UpdateOrderStatus = async (
  id: string,
  payload: { deliveryStatus: string }
): Promise<ApiResponse<Order>> => {
  try {
    const url = `/admin/gift-orders/${id}/status`;
    const res = await axios.put(url, payload);
    return res.data as ApiResponse<Order>;
  } catch (err) {
    throw err;
  }
};
