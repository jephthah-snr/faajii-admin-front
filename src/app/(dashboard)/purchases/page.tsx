"use client";

import {
  Badge,
  Card,
  Divider,
  Flex,
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
import { GetPurchase, GetPurchases, GetPurchaseStatistics } from "@/services/api";
import { PurchaseChannel } from "@/services/api/purchases/purchase.types";
import { FilterPill, TableToolbar } from "@/components";
import { capitalizeString } from "@/utils";

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
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [status, setStatus] = useState<string>();
  const [channel, setChannel] = useState<PurchaseChannel>();
  const [selectedReference, setSelectedReference] = useState<string>();

  const purchasesQuery = useQuery({
    queryKey: ["purchases", page, debouncedSearch, status, channel],
    queryFn: () =>
      GetPurchases({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        status,
        channel,
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

  const purchases = purchasesQuery.data?.data.data || [];
  const statistics = statisticsQuery.data?.data;
  const paidTotals =
    statistics?.totals.filter((total) => total.status === "paid") || [];

  return (
    <AppLayout
      title="Purchases"
      subTitle="Every ticket checkout from mobile, web, and external integrations."
    >
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="xl">
        <Card radius="lg">
          <Text c="var(--fj-text-muted)" fz="sm">
            Tickets issued
          </Text>
          <Text fw={700} fz={28}>
            {statistics?.totalTickets || 0}
          </Text>
        </Card>
        {paidTotals.map((total) => (
          <Card key={total.currency} radius="lg">
            <Text c="var(--fj-text-muted)" fz="sm">
              Paid volume · {total.currency}
            </Text>
            <Text fw={700} fz={28}>
              {money(total.amount, total.currency)}
            </Text>
            <Text c="var(--fj-text-muted)" fz="xs">
              {total.purchases} successful purchases
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <TableToolbar
        query={search}
        onQueryChange={setSearch}
        searchPlaceholder="Search reference, buyer, or event"
        action={
          <Flex gap={10} wrap="wrap">
            <FilterPill
              label="Status"
              value={status ? capitalizeString(status) : "All"}
              items={["All", "Paid", "Pending", "Failed", "Cancelled"]}
              onChange={(value) => {
                const next = String(value).toLowerCase();
                setStatus(next === "all" ? undefined : next);
              }}
            />
            <FilterPill
              label="Channel"
              value={channel ? capitalizeString(channel) : "All"}
              items={["All", "Mobile", "Web", "Integration"]}
              onChange={(value) => {
                const next = String(value).toLowerCase();
                setChannel(
                  next === "all" ? undefined : (next as PurchaseChannel),
                );
              }}
            />
          </Flex>
        }
      />

      <Card radius="lg" padding={0}>
        <Table.ScrollContainer minWidth={1000}>
          <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Reference</Table.Th>
                <Table.Th>Event</Table.Th>
                <Table.Th>Buyer</Table.Th>
                <Table.Th>Channel</Table.Th>
                <Table.Th>Tickets</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Market</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {purchases.map((purchase) => (
                <Table.Tr
                  key={purchase.reference}
                  onClick={() => setSelectedReference(purchase.reference)}
                  style={{ cursor: "pointer" }}
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
                  <Table.Td>
                    {money(purchase.amount, purchase.currency)}
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline">
                      {purchase.countryCode || "—"} · {purchase.currency}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColor(purchase.status)}>
                      {purchase.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                    }).format(new Date(purchase.createdAt))}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {!purchasesQuery.isLoading && purchases.length === 0 && (
          <Group justify="center" p="xl">
            <Text c="var(--fj-text-muted)">No ticket purchases match these filters.</Text>
          </Group>
        )}
      </Card>

      <Modal
        opened={Boolean(selectedReference)}
        onClose={() => setSelectedReference(undefined)}
        title="Purchase evidence"
        size="xl"
      >
        {purchaseDetailQuery.isLoading && <Group justify="center" p="xl"><Loader /></Group>}
        {purchaseDetailQuery.isError && <Text c="red">Could not load this purchase.</Text>}
        {purchaseDetailQuery.data?.data && (() => {
          const purchase = purchaseDetailQuery.data.data;
          return (
            <Stack gap="lg">
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                <Evidence label="Payment received" ok={Boolean(purchase.paymentEvidence?.received)} />
                <Evidence label="Tickets issued" ok={purchase.fulfillmentEvidence?.status === "issued"} />
                <Evidence label="Wallet credited" ok={purchase.walletCredit?.status === "success"} />
                <Evidence label="Market consistent" ok={Boolean(purchase.market?.consistent)} />
              </SimpleGrid>

              <Card withBorder>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Fact label="Checkout reference" value={purchase.reference} />
                  <Fact label="Provider reference" value={purchase.paymentProviderReference || "Not recorded"} />
                  <Fact label="Event" value={`${purchase.event.name} (${purchase.event.eventId})`} />
                  <Fact label="Buyer" value={`${purchase.buyer.name} · ${purchase.buyer.email || purchase.buyer.phone || "No contact"}`} />
                  <Fact label="Amount" value={money(purchase.amount, purchase.currency)} />
                  <Fact label="Market" value={`${purchase.market?.countryCode || purchase.countryCode || "Unknown"} · ${purchase.currency}`} />
                  <Fact label="Payment method" value={purchase.paymentMethod || "Not recorded"} />
                  <Fact label="Channel" value={purchase.channel} />
                </SimpleGrid>
              </Card>

              {(purchase.reconciliations?.length || 0) > 0 && (
                <Card withBorder bg="red.0">
                  <Text fw={700} c="red">Payment reconciliation required</Text>
                  {purchase.reconciliations?.map((item) => (
                    <Text key={item.id} fz="sm">
                      {item.kind}: expected {money(item.expectedAmount, item.currency)}, received {money(item.receivedAmount, item.currency)} · {item.status}
                    </Text>
                  ))}
                </Card>
              )}

              <Divider label={`Issued tickets (${purchase.fulfillmentEvidence?.tickets.length || 0})`} />
              {(purchase.fulfillmentEvidence?.tickets.length || 0) === 0 ? (
                <Text c="dimmed">No ticket was issued for this checkout.</Text>
              ) : (
                <Table.ScrollContainer minWidth={650}>
                  <Table>
                    <Table.Thead><Table.Tr><Table.Th>Ticket</Table.Th><Table.Th>Holder</Table.Th><Table.Th>Item</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
                    <Table.Tbody>{purchase.fulfillmentEvidence?.tickets.map((ticket) => (
                      <Table.Tr key={ticket.ticketRef}>
                        <Table.Td>{ticket.ticketRef}</Table.Td>
                        <Table.Td>{ticket.guestName}<Text fz="xs" c="dimmed">{ticket.guestEmail || ticket.guestPhone}</Text></Table.Td>
                        <Table.Td>{ticket.offerTitle || "Ticket"}</Table.Td>
                        <Table.Td><Badge variant="light">{ticket.status}</Badge></Table.Td>
                      </Table.Tr>
                    ))}</Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}

              <Divider label="Wallet credit" />
              {purchase.walletCredit ? (
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Fact label="Credit reference" value={purchase.walletCredit.reference} />
                  <Fact label="Credited amount" value={money(purchase.walletCredit.amount, purchase.walletCredit.currency)} />
                  <Fact label="Wallet market" value={`${purchase.walletCredit.walletCountryCode} · ${purchase.walletCredit.walletCurrency}`} />
                  <Fact label="Credit status" value={purchase.walletCredit.status} />
                </SimpleGrid>
              ) : <Text c="red">No wallet credit is linked to this checkout.</Text>}
            </Stack>
          );
        })()}
      </Modal>
    </AppLayout>
  );
}

function Evidence({ label, ok }: { label: string; ok: boolean }) {
  return <Card withBorder><Text fz="xs" c="dimmed">{label}</Text><Badge color={ok ? "teal" : "red"}>{ok ? "Yes" : "No"}</Badge></Card>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><Text fz="xs" c="dimmed">{label}</Text><Text fw={600} style={{ overflowWrap: "anywhere" }}>{value}</Text></div>;
}
