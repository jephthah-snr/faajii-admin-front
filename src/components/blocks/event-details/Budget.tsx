"use client";

import {
  Card,
  Flex,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { GetEventBudget } from "@/services/api";
import EmptyState from "../../blocks/empty-state";
import StatTile from "../../blocks/stat-tile";
import PendingBackend from "../../elements/pending-backend";
import { TableSkeleton } from "../../elements/skeletons";
import { formatMoney, isEndpointUnavailable, retryUnlessUnavailable } from "@/utils";

/** Mirrors the Budget screen an event owner sees in the app. */
const Budget = ({ eventId }: { eventId: string }) => {
  const { data, isFetching, error } = useQuery({
    queryKey: ["admin-event-budget", eventId],
    queryFn: () => GetEventBudget(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  if (isEndpointUnavailable(error)) {
    return (
      <PendingBackend
        feature="Event budget"
        endpoints={["GET /admin/events/:id/budget"]}
      />
    );
  }

  const budget = data?.data;
  const items = budget?.items || [];
  const currency = budget?.currency || "NGN";
  const totalBudgeted = budget?.totalBudgeted || 0;
  const totalSpent = budget?.totalSpent || 0;
  const remaining = totalBudgeted - totalSpent;
  const spendRate = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  if (isFetching) return <TableSkeleton />;

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        {[
          { label: "Budgeted", value: totalBudgeted, color: "#74C0FC" },
          { label: "Spent", value: totalSpent, color: "#F5C912" },
          {
            label: "Remaining",
            value: remaining,
            color: remaining < 0 ? "#FF8787" : "#63E6BE",
          },
        ].map((metric) => (
          <StatTile key={metric.label} label={metric.label} value={formatMoney(metric.value, currency)} accent={metric.color} />
        ))}
        <Card radius="lg" bg="var(--fj-surface-elevated)" p="md">
          <Text fz="xs" c="var(--fj-text-muted)">
            Spend rate
          </Text>
          <Text fz={24} fw={800} c="#D0BFFF" mt={4}>
            {spendRate.toFixed(0)}%
          </Text>
          <Progress
            value={Math.min(spendRate, 100)}
            color={spendRate > 100 ? "red" : "violet"}
            mt={8}
            radius="xl"
          />
        </Card>
      </SimpleGrid>

      <Card radius="lg" p={0}>
        <Table.ScrollContainer minWidth={720}>
          <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Line item</Table.Th>
                <Table.Th>Budgeted</Table.Th>
                <Table.Th>Spent</Table.Th>
                <Table.Th>Remaining</Table.Th>
                <Table.Th>Progress</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => {
                const itemRate =
                  item.amount > 0 ? (item.amountSpent / item.amount) * 100 : 0;
                const over = item.amountSpent > item.amount;

                return (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Group gap={8}>
                        <Flex
                          w={10}
                          h={10}
                          bg={item.itemColor || "#5769E9"}
                          style={{ borderRadius: "50%" }}
                        />
                        <Text fw={600}>{item.item}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{formatMoney(item.amount, currency)}</Table.Td>
                    <Table.Td>
                      {formatMoney(item.amountSpent, currency)}
                    </Table.Td>
                    <Table.Td c={over ? "#FF8787" : undefined}>
                      {formatMoney(item.amount - item.amountSpent, currency)}
                    </Table.Td>
                    <Table.Td w={180}>
                      <Progress
                        value={Math.min(itemRate, 100)}
                        color={over ? "red" : "teal"}
                        radius="xl"
                      />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {items.length === 0 && (
          <EmptyState
            title="No budget set"
            description="The host hasn't added any budget line items for this event."
            mb={40}
          />
        )}
      </Card>
    </Stack>
  );
};

export default Budget;
