import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  AdminHostProfile,
  AdminHostProfileStats,
  HostProfileFilters,
} from "./host-profiles.types";

/** Approval queue and directory for the host identities users create in-app. */

export const GetHostProfiles = async (
  filters: HostProfileFilters,
): Promise<PaginatedResponse<AdminHostProfile>> => {
  const res = await axios.get("/admin/host-profiles", { params: filters });
  return res.data as PaginatedResponse<AdminHostProfile>;
};

export const GetHostProfileStats = async (): Promise<
  ApiResponse<AdminHostProfileStats>
> => {
  const res = await axios.get("/admin/host-profiles/statistics");
  return res.data as ApiResponse<AdminHostProfileStats>;
};

export const GetHostProfile = async (
  id: number,
): Promise<ApiResponse<AdminHostProfile>> => {
  const res = await axios.get(`/admin/host-profiles/${id}`);
  return res.data as ApiResponse<AdminHostProfile>;
};

export const ApproveHostProfile = async (
  id: number,
): Promise<ApiResponse<AdminHostProfile>> => {
  const res = await axios.patch(`/admin/host-profiles/${id}/approve`);
  return res.data as ApiResponse<AdminHostProfile>;
};

export const RejectHostProfile = async (
  id: number,
  rejectionReason: string,
): Promise<ApiResponse<AdminHostProfile>> => {
  const res = await axios.patch(`/admin/host-profiles/${id}/reject`, {
    rejectionReason,
  });
  return res.data as ApiResponse<AdminHostProfile>;
};

export * from "./host-profiles.types";
