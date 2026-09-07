"use client";

import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import { GetPromoter, SetPromoterActive } from "@/services/api";
import type { PromotionStatus } from "@/services/api/promoters/promoter.types";
import { PpTable, StatBar } from "@/components";
import {
  asList,
  formatCommission,
  formatFcfa,
  formatDateTime,
  formatStatusLabel,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";
import { IconNoTransactions, IconPromoters } from "@/config/icons";
import { mockPromoterDetail } from "@/mocks";

/** One accent per stage, matching the app's promoter and owner screens. */
const promotionColor: Record<PromotionStatus, string> = {
  pending: "gray",
  offered: "orange",
  active: "teal",
  declined: "red",
  cancelled: "red",
  expired: "dark",
};

const promotionHeaders = [
  "Event",
  "Status",
  "Commission",
  "Code",
  "Tickets sold",
  "Generated",
  "Earned",
];

const ledgerHeaders = ["Reference", "Entry", "Amount", "Status", "Date"];

const promotionsEmptyState = {
  title: "No promotions yet",
  description: "Events this promoter has applied to will be listed here.",
  icon: IconPromoters,
};

const ledgerEmptyState = {
  title: "No wallet activity",
  description: "Commission credits and withdrawals will appear here.",
  icon: IconNoTransactions,
};

/**
 * One promoter: who they are, what they have produced, and the two ledgers
 * behind that — the events they promote and the money that moved. Both are
 * full tables, so they get a tab each rather than being stacked in a drawer.
 */
export default function PromoterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ["admin-promoter", id],
    queryFn: () => GetPromoter(id),
    enabled: Boolean(id),
    retry: retryUnlessUnavailable,
  });

  const setActive = useMutation({
    mutationFn: (isActive: boolean) => SetPromoterActive(id, isActive),
    onSuccess: (_, isActive) => {
      notifications.show({
        color: "teal",
        message: isActive
          ? "Promoter profile reactivated"
          : "Promoter profile deactivated",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-promoter", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-promoters"] });
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  // Admin-scoped promoter routes are not deployed yet — sample data below.
  const isSample = isEndpointUnavailable(detailQuery.error);
  const promoter = isSample
    ? mockPromoterDetail(Number(id))
    : detailQuery.data?.data;

  const socials = [
    { label: "Instagram", handle: promoter?.instagramHandle },
    { label: "TikTok", handle: promoter?.tiktokHandle },
    { label: "X", handle: promoter?.xHandle },
    { label: "Website", handle: promoter?.website },
  ].filter((social) => Boolean(social.handle));

  // The wallet row is authoritative when the detail payload carries one.
  const walletBalance =
    asList(promoter?.wallets)[0]?.balance ?? promoter?.walletBalance ?? 0;

  const promotionRows = asList(promoter?.promotions).map((promotion) => {
    const commission = formatCommission(
      promotion.commissionType,
      promotion.commissionValue,
    );

    return (
      <Table.Tr key={promotion.id}>
        <Table.Td maw={260}>
          <Text fw={650} lineClamp={1}>
            {promotion.event?.name || "Event removed"}
          </Text>
          <Text c="var(--fj-text-muted)" fz="xs">
            {promotion.event?.eventId || "—"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color={promotionColor[promotion.status]}>
            {formatStatusLabel(promotion.status)}
          </Badge>
        </Table.Td>
        <Table.Td>{commission || "Not offered yet"}</Table.Td>
        <Table.Td ff="monospace" fz="sm">
          {promotion.promoterCode || "—"}
        </Table.Td>
        <Table.Td>{promotion.ticketsSold.toLocaleString()}</Table.Td>
        <Table.Td>{formatFcfa(promotion.gross)}</Table.Td>
        <Table.Td>{formatFcfa(promotion.earned)}</Table.Td>
      </Table.Tr>
    );
  });

  const ledgerRows = asList(promoter?.walletTransactions).map((entry) => (
    <Table.Tr key={entry.id}>
      <Table.Td ff="monospace" fz="sm">
        {entry.reference}
      </Table.Td>
      <Table.Td maw={280}>
        <Badge
          variant="light"
          color={entry.type === "credit" ? "teal" : "orange"}
        >
          {entry.type === "credit" ? "Commission" : "Withdrawal"}
        </Badge>
        <Text c="var(--fj-text-muted)" fz="xs" mt={4} lineClamp={1}>
          {entry.narration || entry.eventName || "No narration"}
        </Text>
      </Table.Td>
      <Table.Td fw={650}>{formatFcfa(entry.amount)}</Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={
            entry.status === "success"
              ? "teal"
              : entry.status === "pending"
                ? "yellow"
                : "red"
          }
        >
          {formatStatusLabel(entry.status)}
        </Badge>
      </Table.Td>
      <Table.Td>{formatDateTime(entry.created_at)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout
      title="Promoters"
      subTitle={promoter?.name || "Promoter"}
      hasBackButton
    >
      <Stack gap="xl">
        {promoter && (
          <>
            <Card radius="lg" p="lg">
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <Group gap={14} wrap="nowrap">
                  <Avatar size={56} src={promoter.avatar} name={promoter.name} />
                  <Stack gap={4} style={{ minWidth: 0 }}>
                    <Group gap={8}>
                      <Text fw={700} fz="lg">
                        {promoter.name}
                      </Text>
                      <Badge
                        variant="light"
                        color={promoter.isActive ? "teal" : "gray"}
                      >
                        {promoter.isActive ? "Profile active" : "Profile off"}
                      </Badge>
                    </Group>
                    <Text c="var(--fj-text-muted)" fz="sm">
                      {promoter.email || "No email"} ·{" "}
                      {promoter.phoneNumber || "No phone"}
                    </Text>
                    <Anchor
                      fz="sm"
                      onClick={() =>
                        router.push(`/user-management/${promoter.userId}`)
                      }
                    >
                      View user account
                    </Anchor>
                  </Stack>
                </Group>

                <Stack gap={6} align="flex-end">
                  <Button
                    color={promoter.isActive ? "red" : "teal"}
                    variant={promoter.isActive ? "light" : "filled"}
                    loading={setActive.isPending}
                    onClick={() => setActive.mutate(!promoter.isActive)}
                  >
                    {promoter.isActive
                      ? "Deactivate profile"
                      : "Reactivate profile"}
                  </Button>
                  <Text c="var(--fj-text-muted)" fz={11} maw={260} ta="right">
                    Stops new requests and offers. Live promotions keep their
                    links and earned commission stays payable.
                  </Text>
                </Stack>
              </Group>

              {promoter.bio && (
                <Text fz="sm" c="var(--fj-text-secondary)" mt="md" lh={1.6}>
                  {promoter.bio}
                </Text>
              )}

              {socials.length > 0 && (
                <Group gap={6} mt="md">
                  {socials.map((social) => (
                    <Badge key={social.label} variant="light">
                      {social.label}: {social.handle}
                    </Badge>
                  ))}
                </Group>
              )}
            </Card>

            <StatBar
              minCellWidth={175}
              items={[
                {
                  label: "Tickets sold",
                  value: promoter.ticketsSold,
                  hint: `${promoter.activePromotions} live promotion${
                    promoter.activePromotions === 1 ? "" : "s"
                  }`,
                },
                {
                  label: "Generated for hosts",
                  value: formatFcfa(promoter.gross),
                },
                {
                  label: "Commission earned",
                  value: formatFcfa(promoter.earned),
                },
                {
                  label: "Wallet balance",
                  value: formatFcfa(walletBalance),
                  hint: "Not yet withdrawn",
                },
              ]}
            />

            <Tabs defaultValue="promotions">
              <Tabs.List mb="lg">
                <Tabs.Tab value="promotions">
                  Promotions ({asList(promoter.promotions).length})
                </Tabs.Tab>
                <Tabs.Tab value="wallet">
                  Wallet activity ({asList(promoter.walletTransactions).length})
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="promotions">
                <PpTable
                  headers={promotionHeaders}
                  rowData={promotionRows}
                  showPagination={false}
                  isLoading={detailQuery.isFetching && !isSample}
                  emptyState={promotionsEmptyState}
                />
              </Tabs.Panel>

              <Tabs.Panel value="wallet">
                <PpTable
                  headers={ledgerHeaders}
                  rowData={ledgerRows}
                  showPagination={false}
                  isLoading={detailQuery.isFetching && !isSample}
                  emptyState={ledgerEmptyState}
                />
              </Tabs.Panel>
            </Tabs>
          </>
        )}
      </Stack>
    </AppLayout>
  );
}
