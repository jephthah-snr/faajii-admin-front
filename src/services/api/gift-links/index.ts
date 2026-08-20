import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  AdminGiftLink,
  AdminGiftLinkDetail,
  GiftLinkFilters,
  GiftLinkStatus,
} from "./gift-links.types";

export const GetGiftLinks = async (
  filters: GiftLinkFilters,
): Promise<PaginatedResponse<AdminGiftLink>> => {
  const res = await axios.get("/admin/gift-links", { params: filters });
  return res.data as PaginatedResponse<AdminGiftLink>;
};

export const GetGiftLink = async (
  id: string,
): Promise<ApiResponse<AdminGiftLinkDetail>> => {
  const res = await axios.get(`/admin/gift-links/${id}`);
  return res.data as ApiResponse<AdminGiftLinkDetail>;
};

/** Suspends a link that breaches policy, or closes one on the owner's request. */
export const SetGiftLinkStatus = async (
  id: string,
  status: GiftLinkStatus,
  reason?: string,
): Promise<ApiResponse<AdminGiftLink>> => {
  const res = await axios.patch(`/admin/gift-links/${id}/status`, {
    status,
    reason,
  });
  return res.data as ApiResponse<AdminGiftLink>;
};

export * from "./gift-links.types";
