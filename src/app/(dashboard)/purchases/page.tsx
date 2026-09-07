"use client";

import {
  Badge,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppLayout } from "@/layout";
import {
  GetPurchase,
  GetPurchases,
  GetPurchaseStatistics,
} from "@/services/api";
import { PurchaseChannel } from "@/services/api/purchases/purchase.types";
import { PpTable, StatBar } from "@/components";
import {
  asList,
  purchaseEmptyState,
  purchaseFilters,
  rowsPerPage,
} from "@/utils";

const tableHeaders = [
  "Reference",
  "Event",
  "Buyer",
  "Channel",
  "Tickets",
  "Amount",
  "Market",
  "Status",
  "Date",
];

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function statusColor(status: string) {
  if (status === "paid") return "teal";
  if (status === "pending") return "yellow";
  if (status === "failed") return "red";
  return "gray";
}

export default function PurchasesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedReference, setSelectedReference] = useState<string>();

  const status = filters.status;
  const channel = filters.channel as PurchaseChannel | undefined;

  const purchasesQuery = useQuery({
    queryKey: ["purchases", page, debouncedSearch, status, channel],
    queryFn: () =>
      GetPurchases({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        status: status || undefined,
        channel: channel || undefined,
      }),
  });
  const statisticsQuery = useQuery({
    queryKey: ["purchase-statistics"],
    queryFn: GetPurchaseStatistics,
  });
  const purchaseDetailQuery = useQuery({
    queryKey: ["purchase", selectedReference],
    queryFn: () => GetPurchase(selectedReference as string),
    enabled: Boolean(selectedReference),
  });

  const purchases = asList(purchasesQuery.data?.data?.data);
  const totalItems = purchasesQuery.data?.data?.pagination?.total || 0;
  const statistics = statisticsQuery.data?.data;
  const paidTotals =
    statistics?.totals.filter((total) => total.status === "paid") || [];

  const rows = purchases.map((purchase) => (
    <Table.Tr
      key={purchase.reference}
      onClick={() => setSelectedReference(purchase.reference)}
      className="cursor-pointer"
    >
      <Table.Td>
        <Text fw={600} fz="sm">
          {purchase.reference}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fw={600}>{purchase.event.name}</Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {purchase.event.eventId}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text>{purchase.buyer.name}</Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {purchase.buyer.email || purchase.buyer.phone || "Guest"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light">{purchase.channel}</Badge>
      </Table.Td>
      <Table.Td>{purchase.ticketCount}</Table.Td>
      <Table.Td>{money(purchase.amount, purchase.currency)}</Table.Td>
      <Table.Td>
        <Badge variant="outline">
          {purchase.countryCode || "—"} · {purchase.currency}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={statusColor(purchase.status)}>{purchase.status}</Badge>
      </Table.Td>
      <Table.Td>
        {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
          new Date(purchase.createdAt),
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout
      title="Purchases"
      subTitle="Every ticket checkout from mobile, web, and external integrations."
    >
      <StatBar
        mb="xl"
        minCellWidth={175}
        items={[
          {
            label: "Tickets issued",
            value: statistics?.totalTickets || 0,
          },
          ...paidTotals.map((total) => ({
            label: `Paid volume · ${total.currency}`,
            value: money(total.amount, total.currency),
            hint: `${total.purchases} successful purchases`,
          })),
        ]}
      />

      <PpTable
        headers={tableHeaders}
        rowData={rows}
        totalItems={totalItems}
        activePage={page}
        setActivePage={setPage}
        rowsPerPage={rowsPerPage}
        isLoading={purchasesQuery.isFetching}
        hasActions
        filters={purchaseFilters}
        onFilterChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        query={search}
        handleQuery={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search reference, buyer, or event"
        emptyState={purchaseEmptyState}
      />

      <Modal
        opened={Boolean(selectedReference)}
        onClose={() => setSelectedReference(undefined)}
        title="Purchase evidence"
        size="xl"
      >
        {purchaseDetailQuery.isLoading && (
          <Group justify="center" p="xl">
            <Loader />
          </Group>
        )}
        {purchaseDetailQuery.isError && (
          <Text c="red">Could not load this purchase.</Text>
        )}
        {purchaseDetailQuery.data?.data &&
          (() => {
            const purchase = purchaseDetailQuery.data.data;
            return (
              <Stack gap="lg">
                <Card withBorder>
                  <Text fz="xs" c="dimmed" mb="xs">
                    Checks
                  </Text>
                  <Group gap="sm">
                    <Evidence
                      label="Payment received"
                      ok={Boolean(purchase.paymentEvidence?.received)}
                    />
                    <Evidence
                      label="Tickets issued"
                      ok={purchase.fulfillmentEvidence?.status === "issued"}
                    />
                    <Evidence
                      label="Wallet credited"
                      ok={purchase.walletCredit?.status === "success"}
                    />
                    <Evidence
                      label="Market consistent"
                      ok={Boolean(purchase.market?.consistent)}
                    />
                  </Group>
                </Card>

                <Card withBorder>
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Fact
                      label="Checkout reference"
                      value={purchase.reference}
                    />
                    <Fact
                      label="Provider reference"
                      value={
                        purchase.paymentProviderReference || "Not recorded"
                      }
                    />
                    <Fact
                      label="Event"
                      value={`${purchase.event.name} (${purchase.event.eventId})`}
                    />
                    <Fact
                      label="Buyer"
                      value={`${purchase.buyer.name} · ${purchase.buyer.email || purchase.buyer.phone || "No contact"}`}
                    />
                    <Fact
                      label="Amount"
                      value={money(purchase.amount, purchase.currency)}
                    />
                    <Fact
                      label="Market"
                      value={`${purchase.market?.countryCode || purchase.countryCode || "Unknown"} · ${purchase.currency}`}
                    />
                    <Fact
                      label="Payment method"
                      value={purchase.paymentMethod || "Not recorded"}
                    />
                    <Fact label="Channel" value={purchase.channel} />
                  </SimpleGrid>
                </Card>

                {(purchase.reconciliations?.length || 0) > 0 && (
                  <Card withBorder bg="red.0">
                    <Text fw={700} c="red">
                      Payment reconciliation required
                    </Text>
                    {purchase.reconciliations?.map((item) => (
                      <Text key={item.id} fz="sm">
                        {item.kind}: expected{" "}
                        {money(item.expectedAmount, item.currency)}, received{" "}
                        {money(item.receivedAmount, item.currency)} ·{" "}
                        {item.status}
                      </Text>
                    ))}
                  </Card>
                )}

                <Divider
                  label={`Issued tickets (${purchase.fulfillmentEvidence?.tickets.length || 0})`}
                />
                {(purchase.fulfillmentEvidence?.tickets.length || 0) === 0 ? (
                  <Text c="dimmed">
                    No ticket was issued for this checkout.
                  </Text>
                ) : (
                  <Table.ScrollContainer minWidth={650}>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Ticket</Table.Th>
                          <Table.Th>Holder</Table.Th>
                          <Table.Th>Item</Table.Th>
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {purchase.fulfillmentEvidence?.tickets.map((ticket) => (
                          <Table.Tr key={ticket.ticketRef}>
                            <Table.Td>{ticket.ticketRef}</Table.Td>
                            <Table.Td>
                              {ticket.guestName}
                              <Text fz="xs" c="dimmed">
                                {ticket.guestEmail || ticket.guestPhone}
                              </Text>
                            </Table.Td>
                            <Table.Td>{ticket.offerTitle || "Ticket"}</Table.Td>
                            <Table.Td>
                              <Badge variant="light">{ticket.status}</Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                )}

                <Divider label="Wallet credit" />
                {purchase.walletCredit ? (
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Fact
                      label="Credit reference"
                      value={purchase.walletCredit.reference}
                    />
                    <Fact
                      label="Credited amount"
                      value={money(
                        purchase.walletCredit.amount,
                        purchase.walletCredit.currency,
                      )}
                    />
                    <Fact
                      label="Wallet market"
                      value={`${purchase.walletCredit.walletCountryCode} · ${purchase.walletCredit.walletCurrency}`}
                    />
                    <Fact
                      label="Credit status"
                      value={purchase.walletCredit.status}
                    />
                  </SimpleGrid>
                ) : (
                  <Text c="red">
                    No wallet credit is linked to this checkout.
                  </Text>
                )}
              </Stack>
            );
          })()}
      </Modal>
    </AppLayout>
  );
}

/**
 * One pass/fail check on a checkout. These read as a row of chips rather than
 * four cards: the answer is a single word, and four boxes made a yes/no look
 * like a metric.
 */
function Evidence({ label, ok }: { label: string; ok: boolean }) {
  return (
    <Badge
      size="lg"
      variant="light"
      color={ok ? "teal" : "red"}
      leftSection={ok ? "✓" : "✕"}
    >
      {label}
    </Badge>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text fz="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={600} style={{ overflowWrap: "anywhere" }}>
        {value}
      </Text>
    </div>
  );
}
