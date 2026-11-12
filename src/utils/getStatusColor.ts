/**
 * One status palette for the whole admin.
 *
 * Every screen used to keep its own map onto Mantine's named colours, so
 * "pending" was yellow on one page and grey on the next, and the muted
 * `light` tints made most states read as the same dull grey-green. Each
 * status *meaning* now owns one vivid hue that stays readable on the black
 * surface, and neighbouring stages of one lifecycle (placed → in production →
 * shipped → delivered) land on different hues so a table can be scanned by
 * colour alone.
 *
 * Literal hex rather than `var(--fj-*)`: these feed Mantine's `color` prop and
 * `alpha()`, which parse the value and cannot resolve a CSS variable.
 */
export const STATUS_PALETTE = {
  success: "#22C55E",
  used: "#2DD4BF",
  info: "#22D3EE",
  progress: "#60A5FA",
  review: "#818CF8",
  transit: "#C084FC",
  pending: "#FACC15",
  caution: "#FB923C",
  danger: "#F87171",
  highlight: "#F472B6",
  neutral: "#9CA3AF",
} as const;

type StatusTone = keyof typeof STATUS_PALETTE;

const STATUS_TONES: Record<StatusTone, string[]> = {
  success: [
    "active", "approved", "accepted", "available", "complete", "completed",
    "confirmed", "delivered", "gifted", "paid", "resolved", "sent", "success",
    "successful", "verified", "live", "enabled", "settled", "credit",
  ],
  used: ["used", "checkedin", "redeemed", "refunded", "convertedtocash"],
  info: [
    "invited", "offered", "placed", "queued", "upcoming", "open", "new",
    "admin", "gifts", "ticket", "scheduled",
  ],
  progress: [
    "processing", "inprogress", "inproduction", "infulfilment", "fulfilled",
    "ongoing", "sending", "normal", "customersupport", "giftingstarted",
  ],
  review: ["qualitycheck", "underreview", "review", "superadmin", "services"],
  transit: ["shipped", "intransit", "outfordelivery", "products"],
  pending: [
    "pending", "pendingpayment", "awaiting", "awaitingpayment", "draft",
    "incomplete", "partial", "partiallypaid", "medium", "expectinggift",
  ],
  caution: [
    "suspended", "flagged", "declined", "high", "overpaid", "underpaid",
    "unverified", "onhold", "noshow",
  ],
  danger: [
    "failed", "paymentfailed", "rejected", "cancelled", "canceled",
    "revoked", "removed", "deleted", "disapproved", "deactivated", "urgent",
    "outofstock", "error", "debit", "frozen", "overdue",
  ],
  highlight: ["operations", "customrole1"],
  neutral: [
    "inactive", "closed", "hidden", "disabled", "expired", "notstarted",
    "low", "unknown", "all", "off", "notarrived",
  ],
};

const STATUS_COLOR_LOOKUP = new Map(
  (Object.entries(STATUS_TONES) as [StatusTone, string[]][]).flatMap(
    ([tone, statuses]) =>
      statuses.map((status) => [status, STATUS_PALETTE[tone]] as const),
  ),
);

/** "Pending_Payment", "pending payment" and "pending-payment" are one key. */
export const normalizeStatusKey = (status?: string | null) =>
  (status || "").toLowerCase().replace(/[\s_-]+/g, "");

export const getStatusColor = (status?: string | null): string =>
  STATUS_COLOR_LOOKUP.get(normalizeStatusKey(status)) ?? STATUS_PALETTE.neutral;
