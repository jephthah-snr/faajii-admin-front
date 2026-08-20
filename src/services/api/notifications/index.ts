import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  AdminBroadcast,
  AdminPushToken,
  AdminPushTokenStats,
  BroadcastFilters,
  CreateBroadcastPayload,
} from "./notifications.types";

export const GetBroadcasts = async (
  filters: BroadcastFilters,
): Promise<PaginatedResponse<AdminBroadcast>> => {
  const res = await axios.get("/admin/notifications/broadcasts", {
    params: filters,
  });
  return res.data as PaginatedResponse<AdminBroadcast>;
};

export const CreateBroadcast = async (
  payload: CreateBroadcastPayload,
): Promise<ApiResponse<AdminBroadcast>> => {
  const res = await axios.post("/admin/notifications/broadcasts", payload);
  return res.data as ApiResponse<AdminBroadcast>;
};

/** Only valid while a broadcast is still `draft` or `queued`. */
export const CancelBroadcast = async (
  id: number,
): Promise<ApiResponse<AdminBroadcast>> => {
  const res = await axios.patch(`/admin/notifications/broadcasts/${id}/cancel`);
  return res.data as ApiResponse<AdminBroadcast>;
};

export const GetPushTokenStats = async (): Promise<
  ApiResponse<AdminPushTokenStats>
> => {
  const res = await axios.get("/admin/notifications/devices/statistics");
  return res.data as ApiResponse<AdminPushTokenStats>;
};

export const GetPushTokens = async (params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<PaginatedResponse<AdminPushToken>> => {
  const res = await axios.get("/admin/notifications/devices", { params });
  return res.data as PaginatedResponse<AdminPushToken>;
};

export * from "./notifications.types";
