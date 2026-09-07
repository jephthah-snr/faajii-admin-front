/**
 * Event reach — the paid publication campaigns behind
 * `/v1/event/:id/publications` in `faajii-mobile-core`. A host pays to push or
 * email their event to people the platform already knows are interested:
 * someone who abandoned a checkout, saved the event, viewed it, or — when
 * those run out — a discovery fill from the wider audience.
 *
 * The admin side is the platform-wide view: what was bought, who it actually
 * landed on, what it earned, and where sends failed.
 */

export type PublicationChannel = "push" | "email";

export type PublicationStatus =
  | "pending_payment"
  | "paid"
  | "sending"
  | "completed"
  | "failed";

export type PublicationRecipientStatus = "pending" | "sent" | "failed";

/** Why a recipient was picked — the audience tiers, strongest intent first. */
export type PublicationSelectionReason =
  | "abandoned_checkout"
  | "bookmark"
  | "interested_view"
  | "discovery_fill";

export type PublicationBreakdown = Record<PublicationSelectionReason, number>;

export interface PublicationEventRef {
  id: number;
  eventId: string;
  eventSlug: string;
  name: string;
  startDate: string | null;
}

export interface PublicationOwnerRef {
  userId: number;
  name: string;
  email: string | null;
}

export interface AdminPublication {
  id: number;
  reference: string;
  event: PublicationEventRef | null;
  owner: PublicationOwnerRef | null;
  channel: PublicationChannel;
  title: string;
  message: string;
  /** What the host asked for, before eligible-audience trimming. */
  userRequestedReach: number;
  /** What the platform could actually deliver, and billed for. */
  deliverableReach: number;
  reservedReach: number;
  countryCode: string | null;
  currency: string;
  unitPrice: number;
  totalAmount: number;
  status: PublicationStatus;
  sentCount: number;
  failedCount: number;
  failureReason: string | null;
  breakdown: PublicationBreakdown | null;
  paidAt: string | null;
  completedAt: string | null;
  created_at: string;
}

export interface AdminPublicationRecipient {
  id: number;
  userId: number;
  name: string | null;
  email: string | null;
  selectionReason: PublicationSelectionReason;
  status: PublicationRecipientStatus;
  providerReference: string | null;
  failureReason: string | null;
  sentAt: string | null;
}

/** One row per audience × delivery state, as the mobile detail screen gets. */
export interface AdminPublicationBreakdownRow {
  selectionReason: PublicationSelectionReason;
  status: PublicationRecipientStatus;
  count: number;
}

export interface AdminPublicationDetail {
  campaign: AdminPublication;
  recipients: AdminPublicationRecipient[];
  breakdown: AdminPublicationBreakdownRow[];
}

export interface PublicationSpendTotal {
  currency: string;
  amount: number;
  campaigns: number;
}

export interface PublicationChannelTotal {
  channel: PublicationChannel;
  campaigns: number;
  /** People actually sent to on this channel. */
  delivered: number;
}

export interface PublicationStatistics {
  totalCampaigns: number;
  /** Campaigns still waiting on the host's payment. */
  pendingPayment: number;
  delivered: number;
  failed: number;
  spend: PublicationSpendTotal[];
  byChannel: PublicationChannelTotal[];
}

/**
 * Interest the platform has recorded for one event — the pool a campaign draws
 * from. Same shape the host sees before buying reach.
 */
export interface EventReachActivity {
  view: number;
  abandoned_checkout: number;
  bookmark: number;
  totalInterested: number;
}

export interface PublicationFilters {
  page: number;
  limit: number;
  search?: string;
  channel?: PublicationChannel;
  status?: PublicationStatus;
}
