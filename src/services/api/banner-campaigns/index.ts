import axios from "@/services/axios";
import { ApiResponse } from "../utils/utils.types";
import { BannerCampaign, BannerCampaignInput } from "./banner-campaign.types";

/** All routes need an admin token with `events.manage` (Super always allowed). */
export async function GetBannerCampaigns(): Promise<
  ApiResponse<BannerCampaign[] | { data: BannerCampaign[] }>
> {
  return (await axios.get("/admin/banner-campaigns")).data;
}

export async function GetBannerCampaign(
  id: number,
): Promise<ApiResponse<BannerCampaign>> {
  return (await axios.get(`/admin/banner-campaigns/${id}`)).data;
}

export async function CreateBannerCampaign(
  payload: BannerCampaignInput,
): Promise<ApiResponse<BannerCampaign>> {
  return (await axios.post("/admin/banner-campaigns", payload)).data;
}

export async function UpdateBannerCampaign(
  id: number,
  payload: Partial<BannerCampaignInput>,
): Promise<ApiResponse<BannerCampaign>> {
  return (await axios.patch(`/admin/banner-campaigns/${id}`, payload)).data;
}

export async function DeleteBannerCampaign(
  id: number,
): Promise<ApiResponse<unknown>> {
  return (await axios.delete(`/admin/banner-campaigns/${id}`)).data;
}

export * from "./banner-campaign.types";
