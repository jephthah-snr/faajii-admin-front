import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  AdminPromoter,
  AdminPromoterDetail,
  AdminPromotion,
  PromoterFilters,
  PromoterStatistics,
} from "./promoter.types";

export const GetPromoters = async (
  filters: PromoterFilters,
): Promise<PaginatedResponse<AdminPromoter>> => {
  const res = await axios.get("/admin/promoters", { params: filters });
  return res.data as PaginatedResponse<AdminPromoter>;
};

export const GetPromoterStatistics = async (): Promise<
  ApiResponse<PromoterStatistics>
> => {
  const res = await axios.get("/admin/promoters/statistics");
  return res.data as ApiResponse<PromoterStatistics>;
};

/** Profile, promotions and wallet ledger for one promoter. */
export const GetPromoter = async (
  id: number | string,
): Promise<ApiResponse<AdminPromoterDetail>> => {
  const res = await axios.get(`/admin/promoters/${id}`);
  return res.data as ApiResponse<AdminPromoterDetail>;
};

/**
 * Switches a promoter profile off (or back on). Deactivating stops new
 * requests and offers; it does not cancel promotions already running or void
 * commission already earned.
 */
export const SetPromoterActive = async (
  id: number | string,
  isActive: boolean,
  reason?: string,
): Promise<ApiResponse<AdminPromoter>> => {
  const res = await axios.patch(`/admin/promoters/${id}/status`, {
    isActive,
    reason,
  });
  return res.data as ApiResponse<AdminPromoter>;
};

/** Every promoter working one event — the admin twin of the owner's screen. */
export const GetEventPromotions = async (
  eventId: string,
): Promise<ApiResponse<AdminPromotion[]>> => {
  const res = await axios.get(`/admin/events/${eventId}/promotions`);
  return res.data as ApiResponse<AdminPromotion[]>;
};

export * from "./promoter.types";
