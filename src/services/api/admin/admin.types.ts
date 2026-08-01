export interface IAdmin {
  ref: string;
  id: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: string;
  adminRole: string;
  roleId: number;
  roleName: string | null;
  isSuspended: boolean;
  created_at: string;
}

export interface ICreateAdminPayload {
  firstName: string;
  lastName: string;
  adminRole: string;
  phoneNumber: string;
  email: string;
}

export interface IRole {
  id: number;
  ref: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: IPermission[];
  created_at: string;
  updated_at: string;
}

export interface IPermission {
  id: number;
  ref: string;
  key: string;
  label: string;
  category: string;
}

export interface IPermissionGroup {
  category: string;
  permissions: IPermission[];
}

export interface IAuditLog {
  id: number;
  adminId: number;
  adminName: string;
  adminRole: string;
  action: string;
  category: string;
  details: string;
  ipAddress: string;
  created_at: string;
}

export interface ICreateRolePayload {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface IUpdateRolePayload {
  name?: string;
  description?: string;
}

export interface IUpdateRolePermissionsPayload {
  permissions: string[];
}

export interface IChangeAdminRolePayload {
  roleId: number;
}

export interface IAuditLogFilters {
  page?: string;
  limit?: string;
  adminId?: string;
  category?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface IAdminProfile {
  ref: string;
  id: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  avatar: string;
  adminRole: string;
  role: string;
  adminId: string;
  roleId: number;
  roleName: string | null;
  isDeleted: boolean;
  isSuspended: boolean;
  created_at: string;
  updated_at: string;
}
