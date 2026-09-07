"use client";

import { Avatar, Badge, Group, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { GetEventPromotions } from "@/services/api";
import type { PromotionStatus } from "@/services/api/promoters/promoter.types";
import PpTable from "../table";
import StatTile from "../stat-tile";
import SampleDataNotice from "../../elements/sample-data-notice";
import {
  asList,
  formatCommission,
  formatCount,
  formatCurrencyTotals,
  formatDateTime,
  formatStatusLabel,
  isEndpointUnavailable,
  promotionEmptyState,
  retryUnlessUnavailable,
} from "@/utils";
import { mockEventPromotions } from "@/mocks";

const statusColor: Record<PromotionStatus, string> = {
  pending: "gray",
  offered: "orange",
  active: "teal",
  declined: "red",
  cancelled: "red",
  expired: "dark",
};

const tableHeaders = [
  "Promoter",
  "Status",
  "Commission",
  "Code",
  "Tickets sold",
  "Generated",
  "Earned",
  "Applied",
];

/**
 * The admin twin of the host's Promoters screen: who applied to sell this
 * event, what commission they were offered, and what each one has produced.
 */
const Promoters = ({ eventId }: { eventId: string }) => {
  const { data, isFetching, error } = useQuery({
    queryKey: ["admin-event-promotions", eventId],
    queryFn: () => GetEventPromotions(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  // No admin promotions route yet — the tab previews with sample promoters.
  const isSample = isEndpointUnavailable(error);
  const promotions = isSample ? mockEventPromotions : asList(data?.data);
  const awaitingOffer = promotions.filter(
    (promotion) => promotion.status === "pending",
  ).length;
  const offered = promotions.filter(
    (promotion) => promotion.status === "offered",
  ).length;
  const live = promotions.filter(
    (promotion) => promotion.status === "active",
  ).length;
  const ticketsSold = promotions.reduce(
    (sum, promotion) => sum + (promotion.ticketsSold || 0),
    0,
  );

  /** Sums the per-promotion currency maps into one platform-wide total. */
  const totalBy = (key: "grossByCurrency" | "earnedByCurrency") =>
    promotions.reduce<Record<string, number>>((totals, promotion) => {
      Object.entries(promotion[key] || {}).forEach(([currency, amount]) => {
        totals[currency] = (totals[currency] || 0) + Number(amount || 0);
      });
      return totals;
    }, {});

  const rows = promotions.map((promotion) => {
    const commission = formatCommission(
      promotion.commissionType,
      promotion.commissionValue,
      promotion.currency,
    );

    return (
      <Table.Tr key={promotion.id}>
        <Table.Td>
          <Group gap={8}>
            <Avatar
              size="sm"
              src={promotion.promoter?.avatar}
              name={promotion.promoter?.name || "Promoter"}
            />
            <Stack gap={0}>
              <Text fz="sm" fw={650}>
                {promotion.promoter?.name || "Promoter request"}
              </Text>
              <Text c="var(--fj-text-muted)" fz="xs">
                {promotion.promoter
                  ? `User #${promotion.promoter.userId}`
                  : "Account removed"}
              </Text>
            </Stack>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color={statusColor[promotion.status]}>
            {formatStatusLabel(promotion.status)}
          </Badge>
        </Table.Td>
        <Table.Td>{commission || "Not offered yet"}</Table.Td>
        <Table.Td ff="monospace" fz="sm">
          {promotion.promoterCode || "—"}
        </Table.Td>
        <Table.Td>{formatCount(promotion.ticketsSold)}</Table.Td>
        <Table.Td fw={650}>
          {formatCurrencyTotals(promotion.grossByCurrency)}
        </Table.Td>
        <Table.Td>{formatCurrencyTotals(promotion.earnedByCurrency)}</Table.Td>
        <Table.Td>{formatDateTime(promotion.created_at)}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack gap="xl">
      {isSample && <SampleDataNotice integration="event-promoters" compact />}

      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <StatTile
          label="Awaiting an offer"
          value={formatCount(awaitingOffer)}
          accent="#F5C912"
          hint={`${formatCount(offered)} offered, not accepted`}
        />
        <StatTile
          label="Promoting now"
          value={formatCount(live)}
          accent="#63E6BE"
        />
        <StatTile
          label="Tickets sold"
          value={formatCount(ticketsSold)}
          accent="#74C0FC"
          hint={`${formatCurrencyTotals(totalBy("grossByCurrency"))} generated`}
        />
        <StatTile
          label="Commission earned"
          value={formatCurrencyTotals(totalBy("earnedByCurrency"))}
          accent="#D0BFFF"
        />
      </SimpleGrid>

      <PpTable
        headers={tableHeaders}
        rowData={rows}
        showPagination={false}
        isLoading={isFetching && !isSample}
        emptyState={promotionEmptyState}
      />
    </Stack>
  );
};

export default Promoters;
