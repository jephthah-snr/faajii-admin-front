import axios from "@/services/axios";
import { ApiResponse } from "../utils/utils.types";
import {
  AdminVibe,
  AdminVibesPage,
  VibeModerationStatus,
} from "./vibe.types";

export async function GetAdminVibes(params: {
  page: number;
  limit: number;
  search?: string;
  status?: VibeModerationStatus;
}): Promise<ApiResponse<AdminVibesPage>> {
  const response = await axios.get("/admin/vibes", { params });
  return response.data;
}

export async function GetAdminVibe(
  ref: string,
): Promise<ApiResponse<AdminVibe>> {
  const response = await axios.get(`/admin/vibes/${ref}`);
  return response.data;
}

export async function ModerateAdminVibe(
  ref: string,
  status: VibeModerationStatus,
  reason?: string,
): Promise<ApiResponse<AdminVibe>> {
  const response = await axios.patch(`/admin/vibes/${ref}/moderation`, {
    status,
    reason,
  });
  return response.data;
}
