import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GetAdminWristbandStatistics,
  GetFinanceReport,
  GetPurchaseStatistics,
} from "@/services/api";
import type {
  FinanceMarketSummary,
  FinanceTrendPoint,
  RevenueStream,
} from "@/services/api/finance/finance-reports.types";
import {
  FinanceRangeKey,
  asList,
  estimateTicketFee,
  financeRangeLabel,
  isEndpointUnavailable,
  resolveFinanceRange,
  retryUnlessUnavailable,
  sortCurrencies,
  streamOrder,
} from "@/utils";

export interface FinanceStreamView {
  stream: RevenueStream;
  orders: number | null;
  gross: number | null;
  /** Production cost etc., already taken off `platformRevenue`. */
  costs: number | null;
  /** `null` = the backend does not report what Faajii keeps from this stream. */
  platformRevenue: number | null;
}

export interface FinanceMarketView {
  currency: string;
  gross: number;
  platformRevenue: number | null;
  /** Only set when earnings are not reported and a ticket-fee range can be worked out. */
  estimatedTicketFee: { min: number; max: number } | null;
  processorFees: number | null;
  promoterCommission: number | null;
  netRevenue: number | null;
  ticketFee: FinanceMarketSummary["ticketFee"] | null;
  streams: FinanceStreamView[];
  trend: FinanceTrendPoint[];
}

const fromSummary = (market: FinanceMarketSummary): FinanceMarketView => {
  const byStream = new Map(market.streams.map((s) => [s.stream, s]));
  return {
    currency: market.currency,
    gross: market.gross,
    platformRevenue: market.platformRevenue,
    estimatedTicketFee: null,
    processorFees: market.processorFees,
    promoterCommission: market.promoterCommission,
    netRevenue: market.netRevenue,
    ticketFee: market.ticketFee,
    streams: streamOrder.map((stream) => {
      const row = byStream.get(stream);
      return {
        stream,
        orders: row?.orders ?? 0,
        gross: row?.gross ?? 0,
        costs: row?.costs ?? 0,
        platformRevenue: row?.platformRevenue ?? 0,
      };
    }),
    trend: asList(market.trend),
  };
};

/**
 * What the platform takes in, one market at a time.
 *
 * `/admin/finance/summary` is the real answer — it knows the fee and who bore
 * it. Until it is deployed this falls back to the two live endpoints that
 * report paid money (ticket purchases and wristbands), which gives honest
 * *gross* and a ticket-fee estimate but cannot say what Faajii keeps.
 * `isDerived` tells the screen which one it is looking at.
 */
export const useFinanceSummary = (
  range: FinanceRangeKey,
  { enabled = true }: { enabled?: boolean } = {},
) => {
  const filters = resolveFinanceRange(range);

  const reportQuery = useQuery({
    queryKey: ["finance-summary", range],
    queryFn: () => GetFinanceReport(filters),
    enabled,
    retry: retryUnlessUnavailable,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const isDerived = isEndpointUnavailable(reportQuery.error);

  const purchasesQuery = useQuery({
    queryKey: ["purchase-statistics"],
    queryFn: GetPurchaseStatistics,
    enabled: enabled && isDerived,
    retry: retryUnlessUnavailable,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const wristbandsQuery = useQuery({
    queryKey: ["admin-wristband-statistics"],
    queryFn: GetAdminWristbandStatistics,
    enabled: enabled && isDerived,
    retry: retryUnlessUnavailable,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const summary = reportQuery.data?.data;
  const purchaseTotals = purchasesQuery.data?.data?.totals;
  const wristbandTotals = wristbandsQuery.data?.data?.paid;

  const markets = useMemo<FinanceMarketView[]>(() => {
    if (!isDerived) {
      return asList(summary?.markets)
        .map(fromSummary)
        .sort((a, b) => sortCurrencies(a.currency, b.currency));
    }

    const ticketsByCurrency = new Map<string, { orders: number; gross: number }>();
    asList(purchaseTotals)
      .filter((total) => total.status === "paid")
      .forEach((total) => {
        const current = ticketsByCurrency.get(total.currency) ?? {
          orders: 0,
          gross: 0,
        };
        ticketsByCurrency.set(total.currency, {
          orders: current.orders + Number(total.purchases || 0),
          gross: current.gross + Number(total.amount || 0),
        });
      });

    const wristbandsByCurrency = new Map<
      string,
      { orders: number; gross: number; cost: number | null }
    >();
    asList(wristbandTotals).forEach((total) => {
      const current = wristbandsByCurrency.get(total.currency) ?? {
        orders: 0,
        gross: 0,
        cost: null,
      };
      // Production cost is optional on the stats payload; without it the net
      // is unknown, and a missing cost must not read as "no cost".
      const cost =
        total.productionCost == null
          ? current.cost
          : (current.cost ?? 0) + Number(total.productionCost);
      wristbandsByCurrency.set(total.currency, {
        orders: current.orders + Number(total.orders || 0),
        gross: current.gross + Number(total.amount || 0),
        cost,
      });
    });

    const currencies = new Set([
      ...ticketsByCurrency.keys(),
      ...wristbandsByCurrency.keys(),
    ]);

    return [...currencies].sort(sortCurrencies).map((currency) => {
      const tickets = ticketsByCurrency.get(currency);
      const wristbands = wristbandsByCurrency.get(currency);
      const gross = (tickets?.gross ?? 0) + (wristbands?.gross ?? 0);
      return {
        currency,
        gross,
        platformRevenue: null,
        estimatedTicketFee: tickets ? estimateTicketFee(tickets.gross) : null,
        processorFees: null,
        promoterCommission: null,
        netRevenue: null,
        ticketFee: null,
        streams: streamOrder.map((stream) => {
          if (stream === "tickets")
            return {
              stream,
              orders: tickets?.orders ?? 0,
              gross: tickets?.gross ?? 0,
              costs: 0,
              platformRevenue: null,
            };
          if (stream === "wristbands")
            return {
              stream,
              orders: wristbands?.orders ?? 0,
              gross: wristbands?.gross ?? 0,
              costs: wristbands?.cost ?? null,
              platformRevenue:
                wristbands && wristbands.cost != null
                  ? wristbands.gross - wristbands.cost
                  : null,
            };
          return {
            stream,
            orders: null,
            gross: null,
            costs: null,
            platformRevenue: null,
          };
        }),
        trend: [],
      };
    });
  }, [isDerived, summary, purchaseTotals, wristbandTotals]);

  const isLoading = isDerived
    ? purchasesQuery.isLoading || wristbandsQuery.isLoading
    : reportQuery.isLoading;

  return {
    markets,
    isDerived,
    isLoading,
    /** True when the report failed for a reason other than "not deployed". */
    isError: !isDerived && reportQuery.isError,
    unreconciledPayments: summary?.unreconciledPayments ?? null,
    rangeLabel: isDerived ? "All time" : financeRangeLabel(range),
  };
};
