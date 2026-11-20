import dayjs from "dayjs";
import type {
  FeeBearer,
  FinanceSummaryFilters,
  RevenueStream,
} from "@/services/api/finance/finance-reports.types";

/** What Faajii charges on every ticket purchase. */
export const TICKET_FEE_RATE = 0.05;

/**
 * Who carries the fee decides where it shows up:
 *  - customer: added to the ticket at checkout — the buyer pays face × 1.05,
 *    the host keeps face value.
 *  - creator: taken out of the ticket — the buyer pays face value, the host
 *    keeps face × 0.95.
 * Either way Faajii earns face × 5%.
 */
export const feeBearerLabel = (bearer?: FeeBearer | null): string => {
  if (bearer === "customer") return "Customer (added at checkout)";
  if (bearer === "creator") return "Host (deducted from payout)";
  return "Not reported";
};

export const feeBearerShort = (bearer?: FeeBearer | null): string => {
  if (bearer === "customer") return "Customer";
  if (bearer === "creator") return "Host";
  return "—";
};

/**
 * Estimate of the ticket fee inside an amount buyers paid, when we do not know
 * who bore the fee. Customer-borne: collected = face × 1.05, so fee =
 * collected × 0.05 / 1.05. Creator-borne: collected = face, so fee =
 * collected × 0.05. The truth is somewhere between the two, and they are
 * within 5% of each other.
 */
export const estimateTicketFee = (
  collected: number,
): { min: number; max: number } => ({
  min: (collected * TICKET_FEE_RATE) / (1 + TICKET_FEE_RATE),
  max: collected * TICKET_FEE_RATE,
});

export const streamMeta: Record<
  RevenueStream,
  { label: string; href: string; note: string }
> = {
  tickets: {
    label: "Tickets",
    href: "/purchases",
    note: "5% fee on every ticket, including Faajii Store tickets",
  },
  wristbands: {
    label: "Wristbands",
    href: "/wristband-orders",
    note: "Customer payments less production cost",
  },
  merchandise: {
    label: "Merchandise",
    href: "/merchandise-orders",
    note: "5% fee on Faajii Store merchandise",
  },
  reach: {
    label: "Event reach",
    href: "/event-reach",
    note: "Paid push and email campaigns",
  },
};

export const streamOrder: RevenueStream[] = [
  "tickets",
  "wristbands",
  "merchandise",
  "reach",
];

export type FinanceRangeKey = "7d" | "30d" | "90d" | "year" | "all";

export const financeRanges: { value: FinanceRangeKey; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
];

export const financeRangeLabel = (key: FinanceRangeKey): string =>
  financeRanges.find((range) => range.value === key)?.label ?? "All time";

/** Turns a range preset into the `from` / `to` the endpoints take. */
export const resolveFinanceRange = (
  key: FinanceRangeKey,
): FinanceSummaryFilters => {
  if (key === "all") return {};
  const to = dayjs().format("YYYY-MM-DD");
  if (key === "year")
    return { from: dayjs().startOf("year").format("YYYY-MM-DD"), to };
  const days = key === "7d" ? 7 : key === "30d" ? 30 : 90;
  return { from: dayjs().subtract(days, "day").format("YYYY-MM-DD"), to };
};

/**
 * Regions the platform sells in, keyed by the currency its money is reported
 * in. This is the single place to add a region: the switchers on every finance
 * screen read it, merged with whatever markets the backend returns, so a new
 * region needs one line here (or nothing at all if the backend reports it).
 * Net revenue is reported per region until the markets are unified.
 */
export const marketLabels: Record<string, string> = {
  XOF: "West Africa (XOF)",
  NGN: "Nigeria (NGN)",
};

export const marketLabel = (currency: string): string =>
  marketLabels[currency] ?? currency;

/** Region options for a switcher: the known regions plus any the data adds. */
export const marketOptions = (
  currencies: string[] = [],
): { value: string; label: string }[] =>
  [...new Set([...Object.keys(marketLabels), ...currencies])]
    .sort(sortCurrencies)
    .map((currency) => ({ value: currency, label: marketLabel(currency) }));

/** XOF first (home market), then NGN, then anything else alphabetically. */
export const sortCurrencies = (a: string, b: string): number => {
  const rank = (code: string) => (code === "XOF" ? 0 : code === "NGN" ? 1 : 2);
  return rank(a) - rank(b) || a.localeCompare(b);
};

export const shareOf = (part: number, total: number): string =>
  total > 0 ? `${Math.round((part / total) * 100)}%` : "0%";
