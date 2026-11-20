"use client";

import {
  EarningsNotice,
  EmptyState,
  MarketSelect,
  RevenueStatBar,
  StreamBreakdown,
  SummaryCardSkeleton,
} from "@/components";
import { AppLayout } from "@/layout";
import { useFinanceSummary } from "@/hooks";
import { GetFinanceEvents } from "@/services/api";
import { LineChart } from "@mantine/charts";
import {
  Anchor,
  Badge,
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FinanceRangeKey,
  feeBearerShort,
  financeRanges,
  formatCount,
  formatMoney,
  resolveFinanceRange,
  retryUnlessUnavailable,
  isEndpointUnavailable,
  marketLabel,
} from "@/utils";

export default function FinancePage() {
  const [range, setRange] = useState<FinanceRangeKey>("30d");
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  const { markets, isDerived, isLoading, isError, rangeLabel, unreconciledPayments } =
    useFinanceSummary(range);

  // A region with no sales yet is still selectable — it shows an empty state
  // rather than snapping back to another region.
  const activeCurrency = selectedCurrency ?? markets[0]?.currency ?? "XOF";
  const market = useMemo(
    () => markets.find((m) => m.currency === activeCurrency),
    [markets, activeCurrency],
  );

  const topEventsQuery = useQuery({
    queryKey: ["finance-top-events", market?.currency, range],
    queryFn: () =>
      GetFinanceEvents({
        page: 1,
        limit: 5,
        currency: market?.currency,
        sort: "platformRevenue",
        ...resolveFinanceRange(range),
      }),
    enabled: Boolean(market) && !isDerived,
    retry: retryUnlessUnavailable,
  });
  const topEvents = topEventsQuery.data?.data?.data ?? [];
  const topEventsUnavailable = isEndpointUnavailable(topEventsQuery.error);

  const chartData = (market?.trend ?? []).map((point) => ({
    date: point.date,
    gross: point.gross,
    platformRevenue: point.platformRevenue,
  }));

  return (
    <AppLayout
      title="Revenue"
      subTitle="What Faajii earns across tickets, wristbands, merchandise and reach"
    >
      <Stack gap="xl">
        {/* ------------------------------------------------------ Controls */}
        <Group justify="space-between" gap="md">
          <SegmentedControl
            value={isDerived ? "all" : range}
            onChange={(value) => setRange(value as FinanceRangeKey)}
            data={financeRanges}
            disabled={isDerived}
            size="sm"
          />
          <Group gap="sm">
            {unreconciledPayments != null && unreconciledPayments > 0 && (
              <Anchor component={Link} href="/payment-tracking" fz="sm">
                <Badge color="gray" variant="light">
                  {formatCount(unreconciledPayments)} unreconciled
                </Badge>
              </Anchor>
            )}
            <MarketSelect
              value={activeCurrency}
              onChange={setSelectedCurrency}
              currencies={markets.map((m) => m.currency)}
            />
          </Group>
        </Group>

        {isDerived && <EarningsNotice />}

        {isLoading ? (
          <SummaryCardSkeleton />
        ) : isError ? (
          <EmptyState
            compact
            title="Couldn't load revenue"
            description="The finance report failed to load. Try again in a moment."
          />
        ) : !market ? (
          <EmptyState
            compact
            title={`No paid sales in ${marketLabel(activeCurrency)} yet`}
            description="Revenue appears here once customers pay for tickets, wristbands or merchandise in this region."
          />
        ) : (
          <>
            <Stack gap={8}>
              <Text
                fw={600}
                fz={12}
                tt="uppercase"
                c="var(--fj-text-muted)"
                style={{ letterSpacing: "0.06em" }}
              >
                {market.currency} · {rangeLabel}
              </Text>
              <RevenueStatBar market={market} />
            </Stack>

            {market.ticketFee && (
              <Card radius="lg" p="lg">
                <Text fw={700} fz={16} mb={2}>
                  Ticket fee ({Math.round(market.ticketFee.rate * 100)}%)
                </Text>
                <Text fz={12} c="var(--fj-text-muted)" mb="md">
                  Where the fee was collected: on top of the ticket at
                  checkout, or out of the host&rsquo;s revenue.
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Stack gap={0}>
                    <Text fz="sm" c="var(--fj-text-secondary)">
                      Added at checkout (customer pays)
                    </Text>
                    <Text fw={800} fz={20}>
                      {formatMoney(
                        market.ticketFee.addedAtCheckout,
                        market.currency,
                      )}
                    </Text>
                  </Stack>
                  <Stack gap={0}>
                    <Text fz="sm" c="var(--fj-text-secondary)">
                      Deducted from hosts (creator pays)
                    </Text>
                    <Text fw={800} fz={20}>
                      {formatMoney(
                        market.ticketFee.deductedFromHosts,
                        market.currency,
                      )}
                    </Text>
                  </Stack>
                </SimpleGrid>
              </Card>
            )}

            <StreamBreakdown
              currency={market.currency}
              streams={market.streams}
              gross={market.gross}
              estimatedTicketFee={market.estimatedTicketFee}
            />

            {!isDerived && (
              <Card radius="lg">
                <Stack gap={2} mb="md">
                  <Text fw={700} fz={16}>
                    Revenue over time
                  </Text>
                  <Text fz={12} c="var(--fj-text-muted)">
                    Customer payments and Faajii revenue, per day
                  </Text>
                </Stack>
                {chartData.length === 0 ? (
                  <EmptyState
                    compact
                    title="No revenue in this period"
                    description="Try a longer range."
                  />
                ) : (
                  <LineChart
                    h={260}
                    data={chartData}
                    dataKey="date"
                    withDots={false}
                    curveType="monotone"
                    gridAxis="y"
                    strokeWidth={2.5}
                    withLegend
                    series={[
                      { name: "gross", label: "Customers paid", color: "gray.6" },
                      {
                        name: "platformRevenue",
                        label: "Faajii revenue",
                        color: "faajii.6",
                      },
                    ]}
                    valueFormatter={(value) =>
                      formatMoney(value, market.currency)
                    }
                  />
                )}
              </Card>
            )}

            {/* ------------------------------------------------ Top events */}
            <Card radius="lg" p="lg">
              <Group justify="space-between" mb="md">
                <Stack gap={2}>
                  <Text fw={700} fz={16}>
                    Top events by Faajii revenue
                  </Text>
                  <Text fz={12} c="var(--fj-text-muted)">
                    {market.currency} · {rangeLabel}
                  </Text>
                </Stack>
                <Anchor
                  component={Link}
                  href="/finance/events"
                  fz="sm"
                  c="var(--fj-text-secondary)"
                  underline="hover"
                >
                  All events
                </Anchor>
              </Group>

              {isDerived || topEventsUnavailable ? (
                <Text fz="sm" c="var(--fj-text-muted)">
                  Per-event earnings arrive with{" "}
                  <code>/admin/finance/events</code>. Until then, open an
                  event&rsquo;s <b>Money</b> tab to see what it has taken in.
                </Text>
              ) : topEvents.length === 0 ? (
                <Text fz="sm" c="var(--fj-text-muted)">
                  No event revenue in this period.
                </Text>
              ) : (
                <Stack gap={0}>
                  {topEvents.map((event) => (
                    <UnstyledButton
                      key={event.eventId}
                      component={Link}
                      href={`/finance/events/${event.eventId}`}
                      py="sm"
                      style={{
                        borderTop: "1px solid var(--fj-border-subtle)",
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap" gap="md">
                        <Stack gap={0} miw={0}>
                          <Text fw={600} fz="sm" truncate="end">
                            {event.name}
                          </Text>
                          <Text fz="xs" c="var(--fj-text-muted)">
                            {formatCount(event.ticketsSold)} tickets · fee paid
                            by {feeBearerShort(event.feeBearer).toLowerCase()}
                          </Text>
                        </Stack>
                        <Stack gap={0} align="flex-end">
                          <Text fw={700} fz="sm">
                            {formatMoney(event.platformRevenue, event.currency)}
                          </Text>
                          <Text fz="xs" c="var(--fj-text-muted)">
                            of {formatMoney(event.gross, event.currency)}
                          </Text>
                        </Stack>
                      </Group>
                    </UnstyledButton>
                  ))}
                </Stack>
              )}
            </Card>
          </>
        )}
      </Stack>
    </AppLayout>
  );
}
