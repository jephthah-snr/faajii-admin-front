"use client";

import { Avatar, Badge, Group, Stack, Table, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import { GetPromoterStatistics, GetPromoters } from "@/services/api";
import { PromotionStatus } from "@/services/api/promoters/promoter.types";
import { PpTable, StatBar } from "@/components";
import {
  asList,
  formatCount,
  formatFcfa,
  formatDateTime,
  isEndpointUnavailable,
  promoterEmptyState,
  promoterFilters,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { mockPromoterStatistics, mockPromoters } from "@/mocks";

const tableHeaders = [
  "Promoter",
  "Profile",
  "Promotions",
  "Tickets sold",
  "Generated for hosts",
  "Commission earned",
  "Wallet",
  "Joined",
];

/**
 * Promoters sell tickets on commission through a tracked code and RSVP link
 * (`/v1/promoter/*` in the app): they apply to an event, the host answers with
 * a commission offer, and every ticket sold on their link credits their
 * promoter wallet. This is the platform-wide view; a row opens that promoter's
 * own page, where the promotions and the wallet ledger have room to breathe.
 */
export default function PromotersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const status = filters.status as "active" | "inactive" | undefined;
  const promotionStatus = filters.promotionStatus as
    | PromotionStatus
    | undefined;

  const promotersQuery = useQuery({
    queryKey: [
      "admin-promoters",
      page,
      debouncedSearch,
      status,
      promotionStatus,
    ],
    queryFn: () =>
      GetPromoters({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        status: status || undefined,
        promotionStatus: promotionStatus || undefined,
      }),
    retry: retryUnlessUnavailable,
  });

  const statsQuery = useQuery({
    queryKey: ["admin-promoter-statistics"],
    queryFn: GetPromoterStatistics,
    retry: retryUnlessUnavailable,
  });

  // Admin-scoped promoter routes are not deployed yet — sample data below.
  const isSample = isEndpointUnavailable(promotersQuery.error);
  const stats = isSample ? mockPromoterStatistics : statsQuery.data?.data;
  const promoters = isSample
    ? mockPromoters
    : asList(promotersQuery.data?.data?.data);
  const totalItems = isSample
    ? mockPromoters.length
    : promotersQuery.data?.data?.pagination?.total || 0;

  const rows = promoters.map((promoter) => (
    <Table.Tr
      key={promoter.id}
      className="cursor-pointer"
      onClick={() => router.push(`/promoters/${promoter.id}`)}
    >
      <Table.Td>
        <Group gap={8}>
          <Avatar size="sm" src={promoter.avatar} name={promoter.name} />
          <Stack gap={0}>
            <Text fz="sm" fw={650}>
              {promoter.name}
            </Text>
            <Text c="var(--fj-text-muted)" fz="xs">
              {promoter.email || promoter.phoneNumber || "No contact"}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={promoter.isActive ? "teal" : "gray"}>
          {promoter.isActive ? "Active" : "Off"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text fw={600}>{formatCount(promoter.activePromotions)} live</Text>
        {promoter.pendingRequests > 0 && (
          <Text c="var(--fj-text-muted)" fz="xs">
            {formatCount(promoter.pendingRequests)} awaiting a host
          </Text>
        )}
      </Table.Td>
      <Table.Td>{formatCount(promoter.ticketsSold)}</Table.Td>
      <Table.Td fw={650}>{formatFcfa(promoter.gross)}</Table.Td>
      <Table.Td>{formatFcfa(promoter.earned)}</Table.Td>
      <Table.Td>{formatFcfa(promoter.walletBalance)}</Table.Td>
      <Table.Td>{formatDateTime(promoter.created_at)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout
      title="Promoters"
      subTitle="Who is selling tickets on commission, and what they have produced"
    >
      <Stack gap="xl">
        {stats && (
          <StatBar
            minCellWidth={175}
            items={[
              {
                label: "Promoting now",
                value: stats.activePromoters,
                hint: `${formatCount(stats.totalPromoters)} profiles in total`,
              },
              {
                label: "Live promotions",
                value: stats.activePromotions,
                hint: `${formatCount(stats.pendingRequests)} awaiting a host`,
              },
              {
                label: "Tickets sold",
                value: stats.ticketsSold,
                hint: `${formatFcfa(stats.gross)} for hosts`,
              },
              {
                label: "Owed to promoters",
                value: formatFcfa(stats.unpaid),
                hint: `${formatFcfa(stats.commission)} earned to date`,
              },
            ]}
          />
        )}

        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={page}
          setActivePage={setPage}
          rowsPerPage={rowsPerPage}
          isLoading={promotersQuery.isFetching && !isSample}
          hasActions
          filters={promoterFilters}
          onFilterChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          query={search}
          handleQuery={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search promoter, email or promoter code"
          emptyState={promoterEmptyState}
        />
      </Stack>
    </AppLayout>
  );
}
