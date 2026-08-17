/**
 * Money-movement surfaces the mobile app exercises: MoMo account linking
 * (`/v1/momo/*`), event purse funding and transfers (`/v1/event/:id/wallet/*`)
 * and the user wallet (`/v1/user/wallet`). The admin needs the aggregate view
 * of all three to reconcile a day's takings.
 */

export interface MomoProvider {
  id: number;
  name: string;
  country: string;
  code?: string | null;
  isEnabled: boolean;
}

export type MomoAccountStatus = "active" | "pending" | "disabled" | "failed";

export interface AdminMomoAccount {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  number: string;
  fullName: string;
  countryCode: string;
  providerId: number | null;
  providerName: string | null;
  enabled: boolean;
  status: MomoAccountStatus;
  verifiedAt: string | null;
  created_at: string;
}

export interface AdminMomoAccountFilters {
  page: number;
  limit: number;
  search?: string;
  status?: MomoAccountStatus;
  providerId?: number;
  countryCode?: string;
}

export type WalletScope = "user" | "event";

export interface AdminWallet {
  id: number;
  scope: WalletScope;
  /** Present when `scope` is `event`. */
  eventId: number | null;
  eventName: string | null;
  userId: number;
  ownerName: string | null;
  balance: number;
  currency: string;
  totalFunded: number;
  totalSpent: number;
  isActive: boolean;
  lastMovementAt: string | null;
  created_at: string;
}

export interface AdminWalletFilters {
  page: number;
  limit: number;
  search?: string;
  scope?: WalletScope;
  currency?: string;
  minBalance?: number;
}

export interface AdminWalletTotals {
  currency: string;
  walletCount: number;
  totalBalance: number;
  totalFunded: number;
  totalSpent: number;
}

export interface AdminFinanceSummary {
  /** One entry per currency the platform holds float in. */
  totals: AdminWalletTotals[];
  fundingToday: number;
  payoutsToday: number;
  pendingSettlements: number;
  failedTransfers: number;
}
