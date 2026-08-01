import axios from "@/services/axios";
import { ApiResponse } from "../utils/utils.types";
import {
  PurchaseChannel,
  PurchasesPage,
  PurchaseStatistics,
  TicketPurchase,
} from "./purchase.types";

export async function GetPurchases(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  channel?: PurchaseChannel;
}): Promise<ApiResponse<PurchasesPage>> {
  const response = await axios.get("/admin/purchases", { params });
  return response.data;
}

export async function GetPurchaseStatistics(): Promise<
  ApiResponse<PurchaseStatistics>
> {
  const response = await axios.get("/admin/purchases/statistics");
  return response.data;
}

export async function GetPurchase(
  reference: string,
): Promise<ApiResponse<TicketPurchase>> {
  const response = await axios.get(`/admin/purchases/${reference}`);
  return response.data;
}
