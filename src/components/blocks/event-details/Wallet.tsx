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
import { useQuery } from "@tanstack/react-query";
import { GetEventWallet } from "@/services/api";
import EmptyState from "../../blocks/empty-state";
import PpTable from "../../blocks/table";
import StatTile from "../../blocks/stat-tile";
import PendingBackend from "../../elements/pending-backend";
import { TableSkeleton } from "../../elements/skeletons";
import {
  formatDateTime,
  formatMoney,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";
import { IconNoTransactions } from "@/config/icons";

const tableHeaders = [
  "Reference",
  "Direction",
  "Counterparty",
  "Amount",
  "Fee",
  "Status",
  "Date",
];

const movementEmptyState = {
  title: "No movements",
  description: "Funding and payouts on this purse will appear here.",
  icon: IconNoTransactions,
};

const statusColor: Record<string, string> = {
  success: "teal",
  pending: "yellow",
  failed: "red",
};

/**
 * The event's Faajii purse — funded over MoMo and spent on vendors. Mirrors
 * `/v1/event/:id/wallet/fund` and `/wallet/send` from the host's side.
 */
const Wallet = ({ eventId }: { eventId: string }) => {
  const { data, isFetching, error } = useQuery({
    queryKey: ["admin-event-wallet", eventId],
    queryFn: () => GetEventWallet(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  if (isEndpointUnavailable(error)) {
    return (
      <PendingBackend
        feature="Event purse"
        endpoints={["GET /admin/events/:id/wallet"]}
      />
    );
  }

  if (isFetching) return <TableSkeleton />;

  const wallet = data?.data;

  if (!wallet) {
    return (
      <EmptyState
        title="No purse for this event"
        description="The host hasn't opened a Faajii purse for this event yet."
      />
    );
  }

  const currency = wallet.currency || "NGN";
  const movements = wallet.movements || [];

  const rows = movements.map((movement) => (
    <Table.Tr key={movement.id}>
      <Table.Td ff="monospace" fz="sm">
        {movement.reference}
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={movement.direction === "CREDIT" ? "teal" : "orange"}
        >
          {movement.direction === "CREDIT" ? "Funding" : "Payout"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text>{movement.counterparty || "—"}</Text>
        <Text c="var(--fj-text-muted)" fz="xs" lineClamp={1}>
          {movement.narration || "No narration"}
        </Text>
      </Table.Td>
      <Table.Td fw={650}>
        {formatMoney(movement.amount, movement.currency)}
      </Table.Td>
      <Table.Td>{formatMoney(movement.fee, movement.currency)}</Table.Td>
      <Table.Td>
        <Badge variant="light" color={statusColor[movement.status] || "gray"}>
          {movement.status}
        </Badge>
      </Table.Td>
      <Table.Td>{formatDateTime(movement.created_at)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, md: 4 }}>
        {[
          { label: "Balance", value: wallet.balance, color: "#63E6BE" },
          { label: "Total funded", value: wallet.totalFunded, color: "#74C0FC" },
          { label: "Total spent", value: wallet.totalSpent, color: "#F5C912" },
        ].map((metric) => (
          <StatTile key={metric.label} label={metric.label} value={formatMoney(metric.value, currency)} accent={metric.color} />
        ))}
        <Card radius="lg" bg="var(--fj-surface-elevated)" p="md">
          <Text fz="xs" c="var(--fj-text-muted)">
            Purse status
          </Text>
          <Badge
            mt={8}
            size="lg"
            variant="light"
            color={wallet.isActive ? "teal" : "red"}
          >
            {wallet.isActive ? "Active" : "Frozen"}
          </Badge>
          <Text c="var(--fj-text-muted)" fz="xs" mt={8}>
            Owner: {wallet.ownerName || `User #${wallet.userId}`}
          </Text>
        </Card>
      </SimpleGrid>

      <Stack gap="sm">
        <Text fw={700} fz="lg">
          Linked MoMo accounts
        </Text>
        {wallet.linkedMomoAccounts.length === 0 ? (
          <Text c="var(--fj-text-muted)" fz="sm">
            No mobile money accounts linked to this purse.
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
            {wallet.linkedMomoAccounts.map((account) => (
              <Card key={account.id} radius="lg">
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text fw={650}>{account.fullName}</Text>
                    <Text c="var(--fj-text-muted)" fz="sm">
                      {account.number} · {account.countryCode}
                    </Text>
                    <Text c="var(--fj-text-muted)" fz="xs">
                      {account.providerName || "Unknown provider"}
                    </Text>
                  </Stack>
                  <Badge
                    variant="light"
                    color={account.enabled ? "teal" : "gray"}
                  >
                    {account.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>

      <Stack gap="sm">
        <Text fw={700} fz="lg">
          Movements
        </Text>
        <PpTable
          headers={tableHeaders}
          rowData={rows}
          showPagination={false}
          emptyState={movementEmptyState}
        />
      </Stack>
    </Stack>
  );
};

export default Wallet;
