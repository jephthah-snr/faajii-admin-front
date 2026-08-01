import axios from "@/services/axios";
import { ApiResponse, PaginatedResponse } from "../utils/utils.types";
import {
  IAdmin,
  IAdminProfile,
  ICreateAdminPayload,
  IRole,
  IPermissionGroup,
  IAuditLog,
  ICreateRolePayload,
  IUpdateRolePayload,
  IUpdateRolePermissionsPayload,
  IChangeAdminRolePayload,
  IAuditLogFilters,
} from "./admin.types";

/**
 * Description: Send admin data
 * @returns Promise
 */

// Get all admins
export const GetAdmins = async (
  page: string,
  limit: string,
  search?: string
): Promise<PaginatedResponse<IAdmin>> => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) {
      params.append("q", search);
    }

    const url = `/admin/all/admins-list?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as PaginatedResponse<IAdmin>;
  } catch (err) {
    throw err;
  }
};

// Get single admin
export const GetSingleAdmin = async (
  id: string
): Promise<ApiResponse<IAdminProfile>> => {
  try {
    const url = `/admin/${id}/single-admin`;
    const res = await axios.get(url);
    return res.data as ApiResponse<IAdminProfile>;
  } catch (err) {
    throw err;
  }
};

// Get admin profile
export const GetAdminProfile = async (): Promise<
  ApiResponse<IAdminProfile>
> => {
  try {
    const url = "/admin/admin-profile";
    const res = await axios.get(url);
    return res.data as ApiResponse<IAdminProfile>;
  } catch (err) {
    throw err;
  }
};

// Admin logout
export const AdminLogout = async (): Promise<any> => {
  try {
    const url = "/admin/logout";
    const res = await axios.post(url);
    return res.data;
  } catch (err) {
    // Don't throw - logout should succeed client-side even if API fails
    console.error("Logout API error:", err);
  }
};

// Create an admin
export const CreateAdmin = async (
  payload: ICreateAdminPayload
): Promise<any> => {
  try {
    const url = "/admin/invite";
    const res = await axios.post(url, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Delete an admin
export const DeleteAdmin = async (id: string): Promise<any> => {
  try {
    const url = `/admin/${id}/delete`;
    const res = await axios.delete(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Suspend an admin
export const SuspendAdmin = async (id: string): Promise<any> => {
  try {
    const url = `/admin/${id}/suspend`;
    const res = await axios.put(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Get all roles
export const GetRoles = async (): Promise<ApiResponse<IRole[]>> => {
  try {
    const url = "/admin/roles";
    const res = await axios.get(url);
    return res.data as ApiResponse<IRole[]>;
  } catch (err) {
    throw err;
  }
};

// Create a role
export const CreateRole = async (
  payload: ICreateRolePayload
): Promise<ApiResponse<IRole>> => {
  try {
    const url = "/admin/roles";
    const res = await axios.post(url, payload);
    return res.data as ApiResponse<IRole>;
  } catch (err) {
    throw err;
  }
};

// Update a role
export const UpdateRole = async (
  id: number,
  payload: IUpdateRolePayload
): Promise<ApiResponse<IRole>> => {
  try {
    const url = `/admin/roles/${id}`;
    const res = await axios.put(url, payload);
    return res.data as ApiResponse<IRole>;
  } catch (err) {
    throw err;
  }
};

// Delete a role
export const DeleteRole = async (id: number): Promise<any> => {
  try {
    const url = `/admin/roles/${id}`;
    const res = await axios.delete(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Update role permissions
export const UpdateRolePermissions = async (
  id: number,
  payload: IUpdateRolePermissionsPayload
): Promise<ApiResponse<IRole>> => {
  try {
    const url = `/admin/roles/${id}/permissions`;
    const res = await axios.put(url, payload);
    return res.data as ApiResponse<IRole>;
  } catch (err) {
    throw err;
  }
};

// Get all permissions grouped by category
export const GetPermissions = async (): Promise<
  ApiResponse<IPermissionGroup[]>
> => {
  try {
    const url = "/admin/permissions";
    const res = await axios.get(url);
    return res.data as ApiResponse<IPermissionGroup[]>;
  } catch (err) {
    throw err;
  }
};

// Change admin role
export const ChangeAdminRole = async (
  adminId: number,
  payload: IChangeAdminRolePayload
): Promise<any> => {
  try {
    const url = `/admin/${adminId}/change-role`;
    const res = await axios.put(url, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Get audit logs
export const GetAuditLogs = async (
  filters: IAuditLogFilters = {}
): Promise<PaginatedResponse<IAuditLog>> => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.adminId) params.append("adminId", filters.adminId);
    if (filters.category) params.append("category", filters.category);
    if (filters.role) params.append("role", filters.role);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.search) params.append("search", filters.search);

    const url = `/admin/audit-logs?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as PaginatedResponse<IAuditLog>;
  } catch (err) {
    throw err;
  }
};
