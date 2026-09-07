"use client";

import {
  Badge,
  Button,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications as toast } from "@mantine/notifications";
import { useState } from "react";
import { AppLayout } from "@/layout";
import {
  CancelBroadcast,
  CreateBroadcast,
  GetBroadcasts,
  GetPushTokenStats,
  GetPushTokens,
} from "@/services/api";
import {
  BroadcastAudience,
  BroadcastStatus,
} from "@/services/api/notifications/notifications.types";
import { PpTable, SampleDataNotice, StatTile } from "@/components";
import {
  asList,
  formatCount,
  formatDateTime,
  formatStatusLabel,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { IconNotifications, IconUsers } from "@/config/icons";
import {
  mockBroadcasts,
  mockPushDevices,
  mockPushTokenStats,
} from "@/mocks";

const statusColor: Record<BroadcastStatus, string> = {
  draft: "gray",
  queued: "blue",
  sending: "yellow",
  sent: "teal",
  failed: "red",
};

const audienceOptions: { value: BroadcastAudience; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "ios", label: "iOS devices" },
  { value: "android", label: "Android devices" },
  { value: "event_hosts", label: "Event hosts" },
  { value: "event_attendees", label: "Event attendees" },
];

const deviceHeaders = [
  "Device owner",
  "Platform",
  "App version",
  "Status",
  "Last seen",
];

const broadcastHeaders = [
  "Message",
  "Audience",
  "Status",
  "Delivery",
  "Sent",
  "Created by",
  "",
];

const deviceEmptyState = {
  title: "No registered devices",
  description: "Devices will appear after users sign in to the mobile app.",
  icon: IconUsers,
};

const broadcastEmptyState = {
  title: "No broadcasts yet",
  description: "Send your first push notification to the Faajii app.",
  icon: IconNotifications,
};

/**
 * Push notifications. The app registers FCM tokens on sign-in; this is where an
 * admin sees who is reachable and sends a broadcast to them.
 */
export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [deepLink, setDeepLink] = useState("");
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);

  const broadcastsQuery = useQuery({
    queryKey: ["admin-broadcasts", page],
    queryFn: () => GetBroadcasts({ page, limit: rowsPerPage }),
    retry: retryUnlessUnavailable,
  });

  const deviceStatsQuery = useQuery({
    queryKey: ["admin-push-device-stats"],
    queryFn: GetPushTokenStats,
    retry: retryUnlessUnavailable,
  });
  const devicesQuery = useQuery({
    queryKey: ["admin-push-devices"],
    queryFn: () => GetPushTokens({ page: 1, limit: 20 }),
    retry: retryUnlessUnavailable,
  });

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setAudience("all");
    setDeepLink("");
    setScheduledFor(null);
  };

  const create = useMutation({
    mutationFn: () =>
      CreateBroadcast({
        title: title.trim(),
        message: message.trim(),
        audience,
        deepLink: deepLink.trim() || undefined,
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : undefined,
      }),
    onSuccess: () => {
      toast.show({
        color: "teal",
        message: scheduledFor ? "Broadcast scheduled" : "Broadcast queued",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-broadcasts"] });
      resetForm();
      close();
    },
    onError: (err) =>
      toast.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  const cancel = useMutation({
    mutationFn: (id: number) => CancelBroadcast(id),
    onSuccess: () => {
      toast.show({ color: "teal", message: "Broadcast cancelled" });
      queryClient.invalidateQueries({ queryKey: ["admin-broadcasts"] });
    },
    onError: (err) =>
      toast.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  // Neither half of this screen has a route yet, so both run on samples.
  const devicesAreSample = isEndpointUnavailable(deviceStatsQuery.error);
  const broadcastsAreSample = isEndpointUnavailable(broadcastsQuery.error);
  const deviceStats = devicesAreSample
    ? mockPushTokenStats
    : deviceStatsQuery.data?.data;
  const devices = devicesAreSample
    ? mockPushDevices
    : asList(devicesQuery.data?.data?.data);
  const broadcasts = broadcastsAreSample
    ? mockBroadcasts
    : asList(broadcastsQuery.data?.data?.data);
  const totalBroadcasts = broadcastsAreSample
    ? mockBroadcasts.length
    : broadcastsQuery.data?.data?.pagination?.total || 0;
  const canSend = title.trim().length > 0 && message.trim().length > 0;

  const deviceRows = devices.map((device) => (
    <Table.Tr key={device.id}>
      <Table.Td>
        <Text fw={650}>{device.userName || `User #${device.userId}`}</Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {device.userEmail || "No email"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light">{device.deviceType || "Unknown"}</Badge>
      </Table.Td>
      <Table.Td>{device.appVersion || "—"}</Table.Td>
      <Table.Td>
        <Badge color={device.isActive ? "teal" : "gray"}>
          {device.isActive ? "Active" : "Inactive"}
        </Badge>
      </Table.Td>
      <Table.Td>{formatDateTime(device.lastSeenAt, "Never")}</Table.Td>
    </Table.Tr>
  ));

  const broadcastRows = broadcasts.map((broadcast) => {
    const cancellable =
      broadcast.status === "draft" || broadcast.status === "queued";

    return (
      <Table.Tr key={broadcast.id}>
        <Table.Td maw={340}>
          <Text fw={650} lineClamp={1}>
            {broadcast.title}
          </Text>
          <Text c="var(--fj-text-muted)" fz="xs" lineClamp={2}>
            {broadcast.message}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light">{formatStatusLabel(broadcast.audience)}</Badge>
          {broadcast.eventName && (
            <Text c="var(--fj-text-muted)" fz="xs" mt={4} lineClamp={1}>
              {broadcast.eventName}
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color={statusColor[broadcast.status]}>
            {formatStatusLabel(broadcast.status)}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text fz="sm">
            {formatCount(broadcast.deliveredCount)} /{" "}
            {formatCount(broadcast.recipientCount)}
          </Text>
          {broadcast.failedCount > 0 && (
            <Text c="#FF8787" fz="xs">
              {formatCount(broadcast.failedCount)} failed
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          {formatDateTime(broadcast.sentAt || broadcast.scheduledFor, "Not sent")}
        </Table.Td>
        <Table.Td>{broadcast.createdByName || "—"}</Table.Td>
        <Table.Td>
          {cancellable && (
            <Button
              size="xs"
              variant="light"
              color="red"
              loading={cancel.isPending && cancel.variables === broadcast.id}
              onClick={() => cancel.mutate(broadcast.id)}
            >
              Cancel
            </Button>
          )}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout
      title="Notifications"
      subTitle="Push reach and broadcasts to the Faajii app"
      action={
        <Button onClick={open} disabled={broadcastsAreSample}>
          New broadcast
        </Button>
      }
    >
      <Stack gap="xl">
        {(devicesAreSample || broadcastsAreSample) && (
          <SampleDataNotice
            integration={
              devicesAreSample
                ? "notification-devices"
                : "notification-broadcasts"
            }
          />
        )}

        {deviceStats && (
          <SimpleGrid cols={{ base: 2, md: 5 }}>
            {[
              {
                label: "Registered devices",
                value: deviceStats.totalDevices,
                color: "#74C0FC",
              },
              {
                label: "Reachable now",
                value: deviceStats.activeDevices,
                color: "#63E6BE",
              },
              { label: "iOS", value: deviceStats.ios, color: "#D0BFFF" },
              {
                label: "Android",
                value: deviceStats.android,
                color: "#F5C912",
              },
              {
                label: "Stale (30d+)",
                value: deviceStats.staleDevices,
                color: "#FF8787",
              },
            ].map((metric) => (
              <StatTile key={metric.label} label={metric.label} value={formatCount(metric.value)} accent={metric.color} />
            ))}
          </SimpleGrid>
        )}

        <Stack gap="sm">
          <Text fw={700}>Registered devices</Text>
          <PpTable
            headers={deviceHeaders}
            rowData={deviceRows}
            showPagination={false}
            isLoading={devicesQuery.isFetching && !devicesAreSample}
            emptyState={deviceEmptyState}
          />
        </Stack>

        <Stack gap="sm">
          <Text fw={700}>Broadcasts</Text>
          <PpTable
            headers={broadcastHeaders}
            rowData={broadcastRows}
            totalItems={totalBroadcasts}
            activePage={page}
            setActivePage={setPage}
            rowsPerPage={rowsPerPage}
            isLoading={broadcastsQuery.isFetching && !broadcastsAreSample}
            emptyState={broadcastEmptyState}
          />
        </Stack>
      </Stack>

      <Modal opened={opened} onClose={close} title="New broadcast" centered>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Shown in bold on the notification"
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            maxLength={65}
          />
          <Textarea
            label="Message"
            placeholder="Keep it under two lines so it isn't truncated"
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
            minRows={3}
            autosize
            maxLength={180}
          />
          <Select
            label="Audience"
            data={audienceOptions}
            value={audience}
            onChange={(value) => setAudience(value as BroadcastAudience)}
          />
          <TextInput
            label="Deep link"
            description="Optional. Where the app opens when tapped."
            placeholder="faajii://events/123"
            value={deepLink}
            onChange={(event) => setDeepLink(event.currentTarget.value)}
          />
          <DateTimePicker
            label="Schedule for"
            description="Leave empty to send immediately."
            value={scheduledFor}
            onChange={(value) =>
              setScheduledFor(value ? new Date(value) : null)
            }
            minDate={new Date()}
            clearable
          />
          <Button
            disabled={!canSend}
            loading={create.isPending}
            onClick={() => create.mutate()}
          >
            {scheduledFor ? "Schedule broadcast" : "Send now"}
          </Button>
        </Stack>
      </Modal>
    </AppLayout>
  );
}
