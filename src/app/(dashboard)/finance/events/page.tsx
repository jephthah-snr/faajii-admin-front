"use client";

import { MarketSelect, MobileRow, PpTable } from "@/components";
import { AppLayout } from "@/layout";
import { GetFinanceEvents } from "@/services/api";
import { mockFinanceEvents } from "@/mocks";
import { Badge, SegmentedControl, Stack, Table, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import {
  FinanceRangeKey,
  asList,
  feeBearerShort,
  financeRanges,
  formatCount,
  formatDateTime,
  formatMoney,
  isEndpointUnavailable,
  resolveFinanceRange,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { IconRevenue } from "@/config/icons";

const tableHeaders = [
  "Event",
  "Host",
  "Fee paid by",
  "Tickets",
  "Customers paid",
  "Faajii revenue",
  "Host payout",
];

const emptyState = {
  title: "No event revenue yet",
  description: "Events appear here once customers pay for tickets or orders.",
  icon: IconRevenue,
};

/** Which events earned what — the per-event view of the platform's income. */
export default function FinanceEventsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [range, setRange] = useState<FinanceRangeKey>("all");
  const [currency, setCurrency] = useState("XOF");

  const eventsQuery = useQuery({
    queryKey: ["admin-finance-events", page, debouncedSearch, range, currency],
    queryFn: () =>
      GetFinanceEvents({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        currency,
        sort: "platformRevenue",
        ...resolveFinanceRange(range),
      }),
    retry: retryUnlessUnavailable,
  });

  // `/admin/finance/events` is not deployed yet, so the screen runs on samples.
  const isSample = isEndpointUnavailable(eventsQuery.error);
  const sampleRows = mockFinanceEvents.filter(
    (event) =>
      event.currency === currency &&
      (!debouncedSearch ||
        event.name.toLowerCase().includes(debouncedSearch.toLowerCase())),
  );
  const events = isSample
    ? sampleRows
    : asList(eventsQuery.data?.data?.data);
  const totalItems = isSample
    ? sampleRows.length
    : eventsQuery.data?.data?.pagination?.total || 0;

  const open = (eventId: number) => router.push(`/finance/events/${eventId}`);

  const rows = events.map((event) => (
    <Table.Tr
      key={event.eventId}
      className="cursor-pointer"
      onClick={() => open(event.eventId)}
    >
      <Table.Td>
        <Text fw={650}>{event.name}</Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {formatDateTime(event.startDate, "Date not set")}
        </Text>
      </Table.Td>
      <Table.Td>{event.hostName || "—"}</Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={event.feeBearer === "customer" ? "blue" : "grape"}
        >
          {feeBearerShort(event.feeBearer)}
        </Badge>
      </Table.Td>
      <Table.Td>{formatCount(event.ticketsSold)}</Table.Td>
      <Table.Td>{formatMoney(event.gross, event.currency)}</Table.Td>
      <Table.Td fw={700}>
        {formatMoney(event.platformRevenue, event.currency)}
      </Table.Td>
      <Table.Td>{formatMoney(event.hostPayout, event.currency)}</Table.Td>
    </Table.Tr>
  ));

  const mobileRows = events.map((event) => (
    <MobileRow
      key={event.eventId}
      onClick={() => open(event.eventId)}
      title={event.name}
      subtitle={`${formatCount(event.ticketsSold)} tickets · fee paid by ${feeBearerShort(event.feeBearer).toLowerCase()}`}
      caption={`Paid ${formatMoney(event.gross, event.currency)}`}
      value={formatMoney(event.platformRevenue, event.currency)}
    />
  ));

  return (
    <AppLayout
      title="Event revenue"
      subTitle="What each event took in, what Faajii kept, and what the host is owed"
      hasBackButton
    >
      <Stack gap="lg">
        <Stack gap="sm" align="flex-start">
          <SegmentedControl
            value={range}
            onChange={(value) => {
              setRange(value as FinanceRangeKey);
              setPage(1);
            }}
            data={financeRanges}
            size="sm"
          />
          <MarketSelect
            value={currency}
            onChange={(value) => {
              setCurrency(value);
              setPage(1);
            }}
          />
        </Stack>

        <PpTable
          headers={tableHeaders}
          rowData={rows}
          mobileRows={mobileRows}
          totalItems={totalItems}
          activePage={page}
          setActivePage={setPage}
          rowsPerPage={rowsPerPage}
          isLoading={eventsQuery.isFetching}
          hasActions
          query={search}
          handleQuery={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search event or host"
          emptyState={emptyState}
        />
      </Stack>
    </AppLayout>
  );
}
