import axios from "@/services/axios";
import { ApiResponse } from "../utils/utils.types";
import {
  CreateIntegrationBusinessPayload,
  IntegrationBusiness,
} from "./integration.types";

export async function GetIntegrationBusinesses(): Promise<
  ApiResponse<IntegrationBusiness[]>
> {
  const response = await axios.get("/integrations/businesses");
  return response.data;
}

export async function CreateIntegrationBusiness(
  payload: CreateIntegrationBusinessPayload,
): Promise<ApiResponse<IntegrationBusiness>> {
  const response = await axios.post("/integrations/businesses", payload);
  return response.data;
}

export async function UpdateIntegrationBusiness(
  id: number,
  status: "active" | "suspended" | "revoked",
): Promise<ApiResponse<IntegrationBusiness>> {
  const response = await axios.patch(`/integrations/businesses/${id}`, {
    status,
  });
  return response.data;
}
