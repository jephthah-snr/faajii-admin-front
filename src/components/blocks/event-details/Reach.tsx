"use client";

import { Badge, Progress, Stack, Table, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { GetEventPublications, GetEventReachActivity } from "@/services/api";
import type {
  PublicationChannel,
  PublicationStatus,
} from "@/services/api/publications/publication.types";
import PpTable from "../table";
import StatBar from "../stat-bar";
import {
  asList,
  formatCount,
  formatDateTime,
  formatMoney,
  formatStatusLabel,
  isEndpointUnavailable,
  publicationEmptyState,
  retryUnlessUnavailable,
} from "@/utils";
import { mockEventPublications, mockEventReachActivity } from "@/mocks";

const statusColor: Record<PublicationStatus, string> = {
  pending_payment: "yellow",
  paid: "blue",
  sending: "grape",
  completed: "teal",
  failed: "red",
};

const channelLabel: Record<PublicationChannel, string> = {
  push: "Push",
  email: "Email",
};

const tableHeaders = [
  "Campaign",
  "Channel",
  "Reach",
  "Delivery",
  "Spend",
  "Status",
  "Created",
];

/**
 * Per-event reach: the interest the platform has recorded for this event — the
 * pool a campaign can draw on — and every publication the host has bought
 * against it.
 */
const Reach = ({ eventId }: { eventId: string }) => {
  const campaignsQuery = useQuery({
    queryKey: ["admin-event-publications", eventId],
    queryFn: () => GetEventPublications(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  const activityQuery = useQuery({
    queryKey: ["admin-event-reach-activity", eventId],
    queryFn: () => GetEventReachActivity(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  // No admin publication routes yet — the tab previews with sample campaigns.
  const isSample = isEndpointUnavailable(campaignsQuery.error);
  const activity = isSample
    ? mockEventReachActivity
    : activityQuery.data?.data;
  const campaigns = isSample
    ? mockEventPublications
    : asList(campaignsQuery.data?.data);

  const rows = campaigns.map((campaign) => {
    const delivery =
      campaign.deliverableReach > 0
        ? (campaign.sentCount / campaign.deliverableReach) * 100
        : 0;

    return (
      <Table.Tr key={campaign.reference}>
        <Table.Td maw={300}>
          <Text fw={650} lineClamp={1}>
            {campaign.title}
          </Text>
          <Text c="var(--fj-text-muted)" fz="xs" ff="monospace">
            {campaign.reference}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light">{channelLabel[campaign.channel]}</Badge>
        </Table.Td>
        <Table.Td>
          <Text fw={600}>{formatCount(campaign.deliverableReach)}</Text>
          {campaign.userRequestedReach > campaign.deliverableReach && (
            <Text c="var(--fj-text-muted)" fz="xs">
              of {formatCount(campaign.userRequestedReach)} asked
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Text fz="sm">{formatCount(campaign.sentCount)} sent</Text>
          {campaign.failedCount > 0 && (
            <Text c="#FF8787" fz="xs">
              {formatCount(campaign.failedCount)} failed
            </Text>
          )}
          <Progress
            value={Math.min(delivery, 100)}
            color={campaign.failedCount > 0 ? "orange" : "teal"}
            size="xs"
            radius="xl"
            mt={6}
          />
        </Table.Td>
        <Table.Td fw={650}>
          {formatMoney(campaign.totalAmount, campaign.currency)}
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color={statusColor[campaign.status]}>
            {formatStatusLabel(campaign.status)}
          </Badge>
        </Table.Td>
        <Table.Td>{formatDateTime(campaign.created_at)}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack gap="xl">
      <StatBar
        items={[
          { label: "Viewed the event", value: activity?.view ?? 0 },
          { label: "Saved it", value: activity?.bookmark ?? 0 },
          {
            label: "Almost paid",
            value: activity?.abandoned_checkout ?? 0,
            hint: "Started a checkout and dropped out",
          },
          {
            label: "Reachable audience",
            value: activity?.totalInterested ?? 0,
          },
        ]}
      />

      <Stack gap="sm">
        <Text fw={700}>Campaigns</Text>
        <PpTable
          headers={tableHeaders}
          rowData={rows}
          showPagination={false}
          isLoading={campaignsQuery.isFetching && !isSample}
          emptyState={publicationEmptyState}
        />
      </Stack>
    </Stack>
  );
};

export default Reach;
