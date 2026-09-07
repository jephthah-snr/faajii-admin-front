"use client";

import {
  Badge,
  Group,
  Progress,
  Select,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import { GetPublicationStatistics, GetPublications } from "@/services/api";
import {
  PublicationChannel,
  PublicationStatus,
} from "@/services/api/publications/publication.types";
import { PpTable, StatBar } from "@/components";
import {
  asList,
  defaultReachRegion,
  formatCount,
  formatDateTime,
  formatMoney,
  formatStatusLabel,
  isEndpointUnavailable,
  publicationEmptyState,
  publicationFilters,
  reachRegions,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { mockPublicationStatistics, mockPublications } from "@/mocks";

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

/**
 * Event reach — the paid push/email publications hosts buy to put an event in
 * front of people the platform already knows are interested (they abandoned a
 * checkout, saved it, or viewed it), topped up with a discovery fill. A row
 * opens the campaign's own page, where the audience and the recipient list get
 * a tab each.
 */
export default function EventReachPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<Record<string, string>>({});
  /** Revenue is read one market at a time — see `reachRegions`. */
  const [region, setRegion] = useState(defaultReachRegion);

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

  // Admin-scoped publication routes are not deployed yet — sample data below.
  const isSample = isEndpointUnavailable(campaignsQuery.error);
  const stats = isSample ? mockPublicationStatistics : statsQuery.data?.data;
  const campaigns = isSample
    ? mockPublications
    : asList(campaignsQuery.data?.data?.data);
  const totalItems = isSample
    ? mockPublications.length
    : campaignsQuery.data?.data?.pagination?.total || 0;

  const channelSplit = asList(stats?.byChannel)
    .map(
      (row) => `${formatCount(row.delivered)} on ${channelLabel[row.channel]}`,
    )
    .join(" · ");

  const activeRegion =
    reachRegions.find((entry) => entry.code === region) || reachRegions[0];
  const regionSpend = asList(stats?.spend).find(
    (total) => total.countryCode === region,
  );

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
        onClick={() => router.push(`/event-reach/${row.reference}`)}
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
        <Table.Td miw={150}>
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

  return (
    <AppLayout
      title="Event Reach"
      subTitle="Paid push and email publications hosts buy to reach interested users"
    >
      <Stack gap="xl">
        {stats && (
          <Stack gap="sm">
            <Group justify="flex-end" gap={8} align="center">
              <Text fz={12} c="var(--fj-text-muted)">
                Revenue region
              </Text>
              <Select
                size="xs"
                w={190}
                allowDeselect={false}
                aria-label="Revenue region"
                value={region}
                onChange={(value) => setRegion(value || defaultReachRegion)}
                data={reachRegions.map((entry) => ({
                  value: entry.code,
                  label: `${entry.label} (${entry.currency})`,
                }))}
              />
            </Group>

            <StatBar
              minCellWidth={175}
              items={[
                {
                  label: "Campaigns",
                  value: stats.totalCampaigns,
                  hint: `${formatCount(stats.pendingPayment)} awaiting payment`,
                },
                {
                  label: "People reached",
                  value: stats.delivered,
                  hint: channelSplit || undefined,
                },
                {
                  label: "Failed sends",
                  value: stats.failed,
                  hint: "Bad tokens and bounced addresses",
                },
                {
                  label: `Reach revenue · ${activeRegion.label}`,
                  value: regionSpend
                    ? formatMoney(regionSpend.amount, regionSpend.currency)
                    : formatMoney(0, activeRegion.currency),
                  hint: `${formatCount(
                    regionSpend?.campaigns,
                  )} campaigns in this market`,
                },
              ]}
            />
          </Stack>
        )}

        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={page}
          setActivePage={setPage}
          rowsPerPage={rowsPerPage}
          isLoading={campaignsQuery.isFetching && !isSample}
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
    </AppLayout>
  );
}
