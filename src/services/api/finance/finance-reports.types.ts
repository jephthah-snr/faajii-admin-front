/**
 * Platform earnings — the contract for `/admin/finance/*`.
 *
 * Nothing the backend serves today says what Faajii *keeps*: purchases and
 * wristband orders report what customers paid, which is not revenue. These
 * shapes are the contract the backend team builds to; `docs/backend-gaps.md`
 * has the long form, including the fee rules.
 *
 * Money is never summed across currencies. Every aggregate is per market
 * (XOF, NGN) and the screens show one market at a time.
 */

/** Who carries the 5% ticket fee for an event. */
export type FeeBearer = "customer" | "creator";

export type RevenueStream = "tickets" | "wristbands" | "merchandise" | "reach";

export interface FinanceStreamTotals {
  stream: RevenueStream;
  /** Paid orders in the period. */
  orders: number;
  /** What customers paid for this stream. */
  gross: number;
  /**
   * Cost of delivering the stream, subtracted before `platformRevenue`.
   * Only wristbands have one today: their production cost.
   */
  costs: number;
  /**
   * What Faajii keeps, net of `costs`:
   *  - tickets / merchandise: 5% of the item value (the fee)
   *  - wristbands: customer payments − production cost
   *  - reach: what the host paid
   */
  platformRevenue: number;
}

export interface FinanceTrendPoint {
  /** ISO date (day). */
  date: string;
  gross: number;
  platformRevenue: number;
}

export interface FinanceMarketSummary {
  currency: string;
  /** Everything customers paid, all streams. */
  gross: number;
  /** Everything Faajii keeps, all streams — before costs. */
  platformRevenue: number;
  /** Payment-processor charges Faajii absorbs. */
  processorFees: number;
  /**
   * Promoter commission owed on this market's events, expressed in this
   * market's currency so net revenue stays in one unit.
   */
  promoterCommission: number;
  /** Gross refunded in the period. Platform revenue is already net of it. */
  refunds: number;
  /** platformRevenue − processorFees − promoterCommission. */
  netRevenue: number;
  /** How the 5% ticket fee was collected. */
  ticketFee: {
    /** 0.05 */
    rate: number;
    /** Added on top of the ticket at checkout (customer-borne events). */
    addedAtCheckout: number;
    /** Subtracted from the host's ticket revenue (creator-borne events). */
    deductedFromHosts: number;
  };
  streams: FinanceStreamTotals[];
  trend: FinanceTrendPoint[];
}

export interface FinanceSummary {
  range: { from: string | null; to: string | null };
  markets: FinanceMarketSummary[];
  /** Payments taken but not yet matched to a ticket or order. */
  unreconciledPayments: number;
}

export interface FinanceSummaryFilters {
  /** ISO date, inclusive. */
  from?: string;
  /** ISO date, inclusive. */
  to?: string;
}

/* ---------------------------------- Events -------------------------------- */

export interface FinanceEventRow {
  eventId: number;
  eventRef: string;
  name: string;
  hostName: string | null;
  currency: string;
  startDate: string | null;
  feeBearer: FeeBearer | null;
  ticketsSold: number;
  /** Customer payments across every stream for this event. */
  gross: number;
  platformRevenue: number;
  /** Ticket revenue owed to the host after the fee. */
  hostPayout: number;
}

export interface FinanceEventFilters extends FinanceSummaryFilters {
  page: number;
  limit: number;
  search?: string;
  currency?: string;
  sort?: "platformRevenue" | "gross" | "startDate";
}

export interface FinanceEventDetail {
  event: {
    id: number;
    eventRef: string;
    name: string;
    hostName: string | null;
    startDate: string | null;
    status: string;
  };
  currency: string;
  feeBearer: FeeBearer | null;
  feeRate: number;
  tickets: {
    ticketsSold: number;
    orders: number;
    /** Sum of ticket prices as the host set them. */
    faceValue: number;
    /** Fee added at checkout (customer-borne). */
    feeAddedAtCheckout: number;
    /** Fee taken out of the host's revenue (creator-borne). */
    feeDeductedFromHost: number;
    /** What buyers actually paid: faceValue + feeAddedAtCheckout. */
    collected: number;
  };
  streams: FinanceStreamTotals[];
  grossCollected: number;
  platformRevenue: number;
  processorFees: number;
  promoterCommission: number;
  refunds: number;
  netRevenue: number;
  host: {
    /** faceValue − feeDeductedFromHost. */
    earned: number;
    paidOut: number;
    balance: number;
  };
}
