"use client";

import { Card, Group, Stack, Table, Text } from "@mantine/core";
import Link from "next/link";
import type { FinanceStreamView } from "@/hooks";
import { formatCount, formatMoney, shareOf, streamMeta } from "@/utils";

interface StreamBreakdownProps {
  currency: string;
  streams: FinanceStreamView[];
  gross: number;
  /** Set when earnings are not reported: shown against tickets as "≈". */
  estimatedTicketFee?: { min: number; max: number } | null;
  title?: string;
  description?: string;
  /** Hide the "open the source page" links (e.g. inside a single event). */
  withLinks?: boolean;
}

const Muted = ({ children }: { children: React.ReactNode }) => (
  <Text span c="var(--fj-text-muted)" fz="sm">
    {children}
  </Text>
);

/**
 * Revenue by stream. "Customers paid" is gross; "Faajii keeps" is what stays
 * after the host and partners are settled. A dash means the backend does not
 * report it yet — never a zero, which would read as "we earned nothing".
 */
const StreamBreakdown = ({
  currency,
  streams,
  gross,
  estimatedTicketFee,
  title = "Revenue by stream",
  description = "What customers paid, less costs, and what Faajii keeps.",
  withLinks = true,
}: StreamBreakdownProps) => {
  const rows = streams.map((row) => {
    const meta = streamMeta[row.stream];
    const estimate =
      row.stream === "tickets" && row.platformRevenue == null
        ? estimatedTicketFee
        : null;

    return (
      <Table.Tr key={row.stream}>
        <Table.Td>
          <Stack gap={0}>
            {withLinks ? (
              // Plain text colour, not the accent: a column of orange links
              // is a lot of orange on a page that already has accents.
              <Text
                component={Link}
                href={meta.href}
                fw={600}
                fz="sm"
                c="var(--fj-text-primary)"
                style={{ textDecoration: "none" }}
              >
                {meta.label}
              </Text>
            ) : (
              <Text fw={600} fz="sm">
                {meta.label}
              </Text>
            )}
            <Text c="var(--fj-text-muted)" fz="xs">
              {meta.note}
            </Text>
          </Stack>
        </Table.Td>
        <Table.Td ta="right">
          {row.orders == null ? <Muted>—</Muted> : formatCount(row.orders)}
        </Table.Td>
        <Table.Td ta="right">
          {row.gross == null ? (
            <Muted>—</Muted>
          ) : (
            formatMoney(row.gross, currency)
          )}
        </Table.Td>
        <Table.Td ta="right">
          {row.costs ? (
            <Text span fz="sm" c="var(--fj-text-secondary)">
              − {formatMoney(row.costs, currency)}
            </Text>
          ) : (
            <Muted>—</Muted>
          )}
        </Table.Td>
        <Table.Td ta="right" fw={700}>
          {row.platformRevenue != null ? (
            formatMoney(row.platformRevenue, currency)
          ) : estimate ? (
            <Text span fw={700} title="Estimate — fee payer is not reported">
              ≈ {formatMoney((estimate.min + estimate.max) / 2, currency)}
            </Text>
          ) : (
            <Muted>—</Muted>
          )}
        </Table.Td>
        <Table.Td ta="right">
          {row.gross == null ? <Muted>—</Muted> : shareOf(row.gross, gross)}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Card radius="lg" p={0}>
      <Group px="lg" pt="lg" pb="xs" justify="space-between">
        <Stack gap={2}>
          <Text fw={700} fz={16}>
            {title}
          </Text>
          <Text fz={12} c="var(--fj-text-muted)">
            {description}
          </Text>
        </Stack>
      </Group>
      <Table.ScrollContainer minWidth={640}>
        <Table verticalSpacing="sm" horizontalSpacing="lg">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Stream</Table.Th>
              <Table.Th ta="right">Paid orders</Table.Th>
              <Table.Th ta="right">Customers paid</Table.Th>
              <Table.Th ta="right">Costs</Table.Th>
              <Table.Th ta="right">Faajii keeps</Table.Th>
              <Table.Th ta="right">Share of gross</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
};

export default StreamBreakdown;
