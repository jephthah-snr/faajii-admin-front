"use client";

import { Card, Group, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { GetAdminEventTransactions, GetFinanceEvent } from "@/services/api";
import type { FinanceEventDetail } from "@/services/api/finance/finance-reports.types";
import type { FinanceMarketView, FinanceStreamView } from "@/hooks";
import {
  estimateTicketFee,
  feeBearerLabel,
  formatCount,
  formatMoney,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  streamOrder,
} from "@/utils";
import EmptyState from "../empty-state";
import EarningsNotice from "./EarningsNotice";
import RevenueStatBar from "./RevenueStatBar";
import StreamBreakdown from "./StreamBreakdown";

const PAID_STATUSES = ["paid", "completed", "success", "successful"];

const Line = ({
  label,
  value,
  hint,
  strong,
}: {
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
}) => (
  <Group justify="space-between" wrap="nowrap" align="flex-start" gap="md">
    <Stack gap={0}>
      <Text fz="sm" c="var(--fj-text-secondary)">
        {label}
      </Text>
      {hint && (
        <Text fz="xs" c="var(--fj-text-muted)">
          {hint}
        </Text>
      )}
    </Stack>
    <Text fz="sm" fw={strong ? 800 : 600} ta="right">
      {value}
    </Text>
  </Group>
);

const toStreams = (detail: FinanceEventDetail): FinanceStreamView[] => {
  const byStream = new Map(detail.streams.map((s) => [s.stream, s]));
  return streamOrder.map((stream) => {
    const row = byStream.get(stream);
    return {
      stream,
      orders: row?.orders ?? 0,
      gross: row?.gross ?? 0,
      costs: row?.costs ?? 0,
      platformRevenue: row?.platformRevenue ?? 0,
    };
  });
};

/**
 * One event's money: what buyers paid, what Faajii kept, and what the host is
 * owed. Used on the event's Money tab and on `/finance/events/:id`.
 *
 * Reads `/admin/finance/events/:id`. Until that is deployed it falls back to
 * the event's live ticket payments, which gives gross and a fee estimate.
 */
const EventFinance = ({ eventId }: { eventId: string }) => {
  const detailQuery = useQuery({
    queryKey: ["admin-finance-event", eventId],
    queryFn: () => GetFinanceEvent(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  const isDerived = isEndpointUnavailable(detailQuery.error);

  const paymentsQuery = useQuery({
    queryKey: ["admin-event-transactions", eventId],
    queryFn: () => GetAdminEventTransactions(eventId),
    enabled: Boolean(eventId) && isDerived,
    retry: retryUnlessUnavailable,
  });

  const isLoading = isDerived ? paymentsQuery.isLoading : detailQuery.isLoading;

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={84} radius="md" />
        <Skeleton height={220} radius="lg" />
      </Stack>
    );
  }

  /* ----------------------------------------------------- Live (full) view */
  const detail = !isDerived ? detailQuery.data?.data : undefined;
  if (detail) {
    const market: FinanceMarketView = {
      currency: detail.currency,
      gross: detail.grossCollected,
      platformRevenue: detail.platformRevenue,
      estimatedTicketFee: null,
      processorFees: detail.processorFees,
      promoterCommission: detail.promoterCommission,
      netRevenue: detail.netRevenue,
      ticketFee: null,
      streams: toStreams(detail),
      trend: [],
    };
    const { tickets, host } = detail;
    const currency = detail.currency;

    return (
      <Stack gap="lg">
        <RevenueStatBar market={market} />

        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card radius="lg" p="lg">
            <Text fw={700} fz={16} mb={2}>
              Ticket fee ({Math.round(detail.feeRate * 100)}%)
            </Text>
            <Text fz={12} c="var(--fj-text-muted)" mb="md">
              Paid by: {feeBearerLabel(detail.feeBearer)}
            </Text>
            <Stack gap="sm">
              <Line
                label="Tickets sold"
                value={`${formatCount(tickets.ticketsSold)} in ${formatCount(tickets.orders)} orders`}
              />
              <Line
                label="Ticket value"
                hint="Prices as the host set them"
                value={formatMoney(tickets.faceValue, currency)}
              />
              <Line
                label="Fee added at checkout"
                hint="Customer-borne"
                value={formatMoney(tickets.feeAddedAtCheckout, currency)}
              />
              <Line
                label="Fee deducted from host"
                hint="Creator-borne"
                value={formatMoney(tickets.feeDeductedFromHost, currency)}
              />
              <Line
                strong
                label="Buyers paid for tickets"
                value={formatMoney(tickets.collected, currency)}
              />
            </Stack>
          </Card>

          <Card radius="lg" p="lg">
            <Text fw={700} fz={16} mb={2}>
              Host settlement
            </Text>
            <Text fz={12} c="var(--fj-text-muted)" mb="md">
              Ticket revenue after Faajii&rsquo;s fee
            </Text>
            <Stack gap="sm">
              <Line
                label="Earned"
                hint="Ticket value − fee deducted"
                value={formatMoney(host.earned, currency)}
              />
              <Line
                label="Paid out"
                value={formatMoney(host.paidOut, currency)}
              />
              <Line
                strong
                label="Balance owed"
                value={formatMoney(host.balance, currency)}
              />
              <Line
                label="Refunds"
                hint="Already excluded from revenue"
                value={formatMoney(detail.refunds, currency)}
              />
            </Stack>
          </Card>
        </SimpleGrid>

        <StreamBreakdown
          currency={currency}
          streams={market.streams}
          gross={market.gross}
          withLinks={false}
        />
      </Stack>
    );
  }

  /* -------------------------------------------- Fallback: live payments */
  if (isDerived) {
    const payments = (paymentsQuery.data?.data ?? []).filter((payment) =>
      PAID_STATUSES.includes(String(payment.status).toLowerCase()),
    );

    if (payments.length === 0) {
      return (
        <Stack gap="md">
          <EarningsNotice />
          <EmptyState
            compact
            title="No paid ticket sales yet"
            description="Revenue appears here once buyers pay for tickets to this event."
          />
        </Stack>
      );
    }

    const currency = payments[0].currency;
    const gross = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const estimate = estimateTicketFee(gross);
    const market: FinanceMarketView = {
      currency,
      gross,
      platformRevenue: null,
      estimatedTicketFee: estimate,
      processorFees: null,
      promoterCommission: null,
      netRevenue: null,
      ticketFee: null,
      streams: streamOrder.map((stream) =>
        stream === "tickets"
          ? {
              stream,
              orders: payments.length,
              gross,
              costs: 0,
              platformRevenue: null,
            }
          : {
              stream,
              orders: null,
              gross: null,
              costs: null,
              platformRevenue: null,
            },
      ),
      trend: [],
    };

    return (
      <Stack gap="lg">
        <EarningsNotice>
          Showing this event&rsquo;s paid ticket payments with a 5% fee
          estimate. Exact revenue, host settlement and the other streams
          (wristbands, merchandise, reach) arrive with{" "}
          <code>/admin/finance/events/:id</code>.{" "}
        </EarningsNotice>
        <RevenueStatBar market={market} />
        <StreamBreakdown
          currency={currency}
          streams={market.streams}
          gross={gross}
          estimatedTicketFee={estimate}
          withLinks={false}
        />
      </Stack>
    );
  }

  return (
    <EmptyState
      compact
      title="Couldn't load this event's finances"
      description="Try again in a moment."
    />
  );
};

export default EventFinance;
