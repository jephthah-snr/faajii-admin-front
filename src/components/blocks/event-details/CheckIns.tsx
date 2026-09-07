"use client";

import {
  Badge,
  Button,
  Card,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import {
  GetEventCheckInSummary,
  GetEventCheckIns,
  OverrideGuestCheckIn,
} from "@/services/api";
import PpTable from "../../blocks/table";
import StatTile from "../../blocks/stat-tile";
import SampleDataNotice from "../../elements/sample-data-notice";
import {
  asList,
  checkInFilters,
  formatDateTime,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { IconCalendarTick } from "@/config/icons";
import { mockCheckIns, mockCheckInSummary } from "@/mocks";

const tableHeaders = [
  "Guest",
  "Ticket",
  "Status",
  "Scanned",
  "Scanned by",
  "Override",
];

const checkInEmptyState = {
  title: "No check-in records",
  description: "Guests appear here once tickets are issued for this event.",
  icon: IconCalendarTick,
};

/**
 * Door control. The app records scans against
 * `POST /v1/event/:id/guests/check-in`; this is the admin's live view of that
 * plus a manual override for scans that failed at the gate.
 */
const CheckIns = ({ eventId }: { eventId: string }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const checkedIn = filters.checkedIn
    ? filters.checkedIn === "yes"
    : undefined;

  const listQuery = useQuery({
    queryKey: [
      "admin-event-check-ins",
      eventId,
      page,
      debouncedSearch,
      checkedIn,
    ],
    queryFn: () =>
      GetEventCheckIns(eventId, {
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        checkedIn,
      }),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  const summaryQuery = useQuery({
    queryKey: ["admin-event-check-in-summary", eventId],
    queryFn: () => GetEventCheckInSummary(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  const override = useMutation({
    mutationFn: ({ guestId, next }: { guestId: number; next: boolean }) =>
      OverrideGuestCheckIn(eventId, guestId, next),
    onSuccess: (_, variables) => {
      notifications.show({
        color: "teal",
        message: variables.next
          ? "Guest checked in"
          : "Check-in reversed",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-event-check-ins"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-event-check-in-summary", eventId],
      });
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  // Door control has no admin route yet — the tab previews on sample scans.
  const isSample = isEndpointUnavailable(listQuery.error);
  const summary = isSample ? mockCheckInSummary : summaryQuery.data?.data;
  const records = isSample
    ? mockCheckIns
    : asList(listQuery.data?.data?.data);
  const totalItems = isSample
    ? mockCheckIns.length
    : listQuery.data?.data?.pagination?.total || 0;

  const rows = records.map((record) => (
    <Table.Tr key={record.id}>
      <Table.Td>
        <Text fw={650}>{record.guestName}</Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {record.guestPhone || record.guestEmail || "No contact"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text ff="monospace" fz="sm">
          {record.ticketReference || "—"}
        </Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {record.ticketType || "No tier"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={record.checkedIn ? "teal" : "gray"}>
          {record.checkedIn ? "Checked in" : "Not arrived"}
        </Badge>
      </Table.Td>
      <Table.Td>{formatDateTime(record.checkedInAt, "—")}</Table.Td>
      <Table.Td>{record.checkedInBy || "—"}</Table.Td>
      <Table.Td>
        <Button
          size="xs"
          variant="light"
          color={record.checkedIn ? "red" : "teal"}
          loading={
            override.isPending &&
            override.variables?.guestId === record.guestId
          }
          onClick={() =>
            override.mutate({
              guestId: record.guestId,
              next: !record.checkedIn,
            })
          }
        >
          {record.checkedIn ? "Reverse" : "Check in"}
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="xl">
      {isSample && <SampleDataNotice integration="event-check-ins" compact />}

      <SimpleGrid cols={{ base: 2, md: 4 }}>
        {[
          {
            label: "Expected guests",
            value: summary?.totalGuests ?? 0,
            color: "#74C0FC",
          },
          {
            label: "Checked in",
            value: summary?.checkedIn ?? 0,
            color: "#63E6BE",
          },
          {
            label: "Not arrived",
            value: summary?.notCheckedIn ?? 0,
            color: "#F5C912",
          },
        ].map((metric) => (
          <StatTile key={metric.label} label={metric.label} value={metric.value.toLocaleString()} accent={metric.color} />
        ))}
        <Card radius="lg" bg="var(--fj-surface-elevated)" p="md">
          <Text fz="xs" c="var(--fj-text-muted)">
            Turnout
          </Text>
          <Text fz={26} fw={800} c="#D0BFFF" mt={4}>
            {(summary?.checkInRate ?? 0).toFixed(0)}%
          </Text>
          <Progress
            value={summary?.checkInRate ?? 0}
            color="violet"
            mt={8}
            radius="xl"
          />
        </Card>
      </SimpleGrid>

      {summary?.lastCheckInAt && (
        <Text c="var(--fj-text-muted)" fz="sm">
          Last scan {formatDateTime(summary.lastCheckInAt)}
        </Text>
      )}

      <PpTable
        headers={tableHeaders}
        rowData={rows}
        totalItems={totalItems}
        activePage={page}
        setActivePage={setPage}
        rowsPerPage={rowsPerPage}
        isLoading={listQuery.isFetching && !isSample}
        hasActions
        filters={checkInFilters}
        onFilterChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        query={search}
        handleQuery={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search guest, phone or ticket reference"
        emptyState={checkInEmptyState}
      />
    </Stack>
  );
};

export default CheckIns;
