import axios from "@/services/axios";
import { ApiResponse } from "../utils/utils.types";
import {
  IPartyBundle,
  IPartyBundleDetails,
  IPartyBundleOverview,
} from "./party-bundle.types";

/**
 * Description: Send party bundle data
 * @returns Promise
 */

// Get party bundles overview
export const GetPartyBundlesOverview = async (): Promise<
  ApiResponse<IPartyBundleOverview>
> => {
  try {
    const url = "/admin/partybundle/overview";
    const res = await axios.get(url);
    return res.data as ApiResponse<IPartyBundleOverview>;
  } catch (err) {
    throw err;
  }
};

// Get party bundle sales
/* export const GetPartyBundleSales = async (): Promise<
  ApiResponse<IPartyBundle[]>
> => {
  try {
    const url = "/partybundle";
    const res = await axios.get(url);
    return res.data as ApiResponse<IPartyBundle[]>;
  } catch (err) {
    throw err;
  }
}; */

// Add party bundle
export const CreatePartyBundle = async (payload: FormData) => {
  try {
    const url = `/partybundle`;
    const res = await axios.post(url, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Get party bundles
export const GetPartyBundles = async (): Promise<
  ApiResponse<IPartyBundle[]>
> => {
  try {
    const url = "/partybundle";
    const res = await axios.get(url);
    return res.data as ApiResponse<IPartyBundle[]>;
  } catch (err) {
    throw err;
  }
};

// Get party bundle details
export const GetPartyBundleDetails = async (
  id: string
): Promise<ApiResponse<IPartyBundleDetails>> => {
  try {
    const url = `/partybundle/${id}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<IPartyBundleDetails>;
  } catch (err) {
    throw err;
  }
};
