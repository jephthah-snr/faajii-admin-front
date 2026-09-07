"use client";

import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import { GetFinanceSummary, GetWallets } from "@/services/api";
import { WalletScope } from "@/services/api/finance/finance.types";
import { PpTable, StatBar } from "@/components";
import {
  asList,
  formatCount,
  formatDateTime,
  formatMoney,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
  walletEmptyState,
  walletFilters,
} from "@/utils";
import { mockFinanceSummary, mockWallets } from "@/mocks";

const tableHeaders = [
  "Owner",
  "Scope",
  "Balance",
  "Funded",
  "Spent",
  "Status",
  "Last movement",
];

/**
 * Float across the platform: every user wallet and event purse in one ledger,
 * so finance can see where money is sitting before reconciling a day's takings.
 */
export default function WalletsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const scope = filters.scope as WalletScope | undefined;

  const walletsQuery = useQuery({
    queryKey: ["admin-wallets", page, debouncedSearch, scope],
    queryFn: () =>
      GetWallets({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        scope: scope || undefined,
      }),
    retry: retryUnlessUnavailable,
  });

  const summaryQuery = useQuery({
    queryKey: ["admin-finance-summary"],
    queryFn: GetFinanceSummary,
    retry: retryUnlessUnavailable,
  });

  // The endpoints are not deployed yet, so the screen runs on sample rows.
  const isSample = isEndpointUnavailable(walletsQuery.error);
  const summary = isSample
    ? mockFinanceSummary
    : summaryQuery.data?.data;
  const wallets = isSample
    ? mockWallets
    : asList(walletsQuery.data?.data?.data);
  const totalItems = isSample
    ? mockWallets.length
    : walletsQuery.data?.data?.pagination?.total || 0;

  const rows = wallets.map((wallet) => (
    <Table.Tr
      key={`${wallet.scope}-${wallet.id}`}
      className="cursor-pointer"
      onClick={() =>
        wallet.scope === "event" && wallet.eventId
          ? router.push(`/event-management/${wallet.eventId}`)
          : router.push(`/user-management/${wallet.userId}`)
      }
    >
      <Table.Td>
        <Text fw={650}>{wallet.ownerName || `User #${wallet.userId}`}</Text>
        {wallet.eventName && (
          <Text c="var(--fj-text-muted)" fz="xs" lineClamp={1}>
            {wallet.eventName}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={wallet.scope === "event" ? "grape" : "blue"}>
          {wallet.scope === "event" ? "Event purse" : "User"}
        </Badge>
      </Table.Td>
      <Table.Td fw={700}>
        {formatMoney(wallet.balance, wallet.currency)}
      </Table.Td>
      <Table.Td>{formatMoney(wallet.totalFunded, wallet.currency)}</Table.Td>
      <Table.Td>{formatMoney(wallet.totalSpent, wallet.currency)}</Table.Td>
      <Table.Td>
        <Badge variant="light" color={wallet.isActive ? "teal" : "red"}>
          {wallet.isActive ? "Active" : "Frozen"}
        </Badge>
      </Table.Td>
      <Table.Td>{formatDateTime(wallet.lastMovementAt, "Never")}</Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout
      title="Wallets"
      subTitle="User wallets and event purses across the platform"
    >
      <Stack gap="xl">
        {summary && (
          <Stack gap="md">
            <StatBar
              items={[
                {
                  label: "Funded today",
                  value: formatMoney(summary.fundingToday),
                },
                {
                  label: "Paid out today",
                  value: formatMoney(summary.payoutsToday),
                },
                {
                  label: "Pending settlements",
                  value: formatCount(summary.pendingSettlements),
                },
                {
                  label: "Failed transfers",
                  value: formatCount(summary.failedTransfers),
                },
              ]}
              minCellWidth={170}
            />

            <SimpleGrid cols={{ base: 1, md: 3 }}>
              {asList(summary.totals).map((total) => (
                <Card key={total.currency} radius="lg" p="md">
                  <Group justify="space-between">
                    <Text fz="xs" c="var(--fj-text-muted)">
                      Float held in {total.currency}
                    </Text>
                    <Badge variant="light">
                      {formatCount(total.walletCount)} wallets
                    </Badge>
                  </Group>
                  <Text fz={24} fw={800} mt={6}>
                    {formatMoney(total.totalBalance, total.currency)}
                  </Text>
                  <Text c="var(--fj-text-muted)" fz="xs" mt={4}>
                    {formatMoney(total.totalFunded, total.currency)} in ·{" "}
                    {formatMoney(total.totalSpent, total.currency)} out
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        )}

        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={page}
          setActivePage={setPage}
          rowsPerPage={rowsPerPage}
          isLoading={walletsQuery.isFetching}
          hasActions
          filters={walletFilters}
          onFilterChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          query={search}
          handleQuery={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search owner, event or wallet reference"
          emptyState={walletEmptyState}
        />
      </Stack>
    </AppLayout>
  );
}
