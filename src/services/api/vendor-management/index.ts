import axios from "@/services/axios";
import { ApiResponse, vendorTabTypes } from "../utils/utils.types";
import {
  VendorDetails,
  VendorOrders,
  VendorTransaction,
  VendorsData,
} from "./vendor.types";

/**
 * Description: Send vendor data
 * @returns Promise
 */

// Get vendors
export const GetVendors = async (
  page: string,
  limit: string,
  search?: string,
  filter?: string
): Promise<ApiResponse<VendorsData>> => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) {
      params.append("q", search);
    }

    if (filter) {
      params.append("filter", filter);
    }

    const url = `/admin/vendors?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<VendorsData>;
  } catch (err) {
    throw err;
  }
};

// Get vendor details
export const GetVendorDetails = async (
  id: string,
  filter: vendorTabTypes,
  //filter?: string,
  q?: string,
  page?: string,
  limit?: string
): Promise<ApiResponse<VendorDetails | VendorOrders | VendorTransaction[]>> => {
  try {
    const params = new URLSearchParams({
      filter,
    });

    if (q) {
      params.append("q", q);
    }
    /* if (filter) {
      params.append("filter", filter);
    } */
    if (page) {
      params.append("page", page);
    }
    if (limit) {
      params.append("limit", limit);
    }

    const url = `/admin/vendors/${id}?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<
      VendorDetails | VendorOrders | VendorTransaction[]
    >;
  } catch (err) {
    throw err;
  }
};

export const RevokeVendorOrder = async (
  vendorId: string,
  orderId: string,
): Promise<ApiResponse<{ id: number }>> => {
  const response = await axios.delete(
    `/admin/vendors/${vendorId}/orders/${orderId}`,
  );
  return response.data;
};

// Toggle vendor status
export const ToggleVendorStatus = async (
  id: string,
  status: string
): Promise<any> => {
  try {
    const url = `/admin/vendors/${id}/toggle-status?status=${status}`;
    const res = await axios.put(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Delete vendor
export const DeleteVendor = async (id: string): Promise<any> => {
  try {
    const url = `/admin/vendors/${id}/delete`;
    const res = await axios.delete(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Approve vendor
export const ApproveVendor = async (id: string): Promise<any> => {
  try {
    const url = `/admin/vendors/${id}/approve`;
    const res = await axios.put(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Reject vendor
export const RejectVendor = async (id: string): Promise<any> => {
  try {
    const url = `/admin/vendors/${id}/reject`;
    const res = await axios.put(url, { rejectionReason: "rejected" });
    return res.data;
  } catch (err) {
    throw err;
  }
};
