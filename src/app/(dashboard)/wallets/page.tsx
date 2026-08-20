"use client";

import {
  Badge,
  Button,
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
  formatCount,
  formatDateTime,
  formatMoney,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";

/**
 * Float across the platform: every user wallet and event purse in one ledger,
 * so finance can see where money is sitting before reconciling a day's takings.
 */
export default function WalletsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [scope, setScope] = useState<"all" | WalletScope>("all");

  const walletsQuery = useQuery({
    queryKey: ["admin-wallets", page, debouncedSearch, scope],
    queryFn: () =>
      GetWallets({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        scope: scope === "all" ? undefined : scope,
      }),
    retry: retryUnlessUnavailable,
  });

  const summaryQuery = useQuery({
    queryKey: ["admin-finance-summary"],
    queryFn: GetFinanceSummary,
    retry: retryUnlessUnavailable,
  });

  const unavailable = isEndpointUnavailable(walletsQuery.error);
  const summary = summaryQuery.data?.data;
  const wallets = asList(walletsQuery.data?.data?.data);
  const pagination = walletsQuery.data?.data?.pagination;

  return (
    <AppLayout
      title="Wallets"
      subTitle="User wallets and event purses across the platform"
    >
      {unavailable ? (
        <PendingBackend
          feature="Wallets"
          endpoints={[
            "GET /admin/wallets",
            "GET /admin/wallets/summary",
          ]}
        />
      ) : (
        <Stack gap="xl">
          {summary && (
            <Stack gap="md">
              <SimpleGrid cols={{ base: 2, md: 4 }}>
                {[
                  {
                    label: "Funded today",
                    value: summary.fundingToday,
                    color: "#63E6BE",
                  },
                  {
                    label: "Paid out today",
                    value: summary.payoutsToday,
                    color: "#F5C912",
                  },
                  {
                    label: "Pending settlements",
                    value: summary.pendingSettlements,
                    color: "#74C0FC",
                  },
                  {
                    label: "Failed transfers",
                    value: summary.failedTransfers,
                    color: "#FF8787",
                  },
                ].map((metric) => (
                  <StatTile key={metric.label} label={metric.label} value={metric.label.includes("today")
                        ? formatMoney(metric.value)
                        : formatCount(metric.value)} accent={metric.color} />
                ))}
              </SimpleGrid>

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

          <TableToolbar
            query={search}
            onQueryChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search owner, event or wallet reference"
            action={
              <FilterPill
                label="Scope"
                value={
                  scope === "all"
                    ? "All"
                    : scope === "user"
                      ? "User wallets"
                      : "Event purses"
                }
                items={["All", "User wallets", "Event purses"]}
                onChange={(value) => {
                  const next = String(value);
                  setScope(
                    next === "All"
                      ? "all"
                      : next === "User wallets"
                        ? "user"
                        : "event",
                  );
                  setPage(1);
                }}
              />
            }
          />

          <Card radius="lg" p={0}>
            {walletsQuery.isFetching ? (
              <TableSkeleton />
            ) : (
              <Table.ScrollContainer minWidth={960}>
                <Table verticalSpacing="md" horizontalSpacing="lg">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Owner</Table.Th>
                      <Table.Th>Scope</Table.Th>
                      <Table.Th>Balance</Table.Th>
                      <Table.Th>Funded</Table.Th>
                      <Table.Th>Spent</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Last movement</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {wallets.map((wallet) => (
                      <Table.Tr
                        key={`${wallet.scope}-${wallet.id}`}
                        className="cursor-pointer"
                        onClick={() =>
                          wallet.scope === "event" && wallet.eventId
                            ? router.push(
                                `/event-management/${wallet.eventId}`,
                              )
                            : router.push(`/user-management/${wallet.userId}`)
                        }
                      >
                        <Table.Td>
                          <Text fw={650}>
                            {wallet.ownerName || `User #${wallet.userId}`}
                          </Text>
                          {wallet.eventName && (
                            <Text c="var(--fj-text-muted)" fz="xs" lineClamp={1}>
                              {wallet.eventName}
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={wallet.scope === "event" ? "grape" : "blue"}
                          >
                            {wallet.scope === "event" ? "Event purse" : "User"}
                          </Badge>
                        </Table.Td>
                        <Table.Td fw={700}>
                          {formatMoney(wallet.balance, wallet.currency)}
                        </Table.Td>
                        <Table.Td>
                          {formatMoney(wallet.totalFunded, wallet.currency)}
                        </Table.Td>
                        <Table.Td>
                          {formatMoney(wallet.totalSpent, wallet.currency)}
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={wallet.isActive ? "teal" : "red"}
                          >
                            {wallet.isActive ? "Active" : "Frozen"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {formatDateTime(wallet.lastMovementAt, "Never")}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}

            {!walletsQuery.isFetching && wallets.length === 0 && (
              <EmptyState
                title="No wallets"
                description="Wallets appear here once users fund an account or open an event purse."
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
    </AppLayout>
  );
}
