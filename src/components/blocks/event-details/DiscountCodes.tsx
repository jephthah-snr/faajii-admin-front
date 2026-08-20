"use client";

import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  GetEventDiscountCodes,
  SetDiscountCodeActive,
} from "@/services/api";
import EmptyState from "../../blocks/empty-state";
import StatTile from "../../blocks/stat-tile";
import PendingBackend from "../../elements/pending-backend";
import { TableSkeleton } from "../../elements/skeletons";
import {
  asList,
  formatDateTime,
  formatMoney,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";

/** Promo codes hosts issue for free/discounted RSVPs and ticket sales. */
const DiscountCodes = ({
  eventId,
  currency = "NGN",
}: {
  eventId: string;
  currency?: string;
}) => {
  const queryClient = useQueryClient();

  const { data, isFetching, error } = useQuery({
    queryKey: ["admin-event-discount-codes", eventId],
    queryFn: () => GetEventDiscountCodes(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  const toggle = useMutation({
    mutationFn: ({ codeId, isActive }: { codeId: number; isActive: boolean }) =>
      SetDiscountCodeActive(eventId, codeId, isActive),
    onSuccess: (_, variables) => {
      notifications.show({
        color: "teal",
        message: variables.isActive ? "Code enabled" : "Code disabled",
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-event-discount-codes", eventId],
      });
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  if (isEndpointUnavailable(error)) {
    return (
      <PendingBackend
        feature="Discount codes"
        endpoints={[
          "GET /admin/events/:id/discount-codes",
          "PATCH /admin/events/:id/discount-codes/:codeId",
        ]}
      />
    );
  }

  const codes = asList(data?.data);
  const totalRedemptions = codes.reduce(
    (sum, code) => sum + (code.usedCount || 0),
    0,
  );
  const activeCodes = codes.filter((code) => code.isActive).length;

  if (isFetching) return <TableSkeleton />;

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, md: 3 }}>
        {[
          { label: "Codes issued", value: codes.length, color: "#74C0FC" },
          { label: "Active", value: activeCodes, color: "#63E6BE" },
          {
            label: "Total redemptions",
            value: totalRedemptions,
            color: "#F5C912",
          },
        ].map((metric) => (
          <StatTile key={metric.label} label={metric.label} value={metric.value.toLocaleString()} accent={metric.color} />
        ))}
      </SimpleGrid>

      <Card radius="lg" p={0}>
        <Table.ScrollContainer minWidth={860}>
          <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Code</Table.Th>
                <Table.Th>Discount</Table.Th>
                <Table.Th>Scope</Table.Th>
                <Table.Th>Usage</Table.Th>
                <Table.Th>Expires</Table.Th>
                <Table.Th>Active</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {codes.map((code) => {
                const exhausted =
                  code.maxUses !== null && code.usedCount >= code.maxUses;

                return (
                  <Table.Tr key={code.id}>
                    <Table.Td>
                      <Text ff="monospace" fw={700}>
                        {code.code}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {code.type === "percent"
                        ? `${code.value}% off`
                        : `${formatMoney(code.value, currency)} off`}
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" tt="capitalize">
                        {code.scope}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <Text fw={600}>{code.usedCount}</Text>
                        <Text c="var(--fj-text-muted)">
                          / {code.maxUses ?? "unlimited"}
                        </Text>
                        {exhausted && (
                          <Badge color="red" variant="light" size="sm">
                            Exhausted
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {formatDateTime(code.expiresAt, "No expiry")}
                    </Table.Td>
                    <Table.Td>
                      <Switch
                        checked={code.isActive}
                        disabled={toggle.isPending}
                        onChange={(event) =>
                          toggle.mutate({
                            codeId: code.id,
                            isActive: event.currentTarget.checked,
                          })
                        }
                      />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {codes.length === 0 && (
          <EmptyState
            title="No discount codes"
            description="Codes the host creates for this event will appear here."
            mb={40}
          />
        )}
      </Card>
    </Stack>
  );
};

export default DiscountCodes;
