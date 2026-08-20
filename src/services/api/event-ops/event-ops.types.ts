/**
 * Admin-side mirrors of the event planning features the mobile app exposes to
 * event owners and co-planners. Field names track the mobile payloads
 * (`faajii-mobile-core/src/modules/events/services/*`) so the same backend
 * records can be served to admins without a second mapping layer.
 */

/* ------------------------------- Co-planners ------------------------------ */

export type CoPlannerStatus = "pending" | "accepted" | "declined" | "revoked";

export interface CoPlannerPermission {
  id: string;
  access: boolean;
}

export interface AdminCoPlanner {
  id: number;
  eventId: number;
  userId: number | null;
  name: string;
  phone: string;
  email: string | null;
  status: CoPlannerStatus;
  permissions: CoPlannerPermission[];
  invitedByUserId: number;
  invitedByName?: string | null;
  invitedAt: string;
  respondedAt?: string | null;
}

/* --------------------------------- Budget --------------------------------- */

export interface AdminBudgetItem {
  id: number;
  eventId: number;
  userId: number;
  item: string;
  amount: number;
  amountSpent: number;
  itemColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEventBudget {
  currency: string;
  totalBudgeted: number;
  totalSpent: number;
  items: AdminBudgetItem[];
}

/* ---------------------------------- Tasks --------------------------------- */

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue"
  | "cancelled";

export interface AdminEventTask {
  id: number;
  eventId: number | null;
  createdBy: number;
  createdByName?: string | null;
  assigneeId: number | null;
  assigneeName?: string | null;
  title: string;
  description: string | null;
  deadline: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------- Sponsors -------------------------------- */

export interface AdminEventSponsor {
  id: number;
  eventId: number;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------- Check-ins ------------------------------- */

export interface AdminEventCheckIn {
  id: number;
  eventId: number;
  guestId: number;
  guestName: string;
  guestPhone: string | null;
  guestEmail: string | null;
  ticketReference: string | null;
  ticketType: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

export interface AdminEventCheckInSummary {
  totalGuests: number;
  checkedIn: number;
  notCheckedIn: number;
  checkInRate: number;
  lastCheckInAt: string | null;
}

/* ----------------------------- Discount codes ----------------------------- */

export type DiscountCodeType = "percent" | "fixed";

export interface AdminDiscountCode {
  id: number;
  eventId: number;
  code: string;
  type: DiscountCodeType;
  value: number;
  scope: "event" | "ticket";
  offerId: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------ Event wallet ------------------------------ */

export type WalletMovementDirection = "CREDIT" | "DEBIT";

export interface AdminEventWalletMovement {
  id: number;
  reference: string;
  direction: WalletMovementDirection;
  amount: number;
  fee: number;
  currency: string;
  status: "pending" | "success" | "failed";
  narration: string | null;
  counterparty: string | null;
  budgetItemId: number | null;
  created_at: string;
}

export interface AdminEventWallet {
  id: number;
  eventId: number;
  userId: number;
  ownerName: string | null;
  balance: number;
  currency: string;
  isActive: boolean;
  totalFunded: number;
  totalSpent: number;
  linkedMomoAccounts: {
    id: number;
    number: string;
    fullName: string;
    countryCode: string;
    enabled: boolean;
    providerName?: string | null;
  }[];
  movements: AdminEventWalletMovement[];
}
