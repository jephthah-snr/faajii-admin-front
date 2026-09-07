"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import {
  GetSupportStats,
  GetSupportTicket,
  GetSupportTickets,
  ReplyToSupportTicket,
  UpdateSupportTicket,
} from "@/services/api";
import {
  SupportPriority,
  SupportStatus,
} from "@/services/api/support/support.types";
import {
  PpTable,
  SampleDataNotice,
  StatTile,
  TableSkeleton,
} from "@/components";
import {
  asList,
  formatCount,
  formatDateTime,
  formatStatusLabel,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
  supportEmptyState,
  supportFilters,
} from "@/utils";
import {
  mockSupportStats,
  mockSupportTicketDetail,
  mockSupportTickets,
} from "@/mocks";

const statusColor: Record<SupportStatus, string> = {
  open: "blue",
  pending: "yellow",
  resolved: "teal",
  closed: "gray",
};

const priorityColor: Record<SupportPriority, string> = {
  low: "gray",
  normal: "blue",
  high: "orange",
  urgent: "red",
};

const tableHeaders = [
  "Ticket",
  "User",
  "Category",
  "Priority",
  "Status",
  "Assigned",
  "Last activity",
];

/**
 * Support desk. In the app "Contact support" is a set of outbound links; giving
 * it a queue here is what turns a complaint into something trackable.
 */
export default function SupportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  // The queue opens on unresolved tickets, so an untouched filter means "open".
  const status = (
    filters.status === "all" ? undefined : filters.status || "open"
  ) as SupportStatus | undefined;
  const priority = (filters.priority || undefined) as
    | SupportPriority
    | undefined;

  const ticketsQuery = useQuery({
    queryKey: ["admin-support-tickets", page, debouncedSearch, status, priority],
    queryFn: () =>
      GetSupportTickets({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        status,
        priority,
      }),
    retry: retryUnlessUnavailable,
  });

  const statsQuery = useQuery({
    queryKey: ["admin-support-stats"],
    queryFn: GetSupportStats,
    retry: retryUnlessUnavailable,
  });

  const detailQuery = useQuery({
    queryKey: ["admin-support-ticket", selectedId],
    queryFn: () => GetSupportTicket(selectedId!),
    enabled: Boolean(selectedId) && opened,
    retry: retryUnlessUnavailable,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    queryClient.invalidateQueries({ queryKey: ["admin-support-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-support-ticket"] });
  };

  const sendReply = useMutation({
    mutationFn: () => ReplyToSupportTicket(selectedId!, reply.trim()),
    onSuccess: () => {
      notifications.show({ color: "teal", message: "Reply sent" });
      setReply("");
      invalidate();
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  const updateTicket = useMutation({
    mutationFn: (payload: {
      status?: SupportStatus;
      priority?: SupportPriority;
    }) => UpdateSupportTicket(selectedId!, payload),
    onSuccess: () => {
      notifications.show({ color: "teal", message: "Ticket updated" });
      invalidate();
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  // The ticket model does not exist server-side yet, so this runs on samples.
  const isSample = isEndpointUnavailable(ticketsQuery.error);
  const stats = isSample ? mockSupportStats : statsQuery.data?.data;
  const tickets = isSample
    ? mockSupportTickets
    : asList(ticketsQuery.data?.data?.data);
  const totalItems = isSample
    ? mockSupportTickets.length
    : ticketsQuery.data?.data?.pagination?.total || 0;
  const detail = isSample
    ? mockSupportTicketDetail(selectedId)
    : detailQuery.data?.data;

  const openTicket = (id: number) => {
    setSelectedId(id);
    setReply("");
    open();
  };

  const rows = tickets.map((ticket) => (
    <Table.Tr
      key={ticket.id}
      className="cursor-pointer"
      onClick={() => openTicket(ticket.id)}
    >
      <Table.Td maw={320}>
        <Text fw={650} lineClamp={1}>
          {ticket.subject}
        </Text>
        <Text c="var(--fj-text-muted)" fz="xs" ff="monospace">
          {ticket.ref}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={8}>
          <Avatar
            size="sm"
            src={ticket.userAvatar}
            name={ticket.userName || "Guest"}
          />
          <Stack gap={0}>
            <Text fz="sm">{ticket.userName || "Guest"}</Text>
            <Text c="var(--fj-text-muted)" fz="xs">
              {formatStatusLabel(ticket.channel)}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" tt="capitalize">
          {ticket.category}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={priorityColor[ticket.priority]}>
          {ticket.priority}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={statusColor[ticket.status]}>
          {formatStatusLabel(ticket.status)}
        </Badge>
      </Table.Td>
      <Table.Td>
        {ticket.assignedToName || (
          <Text c="#FF8787" fz="sm">
            Unassigned
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        {formatDateTime(ticket.lastMessageAt || ticket.created_at)}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout
      title="Support"
      subTitle="Complaints and requests raised from the Faajii app"
    >
      <Stack gap="xl">
        {isSample && <SampleDataNotice integration="support" />}

        {stats && (
          <SimpleGrid cols={{ base: 2, md: 5 }}>
            {[
              { label: "Open", value: stats.open, color: "#74C0FC" },
              {
                label: "Awaiting user",
                value: stats.pending,
                color: "#F5C912",
              },
              {
                label: "Resolved today",
                value: stats.resolvedToday,
                color: "#63E6BE",
              },
              {
                label: "Unassigned",
                value: stats.unassigned,
                color: "#FF8787",
              },
              {
                label: "Avg. first reply",
                value: `${formatCount(stats.avgFirstResponseMinutes)}m`,
                color: "#D0BFFF",
              },
            ].map((metric) => (
              <StatTile key={metric.label} label={metric.label} value={typeof metric.value === "number"
                    ? formatCount(metric.value)
                    : metric.value} accent={metric.color} />
            ))}
          </SimpleGrid>
        )}

        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={page}
          setActivePage={setPage}
          rowsPerPage={rowsPerPage}
          isLoading={ticketsQuery.isFetching}
          hasActions
          filters={supportFilters}
          onFilterChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          query={search}
          handleQuery={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search subject, reference or user"
        emptyState={supportEmptyState}
      />
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title={detail?.subject || "Ticket"}
        size="lg"
        centered
      >
        {detailQuery.isFetching && !isSample ? (
          <TableSkeleton />
        ) : detail ? (
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap={8}>
                <Avatar
                  src={detail.userAvatar}
                  name={detail.userName || "Guest"}
                />
                <Stack gap={0}>
                  <Text fw={650}>{detail.userName || "Guest"}</Text>
                  <Text c="var(--fj-text-muted)" fz="sm">
                    {detail.userEmail || "No email"}
                  </Text>
                </Stack>
              </Group>
              <Text c="var(--fj-text-muted)" fz="xs" ff="monospace">
                {detail.ref}
              </Text>
            </Group>

            <Group gap="sm">
              {detail.userId && (
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => router.push(`/user-management/${detail.userId}`)}
                >
                  View user
                </Button>
              )}
              {detail.relatedEventId && (
                <Button
                  size="xs"
                  variant="light"
                  onClick={() =>
                    router.push(`/event-management/${detail.relatedEventId}`)
                  }
                >
                  View event
                </Button>
              )}
              {detail.relatedTransactionRef && (
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => router.push("/transactions")}
                >
                  {detail.relatedTransactionRef}
                </Button>
              )}
            </Group>

            <Stack gap="sm" mah={320} style={{ overflowY: "auto" }}>
              {detail.messages.map((entry) => (
                <Card
                  key={entry.id}
                  radius="lg"
                  p="sm"
                  bg={entry.author === "admin" ? "#1d2333" : "#171717"}
                >
                  <Group justify="space-between" mb={4}>
                    <Text fz="xs" fw={700}>
                      {entry.authorName ||
                        (entry.author === "admin" ? "Support" : "User")}
                    </Text>
                    <Text fz="xs" c="var(--fj-text-muted)">
                      {formatDateTime(entry.created_at)}
                    </Text>
                  </Group>
                  <Text fz="sm">{entry.body}</Text>
                </Card>
              ))}
              {detail.messages.length === 0 && (
                <Text c="var(--fj-text-muted)" fz="sm">
                  No messages on this ticket yet.
                </Text>
              )}
            </Stack>

            <Textarea
              label="Reply"
              placeholder="Write a response to the user"
              value={reply}
              onChange={(event) => setReply(event.currentTarget.value)}
              minRows={3}
              autosize
            />
            <Button
              disabled={!reply.trim()}
              loading={sendReply.isPending}
              onClick={() => sendReply.mutate()}
            >
              Send reply
            </Button>

            <Group grow>
              <Select
                label="Priority"
                data={["low", "normal", "high", "urgent"]}
                value={detail.priority}
                onChange={(value) =>
                  value &&
                  updateTicket.mutate({ priority: value as SupportPriority })
                }
              />
              <Select
                label="Status"
                data={["open", "pending", "resolved", "closed"]}
                value={detail.status}
                onChange={(value) =>
                  value && updateTicket.mutate({ status: value as SupportStatus })
                }
              />
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </AppLayout>
  );
}
