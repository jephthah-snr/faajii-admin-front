"use client";

import {
  Badge,
  Card,
  Group,
  Modal,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppLayout } from "@/layout";
import {
  GetPublication,
  GetPublicationStatistics,
  GetPublications,
} from "@/services/api";
import {
  AdminPublication,
  PublicationChannel,
  PublicationStatus,
} from "@/services/api/publications/publication.types";
import { PpTable, SampleDataNotice, StatTile } from "@/components";
import {
  asList,
  formatCount,
  formatDateTime,
  formatMoney,
  formatStatusLabel,
  isEndpointUnavailable,
  publicationEmptyState,
  publicationFilters,
  reachAudienceLabel,
  reachDeliveryByAudience,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { IconNoUsers } from "@/config/icons";
import {
  mockPublicationDetail,
  mockPublicationStatistics,
  mockPublications,
} from "@/mocks";

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
  "Event",
  "Channel",
  "Reach",
  "Delivery",
  "Spend",
  "Status",
  "Created",
];

const recipientHeaders = ["Recipient", "Audience", "Status", "Sent"];

const recipientEmptyState = {
  title: "No recipients recorded",
  description:
    "Recipients are logged once the campaign is paid for and sending starts.",
  icon: IconNoUsers,
};

/**
 * Event reach — the paid push/email publications hosts buy to put an event in
 * front of people the platform already knows are interested (they abandoned a
 * checkout, saved it, or viewed it), topped up with a discovery fill. This is
 * the platform-wide view of what was bought, what landed, and what it earned.
 */
export default function EventReachPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<AdminPublication | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const channel = filters.channel as PublicationChannel | undefined;
  const status = filters.status as PublicationStatus | undefined;

  const campaignsQuery = useQuery({
    queryKey: ["admin-publications", page, debouncedSearch, channel, status],
    queryFn: () =>
      GetPublications({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        channel: channel || undefined,
        status: status || undefined,
      }),
    retry: retryUnlessUnavailable,
  });

  const statsQuery = useQuery({
    queryKey: ["admin-publication-statistics"],
    queryFn: GetPublicationStatistics,
    retry: retryUnlessUnavailable,
  });

  const detailQuery = useQuery({
    queryKey: ["admin-publication", selected?.reference],
    queryFn: () => GetPublication(selected!.reference),
    enabled: Boolean(selected) && opened,
    retry: retryUnlessUnavailable,
  });

  // Admin-scoped publication routes are not deployed yet — sample data below.
  const isSample = isEndpointUnavailable(campaignsQuery.error);
  const stats = isSample ? mockPublicationStatistics : statsQuery.data?.data;
  const campaigns = isSample
    ? mockPublications
    : asList(campaignsQuery.data?.data?.data);
  const totalItems = isSample
    ? mockPublications.length
    : campaignsQuery.data?.data?.pagination?.total || 0;
  const detail = isSample
    ? mockPublicationDetail(selected?.reference)
    : detailQuery.data?.data;
  const campaign = detail?.campaign ?? selected;

  const openCampaign = (row: AdminPublication) => {
    setSelected(row);
    open();
  };

  const rows = campaigns.map((row) => {
    const attempted = row.sentCount + row.failedCount;
    const delivery =
      row.deliverableReach > 0
        ? (row.sentCount / row.deliverableReach) * 100
        : 0;

    return (
      <Table.Tr
        key={row.reference}
        className="cursor-pointer"
        onClick={() => openCampaign(row)}
      >
        <Table.Td maw={280}>
          <Text fw={650} lineClamp={1}>
            {row.title}
          </Text>
          <Text c="var(--fj-text-muted)" fz="xs" ff="monospace">
            {row.reference}
          </Text>
        </Table.Td>
        <Table.Td maw={220}>
          <Text lineClamp={1}>{row.event?.name || "Event removed"}</Text>
          <Text c="var(--fj-text-muted)" fz="xs">
            {row.owner?.name || row.event?.eventId || "—"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light">{channelLabel[row.channel]}</Badge>
          {row.countryCode && (
            <Text c="var(--fj-text-muted)" fz="xs" mt={4}>
              {row.countryCode}
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Text fw={600}>{formatCount(row.deliverableReach)}</Text>
          {row.userRequestedReach > row.deliverableReach && (
            <Text c="var(--fj-text-muted)" fz="xs">
              of {formatCount(row.userRequestedReach)} asked
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Text fz="sm">
            {formatCount(row.sentCount)} sent
            {attempted === 0 ? " · not started" : ""}
          </Text>
          {row.failedCount > 0 && (
            <Text c="#FF8787" fz="xs">
              {formatCount(row.failedCount)} failed
            </Text>
          )}
          <Progress
            value={Math.min(delivery, 100)}
            color={row.failedCount > 0 ? "orange" : "teal"}
            size="xs"
            radius="xl"
            mt={6}
          />
        </Table.Td>
        <Table.Td fw={650}>
          {formatMoney(row.totalAmount, row.currency)}
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color={statusColor[row.status]}>
            {formatStatusLabel(row.status)}
          </Badge>
        </Table.Td>
        <Table.Td>{formatDateTime(row.created_at)}</Table.Td>
      </Table.Tr>
    );
  });

  const recipientRows = asList(detail?.recipients).map((recipient) => (
    <Table.Tr key={recipient.id}>
      <Table.Td>
        <Text fw={600}>{recipient.name || `User #${recipient.userId}`}</Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {recipient.email || "No email"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light">
          {reachAudienceLabel(recipient.selectionReason)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={
            recipient.status === "sent"
              ? "teal"
              : recipient.status === "failed"
                ? "red"
                : "gray"
          }
        >
          {formatStatusLabel(recipient.status)}
        </Badge>
        {recipient.failureReason && (
          <Text c="#FF8787" fz="xs" mt={4} lineClamp={1}>
            {recipient.failureReason}
          </Text>
        )}
      </Table.Td>
      <Table.Td>{formatDateTime(recipient.sentAt, "—")}</Table.Td>
    </Table.Tr>
  ));

  const deliveryByAudience = reachDeliveryByAudience(detail?.breakdown);

  return (
    <AppLayout
      title="Event Reach"
      subTitle="Paid push and email publications hosts buy to reach interested users"
    >
      <Stack gap="xl">
        {isSample && <SampleDataNotice integration="event-reach" />}

        {stats && (
          <SimpleGrid cols={{ base: 2, md: 4 }}>
            <StatTile
              label="Campaigns"
              value={formatCount(stats.totalCampaigns)}
              accent="#74C0FC"
              hint={`${formatCount(stats.pendingPayment)} awaiting payment`}
            />
            <StatTile
              label="People reached"
              value={formatCount(stats.delivered)}
              accent="#63E6BE"
            />
            <StatTile
              label="Failed sends"
              value={formatCount(stats.failed)}
              accent="#FF8787"
            />
            <StatTile
              label="Reach revenue"
              value={
                asList(stats.spend)
                  .map((total) => formatMoney(total.amount, total.currency))
                  .join(" · ") || "—"
              }
              accent="#F5C912"
            />
          </SimpleGrid>
        )}

        {stats && asList(stats.byChannel).length > 0 && (
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {asList(stats.byChannel).map((row) => (
              <Card key={row.channel} radius="lg" p="md">
                <Group justify="space-between">
                  <Text fz="xs" c="var(--fj-text-muted)">
                    {channelLabel[row.channel]} campaigns
                  </Text>
                  <Badge variant="light">
                    {formatCount(row.campaigns)} sent
                  </Badge>
                </Group>
                <Text fz={24} fw={800} mt={6}>
                  {formatCount(row.delivered)}
                </Text>
                <Text c="var(--fj-text-muted)" fz="xs" mt={4}>
                  people reached on this channel
                </Text>
              </Card>
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
          isLoading={campaignsQuery.isFetching}
          hasActions
          filters={publicationFilters}
          onFilterChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          query={search}
          handleQuery={(value) => {
            setSearch(value);
            setPage(1);
          }}
        searchPlaceholder="Search campaign, reference or event"
        emptyState={publicationEmptyState}
      />
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title={campaign?.title || "Campaign"}
        size="xl"
        centered
      >
        {campaign && (
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text fw={700} fz="lg">
                  {campaign.event?.name || "Event removed"}
                </Text>
                <Text c="var(--fj-text-muted)" fz="sm">
                  {campaign.owner?.name || "Unknown host"} ·{" "}
                  {campaign.owner?.email || "No email"}
                </Text>
                <Text c="var(--fj-text-muted)" fz="xs" ff="monospace">
                  {campaign.reference}
                </Text>
              </Stack>
              <Badge variant="light" color={statusColor[campaign.status]}>
                {formatStatusLabel(campaign.status)}
              </Badge>
            </Group>

            <Card radius="md" p="sm">
              <Text fz="xs" c="var(--fj-text-muted)">
                Message sent
              </Text>
              <Text fw={650} mt={4}>
                {campaign.title}
              </Text>
              <Text fz="sm">{campaign.message}</Text>
            </Card>

            <SimpleGrid cols={{ base: 2, md: 4 }}>
              <StatTile
                label="Requested reach"
                value={formatCount(campaign.userRequestedReach)}
                accent="#74C0FC"
              />
              <StatTile
                label="Deliverable reach"
                value={formatCount(campaign.deliverableReach)}
                accent="#D0BFFF"
              />
              <StatTile
                label="Delivered"
                value={formatCount(campaign.sentCount)}
                accent="#63E6BE"
                hint={
                  campaign.failedCount > 0
                    ? `${formatCount(campaign.failedCount)} failed`
                    : undefined
                }
              />
              <StatTile
                label="Amount paid"
                value={formatMoney(campaign.totalAmount, campaign.currency)}
                accent="#F5C912"
                hint={`${formatMoney(campaign.unitPrice, campaign.currency)} per person`}
              />
            </SimpleGrid>

            {campaign.failureReason && (
              <Card radius="md" p="sm" bg="rgba(255,135,135,0.08)">
                <Text fz="xs" c="var(--fj-text-muted)">
                  Failure reason
                </Text>
                <Text fz="sm" c="#FF8787">
                  {campaign.failureReason}
                </Text>
              </Card>
            )}

            {campaign.breakdown && (
              <Stack gap="sm">
                <Text fw={700}>Audience bought</Text>
                <SimpleGrid cols={{ base: 2, md: 4 }}>
                  {(
                    [
                      "abandoned_checkout",
                      "bookmark",
                      "interested_view",
                      "discovery_fill",
                    ] as const
                  ).map((reason) => (
                    <Card key={reason} radius="md" p="sm">
                      <Text fz="xs" c="var(--fj-text-muted)">
                        {reachAudienceLabel(reason)}
                      </Text>
                      <Text fw={700} fz={20}>
                        {formatCount(campaign.breakdown?.[reason])}
                      </Text>
                    </Card>
                  ))}
                </SimpleGrid>
              </Stack>
            )}

            {deliveryByAudience.length > 0 && (
              <Stack gap="sm">
                <Text fw={700}>Delivery by audience</Text>
                {deliveryByAudience.map((entry) => (
                  <Group key={entry.reason} justify="space-between">
                    <Text fz="sm">{reachAudienceLabel(entry.reason)}</Text>
                    <Text fz="sm" c="var(--fj-text-muted)">
                      {[
                        entry.sent > 0 && `${formatCount(entry.sent)} sent`,
                        entry.failed > 0 &&
                          `${formatCount(entry.failed)} failed`,
                        entry.pending > 0 &&
                          `${formatCount(entry.pending)} pending`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </Group>
                ))}
              </Stack>
            )}

            <Stack gap="sm">
              <Text fw={700}>Recipients</Text>
              <PpTable
                headers={recipientHeaders}
                rowData={recipientRows}
                showPagination={false}
                isLoading={detailQuery.isFetching && !isSample}
                emptyState={recipientEmptyState}
                skeletonRows={4}
              />
            </Stack>

            <Group gap="lg">
              <Text c="var(--fj-text-muted)" fz="xs">
                Paid {formatDateTime(campaign.paidAt, "not yet")}
              </Text>
              <Text c="var(--fj-text-muted)" fz="xs">
                Completed {formatDateTime(campaign.completedAt, "not yet")}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>
    </AppLayout>
  );
}
