/**
 * Support desk.
 *
 * In the app, "Contact support" is currently a set of outbound links (phone,
 * email, socials) — see `ContactSupportBottomSheet` in `faajii-mobile-core`.
 * Giving those a backing store turns one-way contact into a tracked queue, and
 * lets the admin tie a complaint to the user, event or transaction it concerns.
 */

export type SupportChannel = "in_app" | "email" | "phone" | "whatsapp";

export type SupportStatus = "open" | "pending" | "resolved" | "closed";

export type SupportPriority = "low" | "normal" | "high" | "urgent";

export type SupportCategory =
  | "account"
  | "payment"
  | "event"
  | "ticket"
  | "wristband"
  | "vibes"
  | "other";

export interface SupportMessage {
  id: number;
  ticketId: number;
  author: "user" | "admin";
  authorName: string | null;
  body: string;
  created_at: string;
}

export interface SupportTicket {
  id: number;
  ref: string;
  subject: string;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  channel: SupportChannel;
  category: SupportCategory;
  status: SupportStatus;
  priority: SupportPriority;
  assignedToId: number | null;
  assignedToName: string | null;
  /** Whatever the complaint is about, so an agent can jump straight there. */
  relatedEventId: number | null;
  relatedTransactionRef: string | null;
  lastMessageAt: string | null;
  resolvedAt: string | null;
  created_at: string;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: SupportMessage[];
}

export interface SupportStats {
  open: number;
  pending: number;
  resolvedToday: number;
  unassigned: number;
  /** Mean first-response time in minutes over the trailing 7 days. */
  avgFirstResponseMinutes: number;
}

export interface SupportFilters {
  page: number;
  limit: number;
  search?: string;
  status?: SupportStatus;
  priority?: SupportPriority;
  category?: SupportCategory;
  assignedToId?: number;
}
