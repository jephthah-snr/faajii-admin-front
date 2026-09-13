import axios from "@/services/axios";
import type { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import type { KycStats, KycSubmission, KycSubmissionDetail, KycReviewStatus } from "./kyc.types";

export const GetKycSubmissions = async (params: { page?: number; limit?: number; search?: string; status?: KycReviewStatus }) =>
  (await axios.get("/admin/kyc", { params })).data as PaginatedResponse<KycSubmission>;
export const GetKycStats = async () => (await axios.get("/admin/kyc/stats")).data as ApiResponse<KycStats>;
export const GetKycSubmission = async (userId: number) => (await axios.get(`/admin/kyc/${userId}`)).data as ApiResponse<KycSubmissionDetail>;
export const ApproveKycPart = async (userId: number, part: "identity" | "selfie") =>
  (await axios.post(`/admin/kyc/${userId}/${part}/approve`)).data as ApiResponse<KycSubmissionDetail>;
export const DeclineKycPart = async (userId: number, part: "identity" | "selfie", reason: string) =>
  (await axios.post(`/admin/kyc/${userId}/${part}/decline`, { reason })).data as ApiResponse<KycSubmissionDetail>;
export * from "./kyc.types";
