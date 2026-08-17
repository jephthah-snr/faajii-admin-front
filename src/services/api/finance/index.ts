import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
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

export * from "./finance.types";
