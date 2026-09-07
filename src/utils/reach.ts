import type {
  AdminPublicationBreakdownRow,
  PublicationSelectionReason,
} from "@/services/api/publications/publication.types";

/**
 * The audience tiers a reach campaign draws from, in the order the platform
 * spends them: strongest intent first, discovery only once the rest run out.
 * Labels match what the host sees in the app, so admin and host describe the
 * same campaign the same way.
 */
const audienceLabels: Record<PublicationSelectionReason, string> = {
  abandoned_checkout: "Almost paid",
  bookmark: "Saved event",
  interested_view: "Viewed event",
  discovery_fill: "Discovery fill",
};

export const reachAudienceLabel = (
  reason: PublicationSelectionReason,
): string => audienceLabels[reason] ?? reason;

export interface ReachDelivery {
  reason: PublicationSelectionReason;
  sent: number;
  failed: number;
  pending: number;
  total: number;
}

/**
 * Rolls the reason × status rows the API returns up to one line per audience,
 * so a reader gets "who did we reach, and did it land" rather than a matrix.
 */
export const reachDeliveryByAudience = (
  rows: AdminPublicationBreakdownRow[] | null | undefined,
): ReachDelivery[] => {
  const grouped = new Map<PublicationSelectionReason, ReachDelivery>();

  for (const row of rows || []) {
    const entry = grouped.get(row.selectionReason) || {
      reason: row.selectionReason,
      sent: 0,
      failed: 0,
      pending: 0,
      total: 0,
    };
    entry[row.status] += row.count;
    entry.total += row.count;
    grouped.set(row.selectionReason, entry);
  }

  return [...grouped.values()].sort((a, b) => b.total - a.total);
};
