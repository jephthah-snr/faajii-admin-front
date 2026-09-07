import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  AdminPublication,
  AdminPublicationDetail,
  EventReachActivity,
  PublicationFilters,
  PublicationStatistics,
} from "./publication.types";

export const GetPublications = async (
  filters: PublicationFilters,
): Promise<PaginatedResponse<AdminPublication>> => {
  const res = await axios.get("/admin/publications", { params: filters });
  return res.data as PaginatedResponse<AdminPublication>;
};

export const GetPublicationStatistics = async (): Promise<
  ApiResponse<PublicationStatistics>
> => {
  const res = await axios.get("/admin/publications/statistics");
  return res.data as ApiResponse<PublicationStatistics>;
};

/** Campaigns are addressed by reference, the way the host's app does it. */
export const GetPublication = async (
  reference: string,
): Promise<ApiResponse<AdminPublicationDetail>> => {
  const res = await axios.get(
    `/admin/publications/${encodeURIComponent(reference)}`,
  );
  return res.data as ApiResponse<AdminPublicationDetail>;
};

export const GetEventPublications = async (
  eventId: string,
): Promise<ApiResponse<AdminPublication[]>> => {
  const res = await axios.get(`/admin/events/${eventId}/publications`);
  return res.data as ApiResponse<AdminPublication[]>;
};

/** The interest pool a campaign for this event can draw on. */
export const GetEventReachActivity = async (
  eventId: string,
): Promise<ApiResponse<EventReachActivity>> => {
  const res = await axios.get(`/admin/events/${eventId}/publications/activity`);
  return res.data as ApiResponse<EventReachActivity>;
};

export * from "./publication.types";
