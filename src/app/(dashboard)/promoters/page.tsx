"use client";

import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Drawer,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import {
  GetPromoter,
  GetPromoterStatistics,
  GetPromoters,
  SetPromoterActive,
} from "@/services/api";
import {
  AdminPromoter,
  PromotionStatus,
} from "@/services/api/promoters/promoter.types";
import { PpTable, SampleDataNotice, StatTile } from "@/components";
import {
  asList,
  formatCommission,
  formatCount,
  formatCurrencyTotals,
  formatDateTime,
  formatMoney,
  formatStatusLabel,
  getApiErrorMessage,
  isEndpointUnavailable,
  promoterEmptyState,
  promoterFilters,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { IconNoTransactions, IconPromoters } from "@/config/icons";
import {
  mockPromoterDetail,
  mockPromoterStatistics,
  mockPromoters,
} from "@/mocks";

/** One accent per stage, matching the app's promoter and owner screens. */
const promotionColor: Record<PromotionStatus, string> = {
  pending: "gray",
  offered: "orange",
  active: "teal",
  declined: "red",
  cancelled: "red",
  expired: "dark",
};

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

const promotionHeaders = [
  "Event",
  "Status",
  "Commission",
  "Code",
  "Tickets sold",
  "Generated",
  "Earned",
];

const ledgerHeaders = ["Reference", "Entry", "Amount", "Status", "Date"];

const promotionsEmptyState = {
  title: "No promotions yet",
  description: "Events this promoter has applied to will be listed here.",
  icon: IconPromoters,
};

const ledgerEmptyState = {
  title: "No wallet activity",
  description: "Commission credits and withdrawals will appear here.",
  icon: IconNoTransactions,
};

/**
 * Promoters sell tickets on commission through a tracked code and RSVP link
 * (`/v1/promoter/*` in the app): they apply to an event, the host answers with
 * a commission offer, and every ticket sold on their link credits their
 * promoter wallet. This is the platform-wide view of who is selling, what they
 * have produced, and what is still owed to them.
 */
export default function PromotersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<AdminPromoter | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

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

  const detailQuery = useQuery({
    queryKey: ["admin-promoter", selected?.id],
    queryFn: () => GetPromoter(selected!.id),
    enabled: Boolean(selected) && opened,
    retry: retryUnlessUnavailable,
  });

  const setActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      SetPromoterActive(id, isActive),
    onSuccess: (_, variables) => {
      notifications.show({
        color: "teal",
        message: variables.isActive
          ? "Promoter profile reactivated"
          : "Promoter profile deactivated",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-promoters"] });
      queryClient.invalidateQueries({ queryKey: ["admin-promoter"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-promoter-statistics"],
      });
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
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
  const detail = isSample
    ? mockPromoterDetail(selected?.id)
    : detailQuery.data?.data;

  const openPromoter = (promoter: AdminPromoter) => {
    setSelected(promoter);
    open();
  };

  const rows = promoters.map((promoter) => (
    <Table.Tr
      key={promoter.id}
      className="cursor-pointer"
      onClick={() => openPromoter(promoter)}
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
      <Table.Td fw={650}>
        {formatCurrencyTotals(promoter.grossByCurrency)}
      </Table.Td>
      <Table.Td>{formatCurrencyTotals(promoter.earnedByCurrency)}</Table.Td>
      <Table.Td>
        {formatCurrencyTotals(promoter.walletBalanceByCurrency, "—")}
      </Table.Td>
      <Table.Td>{formatDateTime(promoter.created_at)}</Table.Td>
    </Table.Tr>
  ));

  const promotionRows = asList(detail?.promotions).map((promotion) => {
    const commission = formatCommission(
      promotion.commissionType,
      promotion.commissionValue,
      promotion.currency,
    );

    return (
      <Table.Tr key={promotion.id}>
        <Table.Td maw={260}>
          <Text fw={650} lineClamp={1}>
            {promotion.event?.name || "Event removed"}
          </Text>
          <Text c="var(--fj-text-muted)" fz="xs">
            {promotion.event?.eventId || "—"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color={promotionColor[promotion.status]}>
            {formatStatusLabel(promotion.status)}
          </Badge>
        </Table.Td>
        <Table.Td>{commission || "Not offered yet"}</Table.Td>
        <Table.Td ff="monospace" fz="sm">
          {promotion.promoterCode || "—"}
        </Table.Td>
        <Table.Td>{formatCount(promotion.ticketsSold)}</Table.Td>
        <Table.Td>{formatCurrencyTotals(promotion.grossByCurrency)}</Table.Td>
        <Table.Td>{formatCurrencyTotals(promotion.earnedByCurrency)}</Table.Td>
      </Table.Tr>
    );
  });

  const ledgerRows = asList(detail?.walletTransactions).map((entry) => (
    <Table.Tr key={entry.id}>
      <Table.Td ff="monospace" fz="sm">
        {entry.reference}
      </Table.Td>
      <Table.Td maw={260}>
        <Badge variant="light" color={entry.type === "credit" ? "teal" : "orange"}>
          {entry.type === "credit" ? "Commission" : "Withdrawal"}
        </Badge>
        <Text c="var(--fj-text-muted)" fz="xs" mt={4} lineClamp={1}>
          {entry.narration || entry.eventName || "No narration"}
        </Text>
      </Table.Td>
      <Table.Td fw={650}>{formatMoney(entry.amount, entry.currency)}</Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={
            entry.status === "success"
              ? "teal"
              : entry.status === "pending"
                ? "yellow"
                : "red"
          }
        >
          {formatStatusLabel(entry.status)}
        </Badge>
      </Table.Td>
      <Table.Td>{formatDateTime(entry.created_at)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout
      title="Promoters"
      subTitle="Who is selling tickets on commission, and what they have produced"
    >
      <Stack gap="xl">
        {isSample && <SampleDataNotice integration="promoters" />}

        {stats && (
          <SimpleGrid cols={{ base: 2, md: 5 }}>
            {[
              {
                label: "Promoters",
                value: formatCount(stats.totalPromoters),
                color: "#74C0FC",
              },
              {
                label: "Profiles on",
                value: formatCount(stats.activePromoters),
                color: "#63E6BE",
              },
              {
                label: "Live promotions",
                value: formatCount(stats.activePromotions),
                color: "#D0BFFF",
                hint: `${formatCount(stats.pendingRequests)} awaiting a host`,
              },
              {
                label: "Tickets sold",
                value: formatCount(stats.ticketsSold),
                color: "#F5C912",
                hint: `${formatCurrencyTotals(stats.grossByCurrency)} for hosts`,
              },
              {
                label: "Owed to promoters",
                value: formatCurrencyTotals(stats.unpaidByCurrency, "—"),
                color: "#FF8787",
                hint: `${formatCurrencyTotals(stats.commissionByCurrency)} earned`,
              },
            ].map((metric) => (
              <StatTile
                key={metric.label}
                label={metric.label}
                value={metric.value}
                accent={metric.color}
                hint={metric.hint}
              />
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
          isLoading={promotersQuery.isFetching}
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

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xl"
        title={selected?.name || "Promoter"}
      >
        {selected && (
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Group gap={12}>
                <Avatar size="lg" src={selected.avatar} name={selected.name} />
                <Stack gap={2}>
                  <Text fw={700} fz="lg">
                    {selected.name}
                  </Text>
                  <Anchor
                    fz="sm"
                    onClick={() =>
                      router.push(`/user-management/${selected.userId}`)
                    }
                  >
                    View user account
                  </Anchor>
                  <Text c="var(--fj-text-muted)" fz="sm">
                    {selected.email || "No email"} ·{" "}
                    {selected.phoneNumber || "No phone"}
                  </Text>
                </Stack>
              </Group>
              <Badge
                variant="light"
                color={(detail ?? selected).isActive ? "teal" : "gray"}
              >
                {(detail ?? selected).isActive
                  ? "Profile active"
                  : "Profile off"}
              </Badge>
            </Group>

            {detail?.bio && <Text fz="sm">{detail.bio}</Text>}

            <Group gap="sm">
              {[
                { label: "Instagram", handle: detail?.instagramHandle },
                { label: "TikTok", handle: detail?.tiktokHandle },
                { label: "X", handle: detail?.xHandle },
                { label: "Website", handle: detail?.website },
              ]
                .filter((social) => Boolean(social.handle))
                .map((social) => (
                  <Badge key={social.label} variant="light">
                    {social.label}: {social.handle}
                  </Badge>
                ))}
            </Group>

            <SimpleGrid cols={{ base: 2, md: 4 }}>
              <StatTile
                label="Tickets sold"
                value={formatCount((detail ?? selected).ticketsSold)}
                accent="#F5C912"
              />
              <StatTile
                label="Generated for hosts"
                value={formatCurrencyTotals(
                  (detail ?? selected).grossByCurrency,
                )}
                accent="#63E6BE"
              />
              <StatTile
                label="Commission earned"
                value={formatCurrencyTotals(
                  (detail ?? selected).earnedByCurrency,
                )}
                accent="#D0BFFF"
              />
              <StatTile
                label="Wallet balance"
                value={formatCurrencyTotals(
                  detail
                    ? Object.fromEntries(
                        asList(detail.wallets).map((wallet) => [
                          wallet.currency,
                          wallet.balance,
                        ]),
                      )
                    : selected.walletBalanceByCurrency,
                  "—",
                )}
                accent="#74C0FC"
              />
            </SimpleGrid>

            <Stack gap="sm">
              <Text fw={700}>Promotions</Text>
              <PpTable
                headers={promotionHeaders}
                rowData={promotionRows}
                showPagination={false}
                isLoading={detailQuery.isFetching && !isSample}
                emptyState={promotionsEmptyState}
                skeletonRows={4}
              />
            </Stack>

            <Stack gap="sm">
              <Text fw={700}>Promoter wallet</Text>
              <PpTable
                headers={ledgerHeaders}
                rowData={ledgerRows}
                showPagination={false}
                isLoading={detailQuery.isFetching && !isSample}
                emptyState={ledgerEmptyState}
                skeletonRows={4}
              />
            </Stack>

            <Button
              color={(detail ?? selected).isActive ? "red" : "teal"}
              variant={(detail ?? selected).isActive ? "light" : "filled"}
              loading={setActive.isPending}
              onClick={() =>
                setActive.mutate({
                  id: selected.id,
                  isActive: !(detail ?? selected).isActive,
                })
              }
            >
              {(detail ?? selected).isActive
                ? "Deactivate promoter profile"
                : "Reactivate promoter profile"}
            </Button>
            <Text c="var(--fj-text-muted)" fz="xs">
              Deactivating stops new requests and offers. Promotions already
              running keep their tracked links, and commission already earned
              stays payable.
            </Text>
          </Stack>
        )}
      </Drawer>
    </AppLayout>
  );
}
