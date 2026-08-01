import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  Transaction,
  TransactionDetails,
  VerifiedTransaction,
} from "./transaction.types";

/**
 * Description: Send transaction data
 * @returns Promise
 */

// Get transactions
export const GetTransactions = async (
  page: string,
  limit: string,
  search?: string,
  status?: string,
  type?: string,
  range?: string,
  startDate?: string,
  endDate?: string
): Promise<PaginatedResponse<Transaction>> => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) params.append("q", search);
    if (status) params.append("status", status);
    if (type) params.append("type", type);
    if (range) params.append("range", range);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const url = `/admin/transactions?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as PaginatedResponse<Transaction>;
  } catch (err) {
    throw err;
  }
};

// Get recent transactions
export const GetTransactionDetails = async (
  ref: string
): Promise<ApiResponse<TransactionDetails>> => {
  try {
    const url = `/admin/transactions/${ref}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<TransactionDetails>;
  } catch (err) {
    throw err;
  }
};

// Verify transaction
export const VerifyTransaction = async (
  sessionId: string
): Promise<ApiResponse<VerifiedTransaction>> => {
  try {
    const url = `/admin/transaction/${sessionId}/verify`;
    const res = await axios.get(url);
    return res.data as ApiResponse<VerifiedTransaction>;
  } catch (err) {
    throw err;
  }
};

// Complete transaction
export const CompleteTransaction = async (
  sessionId: string
): Promise<ApiResponse<any>> => {
  try {
    const url = `/admin/transaction/${sessionId}/complete`;
    const res = await axios.post(url);
    return res.data as ApiResponse<any>;
  } catch (err) {
    throw err;
  }
};
