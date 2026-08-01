import axios from "@/services/axios";
import { AuthResponse, LoginPayload } from "./auth.types";
import { ApiResponse } from "../utils/utils.types";

/**
 * Description: Send authentication data
 * @param  {LoginPayload} payload
 * @param  {ForgotPasswordPayload} payload
 * @returns Promise
 */

export const Login = async (
  payload: LoginPayload
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const url = "/admin/signin";
    const res = await axios.post(url, payload);
    return res.data as ApiResponse<AuthResponse>;
  } catch (err) {
    throw err;
  }
};

/* export const ForgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<any> => {
  try {
    const url = "/admin/reset-password";
    const res = await axios.post(url, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
}; */
