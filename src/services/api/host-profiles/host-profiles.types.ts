/**
 * Host profiles are the branded identities a user hosts events under. The
 * mobile app already carries `approvalStatus` / `approvedBy` / `rejectionReason`
 * on every profile (`faajii-mobile-core/src/modules/account/services/hostProfilesApi.ts`),
 * which means the approval queue was always meant to live in the admin.
 */

export type HostProfileType = "custom" | "user_profile";

export type HostApprovalStatus = "pending" | "approved" | "rejected";

export interface HostAddress {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

export interface AdminHostProfile {
  id: number;
  ref: string | null;
  userId: number;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerAvatar: string | null;
  name: string;
  description: string | null;
  avatar: string | null;
  website: string | null;
  address: HostAddress | null;
  socialMedia: Record<string, string> | null;
  type: HostProfileType;
  isActive: boolean;
  isDefault: boolean;
  approvalStatus: HostApprovalStatus;
  approvedBy: number | null;
  approvedByName: string | null;
  rejectionReason: string | null;
  approvedAt: string | null;
  eventsHosted: number;
  created_at: string;
  updated_at: string;
}

export interface AdminHostProfileStats {
  totalProfiles: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  customProfiles: number;
}

export interface HostProfileFilters {
  page: number;
  limit: number;
  search?: string;
  approvalStatus?: HostApprovalStatus;
  type?: HostProfileType;
}
