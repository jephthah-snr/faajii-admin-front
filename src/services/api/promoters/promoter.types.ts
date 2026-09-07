/**
 * Promoters — the commission sellers behind `/v1/promoter/*` in
 * `faajii-mobile-core`. A user switches their promoter profile on, requests to
 * promote an event, and the event owner answers with a commission offer. Once
 * accepted the promoter gets a tracked code and RSVP link, and every ticket
 * sold through it credits their promoter wallet.
 *
 * The admin side is the platform-wide view of that: who is promoting, what
 * they have sold, what the platform owes them, and whether a profile needs
 * pulling.
 *
 * Every promoter figure on this screen is FCFA. Commission is settled in one
 * currency platform-wide regardless of the market an event sells in, so the
 * amounts here are plain numbers rather than per-currency maps — there is
 * nothing to disambiguate.
 */

/** The one settlement currency for promoter commission and payouts. */
export const PROMOTER_CURRENCY = "XOF";

/** The six states a promotion moves through, as returned by the API. */
export type PromotionStatus =
  | "pending"
  | "offered"
  | "active"
  | "declined"
  | "cancelled"
  | "expired";

export type CommissionType = "percentage" | "flat";

export type PromoterWalletEntryType = "credit" | "debit";

export type PromoterWalletEntryStatus =
  | "pending"
  | "success"
  | "failed"
  | "reversed";

export interface PromoterWallet {
  id: number;
  /** FCFA — see `PROMOTER_CURRENCY`. */
  balance: number;
}

export interface PromotionEventRef {
  id: number;
  /** Public event reference (`eventId` in the app), not the numeric row id. */
  eventId: string;
  eventSlug: string;
  name: string;
  startDate: string | null;
}

export interface PromoterRef {
  id: number;
  userId: number;
  name: string;
  avatar: string | null;
}

export interface AdminPromotion {
  id: number;
  status: PromotionStatus;
  commissionType: CommissionType | null;
  /** A percentage, or a flat FCFA amount per ticket. */
  commissionValue: number | null;
  /** Issued only once the promoter accepts the offer. */
  promoterCode: string | null;
  rsvpLink: string | null;
  event: PromotionEventRef | null;
  promoter: PromoterRef | null;
  ticketsSold: number;
  /** Gross the event owner took through this promoter, before commission. */
  gross: number;
  /** What the promoter earned on it, in FCFA. */
  earned: number;
  created_at: string;
}

export interface AdminPromoter {
  /** Promoter profile id — `userId` is the account behind it. */
  id: number;
  userId: number;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  /** A promoter can switch their own profile off; an admin can too. */
  isActive: boolean;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  xHandle: string | null;
  website: string | null;
  bio: string | null;
  activePromotions: number;
  pendingRequests: number;
  ticketsSold: number;
  gross: number;
  earned: number;
  walletBalance: number;
  created_at: string;
}

export interface AdminPromoterWalletEntry {
  id: number;
  promotionId: number | null;
  eventId: number | null;
  eventName: string | null;
  type: PromoterWalletEntryType;
  status: PromoterWalletEntryStatus;
  amount: number;
  reference: string;
  narration: string | null;
  created_at: string;
}

export interface AdminPromoterDetail extends AdminPromoter {
  wallets: PromoterWallet[];
  promotions: AdminPromotion[];
  /** Commission credits and withdrawals, newest first. */
  walletTransactions: AdminPromoterWalletEntry[];
}

export interface PromoterStatistics {
  totalPromoters: number;
  activePromoters: number;
  activePromotions: number;
  pendingRequests: number;
  ticketsSold: number;
  /** Generated for event owners through promoter links. */
  gross: number;
  /** Commission earned by promoters. */
  commission: number;
  /** Sitting in promoter wallets, not yet withdrawn. */
  unpaid: number;
}

export interface PromoterFilters {
  page: number;
  limit: number;
  search?: string;
  /** Profile state, not promotion state. */
  status?: "active" | "inactive";
  /** Narrows to promoters holding at least one promotion in this state. */
  promotionStatus?: PromotionStatus;
}
