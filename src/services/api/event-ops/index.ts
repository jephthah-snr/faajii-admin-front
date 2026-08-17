import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  AdminCoPlanner,
  AdminDiscountCode,
  AdminEventBudget,
  AdminEventCheckIn,
  AdminEventCheckInSummary,
  AdminEventSponsor,
  AdminEventTask,
  AdminEventWallet,
} from "./event-ops.types";

/**
 * Admin access to the event-planning features the mobile app gives event owners
 * and co-planners. The mobile equivalents live under `/v1/event/:id/...` scoped
 * to the owner's token; these mirror them under `/admin/events/:id/...` —
 * matching the convention already used by `/admin/events/:id/guests`,
 * `/tickets`, `/planners`, `/vendors` and `/party-store`.
 */

/* ------------------------------- Co-planners ------------------------------ */
// Listing co-planners is already served by `GetAdminEventPlanners`
// (`/admin/events/:id/planners`); only the moderation action is new.

/** Pulls a co-planner's access without touching the owner's own permissions. */
export const RevokeEventCoPlanner = async (
  eventId: string,
  coPlannerId: number,
): Promise<ApiResponse<AdminCoPlanner>> => {
  const res = await axios.delete(
    `/admin/events/${eventId}/planners/${coPlannerId}`,
  );
  return res.data as ApiResponse<AdminCoPlanner>;
};

/* --------------------------------- Budget --------------------------------- */

export const GetEventBudget = async (
  eventId: string,
): Promise<ApiResponse<AdminEventBudget>> => {
  const res = await axios.get(`/admin/events/${eventId}/budget`);
  return res.data as ApiResponse<AdminEventBudget>;
};

/* ---------------------------------- Tasks --------------------------------- */

export const GetEventTasks = async (
  eventId: string,
): Promise<ApiResponse<AdminEventTask[]>> => {
  const res = await axios.get(`/admin/events/${eventId}/tasks`);
  return res.data as ApiResponse<AdminEventTask[]>;
};

/* -------------------------------- Sponsors -------------------------------- */

export const GetEventSponsors = async (
  eventId: string,
): Promise<ApiResponse<AdminEventSponsor[]>> => {
  const res = await axios.get(`/admin/events/${eventId}/sponsors`);
  return res.data as ApiResponse<AdminEventSponsor[]>;
};

/** Takes a sponsor down when its logo or link breaches content policy. */
export const RemoveEventSponsor = async (
  eventId: string,
  sponsorId: number,
): Promise<ApiResponse<null>> => {
  const res = await axios.delete(
    `/admin/events/${eventId}/sponsors/${sponsorId}`,
  );
  return res.data as ApiResponse<null>;
};

/* -------------------------------- Check-ins ------------------------------- */

export const GetEventCheckIns = async (
  eventId: string,
  params: { page: number; limit: number; search?: string; checkedIn?: boolean },
): Promise<PaginatedResponse<AdminEventCheckIn>> => {
  const res = await axios.get(`/admin/events/${eventId}/check-ins`, { params });
  return res.data as PaginatedResponse<AdminEventCheckIn>;
};

export const GetEventCheckInSummary = async (
  eventId: string,
): Promise<ApiResponse<AdminEventCheckInSummary>> => {
  const res = await axios.get(`/admin/events/${eventId}/check-ins/summary`);
  return res.data as ApiResponse<AdminEventCheckInSummary>;
};

/**
 * Manual override for the door: used when a guest's scan failed but their
 * ticket is valid, or when a check-in was recorded against the wrong guest.
 */
export const OverrideGuestCheckIn = async (
  eventId: string,
  guestId: number,
  checkedIn: boolean,
): Promise<ApiResponse<AdminEventCheckIn>> => {
  const res = await axios.patch(
    `/admin/events/${eventId}/check-ins/${guestId}`,
    { checkedIn },
  );
  return res.data as ApiResponse<AdminEventCheckIn>;
};

/* ----------------------------- Discount codes ----------------------------- */

export const GetEventDiscountCodes = async (
  eventId: string,
): Promise<ApiResponse<AdminDiscountCode[]>> => {
  const res = await axios.get(`/admin/events/${eventId}/discount-codes`, {
    params: { includeInactive: true },
  });
  return res.data as ApiResponse<AdminDiscountCode[]>;
};

export const SetDiscountCodeActive = async (
  eventId: string,
  codeId: number,
  isActive: boolean,
): Promise<ApiResponse<AdminDiscountCode>> => {
  const res = await axios.patch(
    `/admin/events/${eventId}/discount-codes/${codeId}`,
    { isActive },
  );
  return res.data as ApiResponse<AdminDiscountCode>;
};

/* ------------------------------ Event wallet ------------------------------ */

export const GetEventWallet = async (
  eventId: string,
): Promise<ApiResponse<AdminEventWallet>> => {
  const res = await axios.get(`/admin/events/${eventId}/wallet`);
  return res.data as ApiResponse<AdminEventWallet>;
};

export * from "./event-ops.types";
