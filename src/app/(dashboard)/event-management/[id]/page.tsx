"use client";

import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AppLayout } from "@/layout";
import {
  GetAdminEventGuests,
  GetAdminEventTickets,
  GetAdminEventTransactions,
  GetAdminEventPartyStore,
  GetEventDetails,
} from "@/services/api";
import { EventDetails } from "@/services/api/event/event.types";
import {
  EventCheckIns,
  EventCoPlanners,
  EventBudget,
  EventDiscountCodes,
  EventOverview,
  EventSponsors,
  EventStore,
  EventTasks,
  EventWallet,
  StatTile,
} from "@/components";
import { formatDateTime as formatDate, formatMoney } from "@/utils";
import { useMemo, useState } from "react";

/** Guards a list-shaped field so a malformed payload renders empty, not crashes. */
const asArray = <T,>(value: T[] | undefined): T[] =>
  Array.isArray(value) ? value : [];

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
  const partyStoreQuery = useQuery({
    queryKey: ["admin-event-party-store", id],
    queryFn: () => GetAdminEventPartyStore(id),
    enabled: Boolean(id),
  });

  const event = overviewQuery.data?.data as EventDetails | undefined;
  const guests = asArray(guestsQuery.data?.data);
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
  const transactions = asArray(transactionsQuery.data?.data);
  const partyStoreItems = useMemo(() => {
    const data = partyStoreQuery.data?.data;
    return Array.isArray(data) ? data : [];
  }, [partyStoreQuery.data?.data]);
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
          <Tabs.Tab value="check-ins">Check-ins</Tabs.Tab>
          <Tabs.Tab value="planners">Co-planners</Tabs.Tab>
          <Tabs.Tab value="budget">Budget</Tabs.Tab>
          <Tabs.Tab value="tasks">Tasks</Tabs.Tab>
          <Tabs.Tab value="sponsors">Sponsors</Tabs.Tab>
          <Tabs.Tab value="discounts">Discounts</Tabs.Tab>
          <Tabs.Tab value="transactions">
            Transactions ({transactions.length})
          </Tabs.Tab>
          <Tabs.Tab value="wallet">Purse</Tabs.Tab>
          <Tabs.Tab value="party-store">
            Party Store ({partyStoreItems.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <EventOverview
            eventData={event!}
            isFetching={overviewQuery.isFetching}
            eventId={id}
          />
        </Tabs.Panel>

        <Tabs.Panel value="guests">
          <SimpleGrid cols={{ base: 2, md: 5 }} mb="lg">
            {[
              { label: "Tickets issued", value: ticketTracking?.summary?.issued || 0, color: "#F5C912" },
              { label: "Active", value: ticketTracking?.summary?.active || 0, color: "#74C0FC" },
              { label: "Checked in", value: ticketTracking?.summary?.used || 0, color: "#63E6BE" },
              { label: "Cancelled", value: ticketTracking?.summary?.cancelled || 0, color: "#FF8787" },
              { label: "Ticket holders", value: ticketTracking?.summary?.uniqueHolders || 0, color: "#D0BFFF" },
            ].map((metric) => (
              <StatTile key={metric.label} label={metric.label} value={metric.value.toLocaleString()} accent={metric.color} />
            ))}
          </SimpleGrid>

          <Text fw={700} fz="lg" mb="sm">Guest directory</Text>
          <Card radius="lg" p={0}>
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
                        <Text c="var(--fj-text-muted)" fz="xs">
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
                            <Text c="var(--fj-text-muted)" fz="xs" lineClamp={1}>
                              {[...(ticketsByGuest.get(guest.id)?.tiers || [])].join(", ")}
                            </Text>
                          </Stack>
                        ) : (
                          <Text c="var(--fj-text-muted)">No ticket</Text>
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
              <Text c="var(--fj-text-muted)" fz="sm">
                Every issued ticket unit, its tier, owner and check-in state.
              </Text>
            </Stack>
            <Badge variant="light" size="lg">{tickets.length} records</Badge>
          </Group>
          <Card radius="lg" p={0}>
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
                        <Text c="var(--fj-text-muted)" fz="xs">
                          {ticket.guest.email || ticket.guest.phone || "No contact"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600}>{ticket.ticket.name}</Text>
                        <Text c="var(--fj-text-muted)" fz="xs" tt="capitalize">
                          {ticket.ticket.type} · {ticket.guestTicketCount} held
                        </Text>
                      </Table.Td>
                      <Table.Td ff="monospace">{ticket.ticketRef}</Table.Td>
                      <Table.Td>
                        <Text>{ticket.order.reference || `#${ticket.order.id}`}</Text>
                        <Text c="var(--fj-text-muted)" fz="xs" tt="capitalize">{ticket.order.status}</Text>
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

        <Tabs.Panel value="check-ins">
          <EventCheckIns eventId={id} />
        </Tabs.Panel>

        <Tabs.Panel value="planners">
          <EventCoPlanners eventId={id} />
        </Tabs.Panel>

        <Tabs.Panel value="budget">
          <EventBudget eventId={id} />
        </Tabs.Panel>

        <Tabs.Panel value="tasks">
          <EventTasks eventId={id} />
        </Tabs.Panel>

        <Tabs.Panel value="sponsors">
          <EventSponsors eventId={id} />
        </Tabs.Panel>

        <Tabs.Panel value="discounts">
          <EventDiscountCodes eventId={id} />
        </Tabs.Panel>


        <Tabs.Panel value="transactions">
          <Card radius="lg" p={0}>
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

        <Tabs.Panel value="wallet">
          <EventWallet eventId={id} />
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
      </Tabs>
    </AppLayout>
  );
}
