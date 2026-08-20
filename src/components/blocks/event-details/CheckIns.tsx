"use client";

import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
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
import EmptyState from "../../blocks/empty-state";
import StatTile from "../../blocks/stat-tile";
import PendingBackend from "../../elements/pending-backend";
import { TableSkeleton } from "../../elements/skeletons";
import {
  asList,
  formatDateTime,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";
import { IconSearch } from "@/config/icons";

type CheckInFilter = "all" | "in" | "out";

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
  const [filter, setFilter] = useState<CheckInFilter>("all");

  const checkedIn =
    filter === "all" ? undefined : filter === "in" ? true : false;

  const listQuery = useQuery({
    queryKey: ["admin-event-check-ins", eventId, page, debouncedSearch, filter],
    queryFn: () =>
      GetEventCheckIns(eventId, {
        page,
        limit: 50,
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

  if (isEndpointUnavailable(listQuery.error)) {
    return (
      <PendingBackend
        feature="Check-ins"
        endpoints={[
          "GET /admin/events/:id/check-ins",
          "GET /admin/events/:id/check-ins/summary",
          "PATCH /admin/events/:id/check-ins/:guestId",
        ]}
      />
    );
  }

  const summary = summaryQuery.data?.data;
  const records = asList(listQuery.data?.data?.data);
  const pagination = listQuery.data?.data?.pagination;

  return (
    <Stack gap="xl">
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

      <Group justify="space-between" wrap="wrap" gap="md">
        <TextInput
              leftSection={<IconSearch size={18} color="var(--fj-text-muted)" variant="Linear" />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
          placeholder="Search guest, phone or ticket reference"
          w={{ base: "100%", md: 360 }}
        />
        <SegmentedControl
          value={filter}
          onChange={(value) => {
            setFilter(value as CheckInFilter);
            setPage(1);
          }}
          data={[
            { label: "All", value: "all" },
            { label: "Checked in", value: "in" },
            { label: "Not arrived", value: "out" },
          ]}
        />
      </Group>

      <Card radius="lg" p={0}>
        {listQuery.isFetching ? (
          <TableSkeleton />
        ) : (
          <Table.ScrollContainer minWidth={880}>
            <Table verticalSpacing="md" horizontalSpacing="lg">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Guest</Table.Th>
                  <Table.Th>Ticket</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Scanned</Table.Th>
                  <Table.Th>Scanned by</Table.Th>
                  <Table.Th>Override</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {records.map((record) => (
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
                      <Badge
                        variant="light"
                        color={record.checkedIn ? "teal" : "gray"}
                      >
                        {record.checkedIn ? "Checked in" : "Not arrived"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {formatDateTime(record.checkedInAt, "—")}
                    </Table.Td>
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
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}

        {!listQuery.isFetching && records.length === 0 && (
          <EmptyState
            title="No check-in records"
            description="Guests appear here once tickets are issued for this event."
            mb={40}
          />
        )}
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <Group justify="center">
          <Button
            variant="light"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <Text>
            Page {page} of {pagination.totalPages}
          </Text>
          <Button
            variant="light"
            disabled={page === pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </Group>
      )}
    </Stack>
  );
};

export default CheckIns;
