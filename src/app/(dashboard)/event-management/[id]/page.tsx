"use client";

import {
  Avatar,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AppLayout } from "@/layout";
import {
  GetAdminEventGuests,
  GetAdminEventTickets,
  GetAdminEventPlanners,
  GetAdminEventTransactions,
  GetAdminEventVendors,
  GetAdminEventPartyStore,
  GetEventDetails,
} from "@/services/api";
import { EventDetails } from "@/services/api/event/event.types";
import { EventOverview, EventStore } from "@/components";
import { useMemo, useState } from "react";

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount || 0);
}

function ComingSoon({ title }: { title: string }) {
  return (
    <Card withBorder radius="xl" p={60}>
      <Stack align="center" gap="md">
        <ThemeIcon size={64} radius="xl" variant="light">
          ✦
        </ThemeIcon>
        <Text fw={700} fz={24}>
          {title} is coming soon
        </Text>
        <Text c="dimmed" ta="center" maw={480}>
          This section will appear when its event-management workflow is ready
          in the Faajii backend.
        </Text>
      </Stack>
    </Card>
  );
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [partyStoreFilter, setPartyStoreFilter] = useState("All");
  const [partyStoreSearch, setPartyStoreSearch] = useState("");

  const overviewQuery = useQuery({
    queryKey: ["admin-event-overview", id],
    queryFn: () => GetEventDetails(id, "event"),
    enabled: Boolean(id),
  });
  const guestsQuery = useQuery({
    queryKey: ["admin-event-guests", id],
    queryFn: () => GetAdminEventGuests(id),
    enabled: Boolean(id),
  });
  const ticketsQuery = useQuery({
    queryKey: ["admin-event-tickets", id],
    queryFn: () => GetAdminEventTickets(id),
    enabled: Boolean(id),
  });
  const transactionsQuery = useQuery({
    queryKey: ["admin-event-transactions", id],
    queryFn: () => GetAdminEventTransactions(id),
    enabled: Boolean(id),
  });
  const plannersQuery = useQuery({
    queryKey: ["admin-event-planners", id],
    queryFn: () => GetAdminEventPlanners(id),
    enabled: Boolean(id),
  });
  const vendorsQuery = useQuery({
    queryKey: ["admin-event-vendors", id],
    queryFn: () => GetAdminEventVendors(id),
    enabled: Boolean(id),
  });
  const partyStoreQuery = useQuery({
    queryKey: ["admin-event-party-store", id],
    queryFn: () => GetAdminEventPartyStore(id),
    enabled: Boolean(id),
  });

  const event = overviewQuery.data?.data as EventDetails | undefined;
  const guests = guestsQuery.data?.data || [];
  const ticketTracking = ticketsQuery.data?.data;
  const tickets = useMemo(
    () => ticketTracking?.tickets || [],
    [ticketTracking?.tickets],
  );
  const ticketsByGuest = useMemo(() => {
    const grouped = new Map<
      number,
      { count: number; tiers: Set<string>; statuses: Set<string> }
    >();
    for (const ticket of tickets) {
      const current = grouped.get(ticket.guest.id) || {
        count: 0,
        tiers: new Set<string>(),
        statuses: new Set<string>(),
      };
      current.count += 1;
      current.tiers.add(ticket.ticket.name);
      current.statuses.add(ticket.status);
      grouped.set(ticket.guest.id, current);
    }
    return grouped;
  }, [tickets]);
  const transactions = transactionsQuery.data?.data || [];
  const planners = plannersQuery.data?.data || [];
  const vendors = vendorsQuery.data?.data || [];
  const partyStoreItems = useMemo(
    () => partyStoreQuery.data?.data || [],
    [partyStoreQuery.data?.data],
  );
  const filteredPartyStoreItems = useMemo(() => {
    const kindByFilter: Record<string, string> = {
      Tickets: "ticket",
      Merchandise: "merch",
      Gifts: "gift",
      Products: "product",
      Services: "service",
    };
    const selectedKind = kindByFilter[partyStoreFilter];
    const search = partyStoreSearch.trim().toLowerCase();

    return partyStoreItems.filter((item) => {
      const matchesKind = !selectedKind || item.category === selectedKind;
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search);
      return matchesKind && matchesSearch;
    });
  }, [partyStoreFilter, partyStoreItems, partyStoreSearch]);

  return (
    <AppLayout
      title="Event details"
      subTitle={event?.name || "Loading event"}
      hasBackButton
    >
      <Tabs defaultValue="overview">
        <Tabs.List mb="xl">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="guests">Guests ({guests.length})</Tabs.Tab>
          <Tabs.Tab value="planners">Planners ({planners.length})</Tabs.Tab>
          <Tabs.Tab value="vendors">Vendors ({vendors.length})</Tabs.Tab>
          <Tabs.Tab value="transactions">
            Transactions ({transactions.length})
          </Tabs.Tab>
          <Tabs.Tab value="party-store">
            Party Store ({partyStoreItems.length})
          </Tabs.Tab>
          <Tabs.Tab value="wishlist">Wishlist</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <EventOverview
            eventData={event!}
            isFetching={overviewQuery.isFetching}
          />
        </Tabs.Panel>

        <Tabs.Panel value="guests">
          <SimpleGrid cols={{ base: 2, md: 5 }} mb="lg">
            {[
              { label: "Tickets issued", value: ticketTracking?.summary.issued || 0, color: "#F5C912" },
              { label: "Active", value: ticketTracking?.summary.active || 0, color: "#74C0FC" },
              { label: "Checked in", value: ticketTracking?.summary.used || 0, color: "#63E6BE" },
              { label: "Cancelled", value: ticketTracking?.summary.cancelled || 0, color: "#FF8787" },
              { label: "Ticket holders", value: ticketTracking?.summary.uniqueHolders || 0, color: "#D0BFFF" },
            ].map((metric) => (
              <Card key={metric.label} withBorder radius="lg" bg="#171717" p="md">
                <Text fz="xs" c="dimmed">{metric.label}</Text>
                <Text fz={26} fw={800} c={metric.color} mt={4}>
                  {metric.value.toLocaleString()}
                </Text>
              </Card>
            ))}
          </SimpleGrid>

          <Text fw={700} fz="lg" mb="sm">Guest directory</Text>
          <Card withBorder radius="xl" p={0}>
            <Table.ScrollContainer minWidth={800}>
              <Table verticalSpacing="md" horizontalSpacing="lg">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Guest</Table.Th>
                    <Table.Th>Contact</Table.Th>
                    <Table.Th>Group</Table.Th>
                    <Table.Th>Tickets</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Added</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {guests.map((guest) => (
                    <Table.Tr key={guest.id}>
                      <Table.Td fw={600}>{guest.name}</Table.Td>
                      <Table.Td>
                        <Text>{guest.email || "No email"}</Text>
                        <Text c="dimmed" fz="xs">
                          {guest.phone || "No phone"}
                        </Text>
                      </Table.Td>
                      <Table.Td>{guest.group || "General"}</Table.Td>
                      <Table.Td>
                        {ticketsByGuest.get(guest.id) ? (
                          <Stack gap={3}>
                            <Text fw={700}>
                              {ticketsByGuest.get(guest.id)?.count} ticket
                              {ticketsByGuest.get(guest.id)?.count === 1 ? "" : "s"}
                            </Text>
                            <Text c="dimmed" fz="xs" lineClamp={1}>
                              {[...(ticketsByGuest.get(guest.id)?.tiers || [])].join(", ")}
                            </Text>
                          </Stack>
                        ) : (
                          <Text c="dimmed">No ticket</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light">{guest.status}</Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(guest.createdAt)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>

          <Group justify="space-between" mt="xl" mb="sm">
            <Stack gap={2}>
              <Text fw={700} fz="lg">Ticket ledger</Text>
              <Text c="dimmed" fz="sm">
                Every issued ticket unit, its tier, owner and check-in state.
              </Text>
            </Stack>
            <Badge variant="light" size="lg">{tickets.length} records</Badge>
          </Group>
          <Card withBorder radius="xl" p={0}>
            <Table.ScrollContainer minWidth={1050}>
              <Table verticalSpacing="md" horizontalSpacing="lg">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ticket holder</Table.Th>
                    <Table.Th>Tier / type</Table.Th>
                    <Table.Th>Ticket reference</Table.Th>
                    <Table.Th>Order</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>State</Table.Th>
                    <Table.Th>Issued</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {tickets.map((ticket) => (
                    <Table.Tr key={ticket.id}>
                      <Table.Td>
                        <Text fw={650}>{ticket.guest.name}</Text>
                        <Text c="dimmed" fz="xs">
                          {ticket.guest.email || ticket.guest.phone || "No contact"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600}>{ticket.ticket.name}</Text>
                        <Text c="dimmed" fz="xs" tt="capitalize">
                          {ticket.ticket.type} · {ticket.guestTicketCount} held
                        </Text>
                      </Table.Td>
                      <Table.Td ff="monospace">{ticket.ticketRef}</Table.Td>
                      <Table.Td>
                        <Text>{ticket.order.reference || `#${ticket.order.id}`}</Text>
                        <Text c="dimmed" fz="xs" tt="capitalize">{ticket.order.status}</Text>
                      </Table.Td>
                      <Table.Td>
                        {formatMoney(ticket.ticket.price, ticket.ticket.currency)}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={
                            ticket.status === "used"
                              ? "teal"
                              : ticket.status === "cancelled"
                                ? "red"
                                : "blue"
                          }
                        >
                          {ticket.status === "used" ? "Checked in" : ticket.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(ticket.createdAt)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="planners">
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
            {planners.map((planner) => {
              const enabledPermissions = planner.permissions.filter(
                (permission) => permission.access,
              );
              return (
                <Card key={planner.id} withBorder radius="xl">
                  <Group justify="space-between">
                    <Group>
                      <Avatar name={planner.name} />
                      <Stack gap={0}>
                        <Text fw={700}>{planner.name}</Text>
                        <Text c="dimmed" fz="sm">
                          {planner.phone}
                        </Text>
                      </Stack>
                    </Group>
                    <Badge>{planner.status}</Badge>
                  </Group>
                  <Group gap="xs" mt="lg">
                    {enabledPermissions.map((permission) => (
                      <Badge key={permission.id} variant="light">
                        {permission.id}
                      </Badge>
                    ))}
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="vendors">
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
            {vendors.map((vendor) => (
              <Card key={vendor.id} withBorder radius="xl">
                <Group>
                  <Avatar src={vendor.logo} name={vendor.name} size="lg" />
                  <Stack gap={0}>
                    <Text fw={700}>{vendor.name}</Text>
                    <Text c="dimmed" fz="sm">
                      {vendor.serviceType}
                    </Text>
                  </Stack>
                </Group>
                <Text mt="md" lineClamp={3}>
                  {vendor.description || "No description"}
                </Text>
                <Group justify="space-between" mt="lg">
                  <Text fz="sm">{vendor.phone || "No phone"}</Text>
                  <Badge variant="light">★ {vendor.rating}</Badge>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="transactions">
          <Card withBorder radius="xl" p={0}>
            <Table.ScrollContainer minWidth={850}>
              <Table verticalSpacing="md" horizontalSpacing="lg">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Reference</Table.Th>
                    <Table.Th>Buyer</Table.Th>
                    <Table.Th>Method</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {transactions.map((transaction) => (
                    <Table.Tr key={transaction.id}>
                      <Table.Td fw={600}>{transaction.reference}</Table.Td>
                      <Table.Td>
                        {transaction.buyer?.name || "Guest checkout"}
                      </Table.Td>
                      <Table.Td>{transaction.paymentMethod || "—"}</Table.Td>
                      <Table.Td>
                        {formatMoney(transaction.amount, transaction.currency)}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light">{transaction.status}</Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(transaction.createdAt)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="party-store">
          <EventStore
            storeData={filteredPartyStoreItems}
            isFetching={partyStoreQuery.isFetching}
            selectedFilter={partyStoreFilter}
            onFilterChange={setPartyStoreFilter}
            query={partyStoreSearch}
            onQueryChange={setPartyStoreSearch}
          />
        </Tabs.Panel>
        <Tabs.Panel value="wishlist">
          <ComingSoon title="Wishlist" />
        </Tabs.Panel>
      </Tabs>
    </AppLayout>
  );
}
