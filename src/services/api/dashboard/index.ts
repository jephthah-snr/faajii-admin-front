import axios from "@/services/axios";
import { ApiResponse } from "../utils/utils.types";
import { ChartData, SubStatsData, UserAnalytics } from "./dashboard.types";
import { Transaction } from "../transaction/transaction.types";

/**
 * Description: Send dashboard data
 * @returns Promise
 */

// Get dashboard stats
export const GetUserAnalytics = async (): Promise<
  ApiResponse<UserAnalytics>
> => {
  try {
    const url = "/admin/dashboard/quickstats";
    const res = await axios.get(url);
    return res.data as ApiResponse<UserAnalytics>;
  } catch (err) {
    throw err;
  }
};

// Get dashboard sub stats
export const GetSubStats = async (): Promise<ApiResponse<SubStatsData>> => {
  try {
    const url = "/admin/dashboard/gen-stats";
    const res = await axios.get(url);
    return res.data as ApiResponse<SubStatsData>;
  } catch (err) {
    throw err;
  }
};

// Get dashboard chart data
export const GetChartData = async (
  query: "users" | "active" | "recent"
): Promise<ApiResponse<ChartData>> => {
  try {
    const url = `/admin/dashboard/graph?query=${query}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<ChartData>;
  } catch (err) {
    throw err;
  }
};

// Get recent transactions
export const GetDashboardRecentTransactions = async (): Promise<
  ApiResponse<Transaction[]>
> => {
  try {
    const url = "/admin/dashboard/recent-transactions";
    const res = await axios.get(url);
    return res.data as ApiResponse<Transaction[]>;
  } catch (err) {
    throw err;
  }
};
