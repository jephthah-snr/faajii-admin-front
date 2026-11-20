import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  FinanceEventDetail,
  FinanceEventFilters,
  FinanceEventRow,
  FinanceSummary,
  FinanceSummaryFilters,
} from "./finance-reports.types";
import {
  AdminFinanceSummary,
  AdminMomoAccount,
  AdminMomoAccountFilters,
  AdminWallet,
  AdminWalletFilters,
  MomoProvider,
} from "./finance.types";

/* --------------------------------- Wallets -------------------------------- */

export const GetWallets = async (
  filters: AdminWalletFilters,
): Promise<PaginatedResponse<AdminWallet>> => {
  const res = await axios.get("/admin/wallets", { params: filters });
  return res.data as PaginatedResponse<AdminWallet>;
};

export const GetFinanceSummary = async (): Promise<
  ApiResponse<AdminFinanceSummary>
> => {
  const res = await axios.get("/admin/wallets/summary");
  return res.data as ApiResponse<AdminFinanceSummary>;
};

/* ------------------------------ MoMo accounts ----------------------------- */

export const GetMomoAccounts = async (
  filters: AdminMomoAccountFilters,
): Promise<PaginatedResponse<AdminMomoAccount>> => {
  const res = await axios.get("/admin/momo/accounts", { params: filters });
  return res.data as PaginatedResponse<AdminMomoAccount>;
};

/**
 * The provider catalogue is already public on `/v1/momo/providers` — the admin
 * reads the same list so a filter dropdown can't drift from what the app offers.
 */
export const GetMomoProviders = async (): Promise<
  ApiResponse<MomoProvider[]>
> => {
  const res = await axios.get("/momo/providers");
  return res.data as ApiResponse<MomoProvider[]>;
};

/** Blocks a MoMo account from further funding without deleting the link. */
export const SetMomoAccountEnabled = async (
  id: number,
  enabled: boolean,
): Promise<ApiResponse<AdminMomoAccount>> => {
  const res = await axios.patch(`/admin/momo/accounts/${id}`, { enabled });
  return res.data as ApiResponse<AdminMomoAccount>;
};

/* ----------------------------- Platform earnings --------------------------- */

export const GetFinanceReport = async (
  filters: FinanceSummaryFilters,
): Promise<ApiResponse<FinanceSummary>> => {
  const res = await axios.get("/admin/finance/summary", { params: filters });
  return res.data as ApiResponse<FinanceSummary>;
};

export const GetFinanceEvents = async (
  filters: FinanceEventFilters,
): Promise<PaginatedResponse<FinanceEventRow>> => {
  const res = await axios.get("/admin/finance/events", { params: filters });
  return res.data as PaginatedResponse<FinanceEventRow>;
};

export const GetFinanceEvent = async (
  id: string | number,
): Promise<ApiResponse<FinanceEventDetail>> => {
  const res = await axios.get(`/admin/finance/events/${id}`);
  return res.data as ApiResponse<FinanceEventDetail>;
};

export * from "./finance.types";
export * from "./finance-reports.types";
