import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  SupportFilters,
  SupportPriority,
  SupportStats,
  SupportStatus,
  SupportTicket,
  SupportTicketDetail,
} from "./support.types";

export const GetSupportTickets = async (
  filters: SupportFilters,
): Promise<PaginatedResponse<SupportTicket>> => {
  const res = await axios.get("/admin/support/tickets", { params: filters });
  return res.data as PaginatedResponse<SupportTicket>;
};

export const GetSupportStats = async (): Promise<ApiResponse<SupportStats>> => {
  const res = await axios.get("/admin/support/statistics");
  return res.data as ApiResponse<SupportStats>;
};

export const GetSupportTicket = async (
  id: number,
): Promise<ApiResponse<SupportTicketDetail>> => {
  const res = await axios.get(`/admin/support/tickets/${id}`);
  return res.data as ApiResponse<SupportTicketDetail>;
};

export const ReplyToSupportTicket = async (
  id: number,
  body: string,
): Promise<ApiResponse<SupportTicketDetail>> => {
  const res = await axios.post(`/admin/support/tickets/${id}/messages`, {
    body,
  });
  return res.data as ApiResponse<SupportTicketDetail>;
};

export const UpdateSupportTicket = async (
  id: number,
  payload: {
    status?: SupportStatus;
    priority?: SupportPriority;
    assignedToId?: number | null;
  },
): Promise<ApiResponse<SupportTicket>> => {
  const res = await axios.patch(`/admin/support/tickets/${id}`, payload);
  return res.data as ApiResponse<SupportTicket>;
};

export * from "./support.types";
