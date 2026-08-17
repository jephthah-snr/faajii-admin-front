"use client";

import {
  Badge,
  Card,
  Flex,
  Group,
  SimpleGrid,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppLayout } from "@/layout";
import { GetPurchases, GetPurchaseStatistics } from "@/services/api";
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
                <Table.Th>Status</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {purchases.map((purchase) => (
                <Table.Tr key={purchase.reference}>
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
    </AppLayout>
  );
}
