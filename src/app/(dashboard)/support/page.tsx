"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Flex,
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
  EmptyState,
  FilterPill,
  PendingBackend,
  StatTile,
  TableSkeleton,
  TableToolbar,
} from "@/components";
import {
  asList,
  capitalizeString,
  formatCount,
  formatDateTime,
  formatStatusLabel,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";

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
  const [status, setStatus] = useState<SupportStatus | undefined>("open");
  const [priority, setPriority] = useState<SupportPriority | undefined>();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

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

  const stats = statsQuery.data?.data;
  const tickets = asList(ticketsQuery.data?.data?.data);
  const pagination = ticketsQuery.data?.data?.pagination;
  const detail = detailQuery.data?.data;

  const openTicket = (id: number) => {
    setSelectedId(id);
    setReply("");
    open();
  };

  return (
    <AppLayout
      title="Support"
      subTitle="Complaints and requests raised from the Faajii app"
    >
      {isEndpointUnavailable(ticketsQuery.error) ? (
        <PendingBackend
          feature="Support desk"
          endpoints={[
            "GET /admin/support/tickets",
            "GET /admin/support/tickets/:id",
            "POST /admin/support/tickets/:id/messages",
            "PATCH /admin/support/tickets/:id",
            "GET /admin/support/statistics",
          ]}
        />
      ) : (
        <Stack gap="xl">
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

          <TableToolbar
            query={search}
            onQueryChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search subject, reference or user"
            action={
              <Flex gap={10} wrap="wrap">
                <FilterPill
                  label="Status"
                  value={status ? capitalizeString(status) : "All"}
                  items={["All", "Open", "Pending", "Resolved", "Closed"]}
                  onChange={(value) => {
                    const next = String(value).toLowerCase();
                    setStatus(
                      next === "all" ? undefined : (next as SupportStatus),
                    );
                    setPage(1);
                  }}
                />
                <FilterPill
                  label="Priority"
                  value={priority ? capitalizeString(priority) : "All"}
                  items={["All", "Urgent", "High", "Normal", "Low"]}
                  onChange={(value) => {
                    const next = String(value).toLowerCase();
                    setPriority(
                      next === "all" ? undefined : (next as SupportPriority),
                    );
                    setPage(1);
                  }}
                />
              </Flex>
            }
          />

          <Card radius="lg" p={0}>
            {ticketsQuery.isFetching ? (
              <TableSkeleton />
            ) : (
              <Table.ScrollContainer minWidth={1000}>
                <Table verticalSpacing="md" horizontalSpacing="lg">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Ticket</Table.Th>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Assigned</Table.Th>
                      <Table.Th>Last activity</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {tickets.map((ticket) => (
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
                              <Text fz="sm">
                                {ticket.userName || "Guest"}
                              </Text>
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
                          <Badge
                            variant="light"
                            color={priorityColor[ticket.priority]}
                          >
                            {ticket.priority}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={statusColor[ticket.status]}
                          >
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
                          {formatDateTime(
                            ticket.lastMessageAt || ticket.created_at,
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}

            {!ticketsQuery.isFetching && tickets.length === 0 && (
              <EmptyState
                title="Nothing in the queue"
                description="Support requests from the app will land here."
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
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={detail?.subject || "Ticket"}
        size="lg"
        centered
      >
        {detailQuery.isFetching ? (
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
