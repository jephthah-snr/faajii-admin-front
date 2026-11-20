"use client";

import {
  Badge,
  Button,
  Group,
  ScrollArea,
  SegmentedControl,
  Stack,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
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
  MobileRow,
  EventCheckIns,
  EventCoPlanners,
  EventBudget,
  EventDiscountCodes,
  EventFinance,
  EventOverview,
  EventPromoters,
  EventReach,
  EventSponsors,
  EventTasks,
  EventWallet,
  FaajiiStore,
  ImportGuestsDrawer,
  PpTable,
  StatBar,
  StatusBadge,
} from "@/components";
import {
  buildEventGuestFilters,
  formatDateTime as formatDate,
  formatMoney,
  normalizeStatusKey,
  searchEmptyState,
  transactionEmptyState,
} from "@/utils";
import { IconNoTickets, IconNoUsers, IconUpload } from "@/config/icons";
import { useDisclosure } from "@mantine/hooks";
import classes from "@/styles/General.module.css";
import { useMemo, useState } from "react";

const guestHeaders = [
  "Guest",
  "Contact",
  "Group",
  "Tickets",
  "Status",
  "Added",
];

const ticketHeaders = [
  "Ticket holder",
  "Tier / type",
  "Ticket reference",
  "Order",
  "Price",
  "State",
  "Issued",
];

const transactionHeaders = [
  "Reference",
  "Buyer",
  "Method",
  "Amount",
  "Status",
  "Date",
];

const guestEmptyState = {
  title: "No guests yet",
  description: "Guests added to this event will be listed here.",
  icon: IconNoUsers,
};

const ticketEmptyState = {
  title: "No tickets issued",
  description: "Every ticket issued for this event will appear here.",
  icon: IconNoTickets,
};

/**
 * The event screen's thirteen tabs, grouped by the question each answers.
 * Money collects everything that moves cash: what the event earned for Faajii,
 * payments in, the host's purse, promoter commission and paid reach.
 */
const tabGroups: Record<string, { label: string; tabs: string[] }> = {
  overview: { label: "Overview", tabs: ["overview"] },
  people: { label: "People", tabs: ["guests", "check-ins", "planners"] },
  operations: {
    label: "Operations",
    tabs: ["budget", "tasks", "sponsors", "discounts"],
  },
  money: {
    label: "Money",
    tabs: ["finance", "transactions", "wallet", "promoters", "reach"],
  },
  store: { label: "Store", tabs: ["faajii-store"] },
};

const tabLabels: Record<string, string> = {
  overview: "Overview",
  guests: "Guests",
  "check-ins": "Check-ins",
  planners: "Co-planners",
  budget: "Budget",
  tasks: "Tasks",
  sponsors: "Sponsors",
  discounts: "Discounts",
  finance: "Revenue",
  transactions: "Payments",
  wallet: "Purse",
  promoters: "Promoters",
  reach: "Reach",
  "faajii-store": "Faajii Store",
};

const groupOfTab: Record<string, string> = Object.fromEntries(
  Object.entries(tabGroups).flatMap(([group, { tabs }]) =>
    tabs.map((value) => [value, group]),
  ),
);

/** Guards a list-shaped field so a malformed payload renders empty, not crashes. */
const asArray = <T,>(value: T[] | undefined): T[] =>
  Array.isArray(value) ? value : [];

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  // `?tab=finance` lets other screens link straight to a tab.
  const [tab, setTab] = useState<string>(() => {
    const requested = searchParams.get("tab");
    return requested && requested in groupOfTab ? requested : "overview";
  });
  const [partyStoreFilter, setPartyStoreFilter] = useState("All");
  const [partyStoreSearch, setPartyStoreSearch] = useState("");
  const [importOpened, { open: openImport, close: closeImport }] =
    useDisclosure(false);
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilters, setGuestFilters] = useState<Record<string, string>>({});

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
  const guestFilterConfig = useMemo(
    () =>
      buildEventGuestFilters(
        [...new Set(guests.map((guest) => guest.status).filter(Boolean))],
      ),
    [guests],
  );

  // The guest endpoint returns the whole list, so search and filters run here.
  const filteredGuests = useMemo(() => {
    const search = guestSearch.trim().toLowerCase();
    const { status, ticket, startDate, endDate } = guestFilters;
    const from = startDate ? new Date(startDate).getTime() : null;
    // The picked end day is inclusive.
    const to = endDate ? new Date(endDate).getTime() + 86_400_000 : null;

    return guests.filter((guest) => {
      const added = new Date(guest.createdAt).getTime();
      const hasTicket = ticketsByGuest.has(guest.id);
      return (
        (!search ||
          [guest.name, guest.email, guest.phone, guest.ref, guest.group].some(
            (value) => value?.toLowerCase().includes(search),
          )) &&
        (!status || normalizeStatusKey(guest.status) === status) &&
        (!ticket || (ticket === "has ticket") === hasTicket) &&
        (from === null || added >= from) &&
        (to === null || added < to)
      );
    });
  }, [guests, guestSearch, guestFilters, ticketsByGuest]);
  const isGuestListFiltered =
    Boolean(guestSearch.trim()) || Object.values(guestFilters).some(Boolean);

  const transactions = asArray(transactionsQuery.data?.data);
  const partyStoreItems = useMemo(() => {
    const data = partyStoreQuery.data?.data;
    return Array.isArray(data) ? data : [];
  }, [partyStoreQuery.data?.data]);
  const activeGroupTabs = tabGroups[groupOfTab[tab] ?? "overview"].tabs;
  const tabCounts: Record<string, number | undefined> = {
    guests: guests.length,
    transactions: transactions.length,
    "faajii-store": partyStoreItems.length,
  };
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

  const guestRows = filteredGuests.map((guest) => (
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
        <StatusBadge status={guest.status} />
      </Table.Td>
      <Table.Td>{formatDate(guest.createdAt)}</Table.Td>
    </Table.Tr>
  ));

  const ticketRows = tickets.map((ticket) => (
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
        <Text c="var(--fj-text-muted)" fz="xs" tt="capitalize">
          {ticket.order.status}
        </Text>
      </Table.Td>
      <Table.Td>
        {formatMoney(ticket.ticket.price, ticket.ticket.currency)}
      </Table.Td>
      <Table.Td>
        <StatusBadge
          status={ticket.status}
          label={ticket.status === "used" ? "Checked in" : undefined}
        />
      </Table.Td>
      <Table.Td>{formatDate(ticket.createdAt)}</Table.Td>
    </Table.Tr>
  ));

  const transactionRows = transactions.map((transaction) => (
    <Table.Tr key={transaction.id}>
      <Table.Td fw={600}>{transaction.reference}</Table.Td>
      <Table.Td>{transaction.buyer?.name || "Guest checkout"}</Table.Td>
      <Table.Td>{transaction.paymentMethod || "—"}</Table.Td>
      <Table.Td>
        {formatMoney(transaction.amount, transaction.currency)}
      </Table.Td>
      <Table.Td>
        <StatusBadge status={transaction.status} />
      </Table.Td>
      <Table.Td>{formatDate(transaction.createdAt)}</Table.Td>
    </Table.Tr>
  ));

  const guestMobileRows = filteredGuests.map((guest) => {
    const held = ticketsByGuest.get(guest.id);
    return (
      <MobileRow
        key={guest.id}
        title={guest.name}
        subtitle={guest.email || guest.phone || "No contact"}
        caption={
          held
            ? `${held.count} ticket${held.count === 1 ? "" : "s"}`
            : "No ticket"
        }
        status={<StatusBadge status={guest.status} size="sm" />}
      />
    );
  });

  const ticketMobileRows = tickets.map((ticket) => (
    <MobileRow
      key={ticket.id}
      title={ticket.guest.name}
      subtitle={ticket.ticket.name}
      caption={ticket.ticketRef}
      value={formatMoney(ticket.ticket.price, ticket.ticket.currency)}
      status={
        <StatusBadge
          size="sm"
          status={ticket.status}
          label={ticket.status === "used" ? "Checked in" : undefined}
        />
      }
    />
  ));

  const transactionMobileRows = transactions.map((transaction) => (
    <MobileRow
      key={transaction.id}
      title={transaction.buyer?.name || "Guest checkout"}
      subtitle={transaction.reference}
      caption={formatDate(transaction.createdAt)}
      value={formatMoney(transaction.amount, transaction.currency)}
      status={<StatusBadge status={transaction.status} size="sm" />}
    />
  ));

  return (
    <AppLayout
      title="Event details"
      subTitle={event?.name || "Loading event"}
      hasBackButton
    >
      {/* Thirteen flat tabs were too many to scan, so they sit under five
          groups: pick the area, then the screen inside it. Every panel below
          keeps its own value, so a group is only a way of reaching it. */}
      <Tabs value={tab} onChange={(value) => value && setTab(value)}>
        <ScrollArea type="never" mb="md">
          <SegmentedControl
            value={groupOfTab[tab] ?? "overview"}
            onChange={(group) => setTab(tabGroups[group].tabs[0])}
            data={Object.entries(tabGroups).map(([value, group]) => ({
              value,
              label: group.label,
            }))}
          />
        </ScrollArea>

        {activeGroupTabs.length > 1 && (
          <Tabs.List mb="xl">
            {activeGroupTabs.map((value) => (
              <Tabs.Tab key={value} value={value}>
                {tabLabels[value]}
                {tabCounts[value] !== undefined && ` (${tabCounts[value]})`}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        )}

        <Tabs.Panel value="finance">
          <EventFinance eventId={id} />
        </Tabs.Panel>

        <Tabs.Panel value="overview">
          <EventOverview
            eventData={event!}
            isFetching={overviewQuery.isFetching}
            eventId={id}
          />
        </Tabs.Panel>

        <Tabs.Panel value="guests">
          <StatBar
            mb="lg"
            items={[
              {
                label: "Tickets issued",
                value: ticketTracking?.summary?.issued || 0,
              },
              { label: "Active", value: ticketTracking?.summary?.active || 0 },
              {
                label: "Checked in",
                value: ticketTracking?.summary?.used || 0,
              },
              {
                label: "Cancelled",
                value: ticketTracking?.summary?.cancelled || 0,
              },
              {
                label: "Ticket holders",
                value: ticketTracking?.summary?.uniqueHolders || 0,
              },
            ]}
          />

          <Group justify="space-between" gap="xs">
            <Text fw={700} fz="lg">Guest directory</Text>
            {isGuestListFiltered && (
              <Text c="var(--fj-text-muted)" fz="sm">
                {filteredGuests.length} of {guests.length} guests
              </Text>
            )}
          </Group>
          <PpTable
            headers={guestHeaders}
            rowData={guestRows}
            mobileRows={guestMobileRows}
            showPagination={false}
            isLoading={guestsQuery.isFetching}
            emptyState={isGuestListFiltered ? searchEmptyState : guestEmptyState}
            hasActions
            query={guestSearch}
            handleQuery={setGuestSearch}
            searchPlaceholder="Search name, email, phone"
            filters={guestFilterConfig}
            onFilterChange={setGuestFilters}
            toolbarAction={
              <Button
                h={40}
                px={14}
                radius="md"
                className={classes.btnWhite}
                w={{ base: "100%", sm: "auto" }}
                leftSection={
                  <IconUpload size={18} color="currentColor" variant="Linear" />
                }
                onClick={openImport}
              >
                Import guests
              </Button>
            }
          />

          <Group justify="space-between" mt="xl" mb="sm">
            <Stack gap={2}>
              <Text fw={700} fz="lg">Ticket ledger</Text>
              <Text c="var(--fj-text-muted)" fz="sm">
                Every issued ticket unit, its tier, owner and check-in state.
              </Text>
            </Stack>
            <Badge variant="light" size="lg">{tickets.length} records</Badge>
          </Group>
          <PpTable
            headers={ticketHeaders}
            rowData={ticketRows}
            mobileRows={ticketMobileRows}
            showPagination={false}
            isLoading={ticketsQuery.isFetching}
            emptyState={ticketEmptyState}
          />
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


        <Tabs.Panel value="promoters">
          <EventPromoters eventId={id} />
        </Tabs.Panel>

        <Tabs.Panel value="reach">
          <EventReach eventId={id} />
        </Tabs.Panel>

        <Tabs.Panel value="transactions">
          <PpTable
            headers={transactionHeaders}
            rowData={transactionRows}
            mobileRows={transactionMobileRows}
            showPagination={false}
            isLoading={transactionsQuery.isFetching}
            emptyState={transactionEmptyState}
          />
        </Tabs.Panel>

        <Tabs.Panel value="wallet">
          <EventWallet eventId={id} />
        </Tabs.Panel>





        <Tabs.Panel value="faajii-store">
          <FaajiiStore
            storeData={filteredPartyStoreItems}
            isFetching={partyStoreQuery.isFetching}
            selectedFilter={partyStoreFilter}
            onFilterChange={setPartyStoreFilter}
            query={partyStoreSearch}
            onQueryChange={setPartyStoreSearch}
          />
        </Tabs.Panel>
      </Tabs>

      <ImportGuestsDrawer
        opened={importOpened}
        close={closeImport}
        eventId={id}
      />
    </AppLayout>
  );
}
