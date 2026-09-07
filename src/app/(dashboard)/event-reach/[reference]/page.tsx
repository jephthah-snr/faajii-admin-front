"use client";

import {
  Anchor,
  Badge,
  Card,
  Group,
  Progress,
  Stack,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import { GetPublication } from "@/services/api";
import type {
  PublicationChannel,
  PublicationSelectionReason,
  PublicationStatus,
} from "@/services/api/publications/publication.types";
import { PpTable, StatBar } from "@/components";
import {
  asList,
  formatCount,
  formatDateTime,
  formatMoney,
  formatStatusLabel,
  isEndpointUnavailable,
  reachAudienceLabel,
  reachDeliveryByAudience,
  retryUnlessUnavailable,
} from "@/utils";
import { IconNoUsers } from "@/config/icons";
import { mockPublicationDetail } from "@/mocks";

const statusColor: Record<PublicationStatus, string> = {
  pending_payment: "yellow",
  paid: "blue",
  sending: "grape",
  completed: "teal",
  failed: "red",
};

const channelLabel: Record<PublicationChannel, string> = {
  push: "Push",
  email: "Email",
};

/** Audience tiers in the order the platform spends them. */
const audienceOrder: PublicationSelectionReason[] = [
  "abandoned_checkout",
  "bookmark",
  "interested_view",
  "discovery_fill",
];

const recipientHeaders = ["Recipient", "Audience", "Status", "Sent"];

const recipientEmptyState = {
  title: "No recipients recorded",
  description:
    "Recipients are logged once the campaign is paid for and sending starts.",
  icon: IconNoUsers,
};

/**
 * One reach campaign: what was bought, what it cost, and where it landed.
 * Audience composition and the recipient log are separate questions — who we
 * aimed at versus who actually got it — so each gets a tab.
 */
export default function EventReachDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();

  const detailQuery = useQuery({
    queryKey: ["admin-publication", reference],
    queryFn: () => GetPublication(reference),
    enabled: Boolean(reference),
    retry: retryUnlessUnavailable,
  });

  // Admin-scoped publication routes are not deployed yet — sample data below.
  const isSample = isEndpointUnavailable(detailQuery.error);
  const detail = isSample
    ? mockPublicationDetail(decodeURIComponent(reference || ""))
    : detailQuery.data?.data;
  const campaign = detail?.campaign;

  const deliveryByAudience = reachDeliveryByAudience(detail?.breakdown);
  const deliveryRate =
    campaign && campaign.deliverableReach > 0
      ? (campaign.sentCount / campaign.deliverableReach) * 100
      : 0;

  const recipientRows = asList(detail?.recipients).map((recipient) => (
    <Table.Tr key={recipient.id}>
      <Table.Td>
        <Text fw={600}>{recipient.name || `User #${recipient.userId}`}</Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {recipient.email || "No email"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light">
          {reachAudienceLabel(recipient.selectionReason)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={
            recipient.status === "sent"
              ? "teal"
              : recipient.status === "failed"
                ? "red"
                : "gray"
          }
        >
          {formatStatusLabel(recipient.status)}
        </Badge>
        {recipient.failureReason && (
          <Text c="#FF8787" fz="xs" mt={4} lineClamp={1}>
            {recipient.failureReason}
          </Text>
        )}
      </Table.Td>
      <Table.Td>{formatDateTime(recipient.sentAt, "—")}</Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout
      title="Event Reach"
      subTitle={campaign?.title || "Campaign"}
      hasBackButton
    >
      <Stack gap="xl">
        {campaign && (
          <>
            <Card radius="lg" p="lg">
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <Stack gap={4} style={{ minWidth: 0 }}>
                  <Group gap={8}>
                    <Badge variant="light">
                      {channelLabel[campaign.channel]}
                    </Badge>
                    <Badge variant="light" color={statusColor[campaign.status]}>
                      {formatStatusLabel(campaign.status)}
                    </Badge>
                    {campaign.countryCode && (
                      <Badge variant="light">{campaign.countryCode}</Badge>
                    )}
                  </Group>
                  <Text fw={700} fz="lg">
                    {campaign.event?.name || "Event removed"}
                  </Text>
                  <Text c="var(--fj-text-muted)" fz="sm">
                    {campaign.owner?.name || "Unknown host"} ·{" "}
                    {campaign.owner?.email || "No email"}
                  </Text>
                  {campaign.event && (
                    <Anchor
                      fz="sm"
                      onClick={() =>
                        router.push(`/event-management/${campaign.event?.id}`)
                      }
                    >
                      Open the event
                    </Anchor>
                  )}
                </Stack>

                <Stack gap={2} align="flex-end">
                  <Text c="var(--fj-text-muted)" fz="xs" ff="monospace">
                    {campaign.reference}
                  </Text>
                  <Text c="var(--fj-text-muted)" fz="xs">
                    Paid {formatDateTime(campaign.paidAt, "not yet")}
                  </Text>
                  <Text c="var(--fj-text-muted)" fz="xs">
                    Completed {formatDateTime(campaign.completedAt, "not yet")}
                  </Text>
                </Stack>
              </Group>

              <Card radius="md" p="sm" mt="lg" bg="var(--fj-surface-elevated)">
                <Text fz={11} c="var(--fj-text-muted)">
                  Message sent
                </Text>
                <Text fw={650} mt={4}>
                  {campaign.title}
                </Text>
                <Text fz="sm" c="var(--fj-text-secondary)">
                  {campaign.message}
                </Text>
              </Card>

              {campaign.failureReason && (
                <Card
                  radius="md"
                  p="sm"
                  mt="sm"
                  bg="rgba(255, 135, 135, 0.08)"
                >
                  <Text fz={11} c="var(--fj-text-muted)">
                    Failure reason
                  </Text>
                  <Text fz="sm" c="#FF8787">
                    {campaign.failureReason}
                  </Text>
                </Card>
              )}
            </Card>

            <Stack gap="sm">
              <StatBar
                minCellWidth={170}
                items={[
                  {
                    label: "Requested reach",
                    value: campaign.userRequestedReach,
                    hint:
                      campaign.userRequestedReach > campaign.deliverableReach
                        ? "Trimmed to the eligible audience"
                        : undefined,
                  },
                  {
                    label: "Deliverable reach",
                    value: campaign.deliverableReach,
                    hint: `Billed at ${formatMoney(
                      campaign.unitPrice,
                      campaign.currency,
                    )} per person`,
                  },
                  {
                    label: "Delivered",
                    value: campaign.sentCount,
                    hint:
                      campaign.failedCount > 0
                        ? `${formatCount(campaign.failedCount)} failed`
                        : `${deliveryRate.toFixed(0)}% of deliverable`,
                  },
                  {
                    label: "Amount paid",
                    value: formatMoney(campaign.totalAmount, campaign.currency),
                  },
                ]}
              />
              <Progress
                value={Math.min(deliveryRate, 100)}
                color={campaign.failedCount > 0 ? "orange" : "teal"}
              />
            </Stack>

            <Tabs defaultValue="audience">
              <Tabs.List mb="lg">
                <Tabs.Tab value="audience">Audience</Tabs.Tab>
                <Tabs.Tab value="recipients">
                  Recipients ({asList(detail?.recipients).length})
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="audience">
                <Stack gap="lg">
                  <Stack gap="sm">
                    <Text fw={700}>Audience bought</Text>
                    <Text c="var(--fj-text-muted)" fz="sm">
                      Strongest intent first. Discovery only fills what the
                      interested tiers could not.
                    </Text>
                    <StatBar
                      minCellWidth={140}
                      items={audienceOrder.map((reason) => ({
                        label: reachAudienceLabel(reason),
                        value: campaign.breakdown?.[reason] || 0,
                      }))}
                    />
                  </Stack>

                  {deliveryByAudience.length > 0 && (
                    <Stack gap="sm">
                      <Text fw={700}>Delivery by audience</Text>
                      {deliveryByAudience.map((entry) => {
                        const rate =
                          entry.total > 0 ? (entry.sent / entry.total) * 100 : 0;

                        return (
                          <Stack key={entry.reason} gap={6}>
                            <Group justify="space-between">
                              <Text fz="sm">
                                {reachAudienceLabel(entry.reason)}
                              </Text>
                              <Text fz="sm" c="var(--fj-text-muted)">
                                {[
                                  entry.sent > 0 &&
                                    `${formatCount(entry.sent)} sent`,
                                  entry.failed > 0 &&
                                    `${formatCount(entry.failed)} failed`,
                                  entry.pending > 0 &&
                                    `${formatCount(entry.pending)} pending`,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </Text>
                            </Group>
                            <Progress
                              value={rate}
                              color={entry.failed > 0 ? "orange" : "teal"}
                              size="xs"
                            />
                          </Stack>
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="recipients">
                <PpTable
                  headers={recipientHeaders}
                  rowData={recipientRows}
                  showPagination={false}
                  isLoading={detailQuery.isFetching && !isSample}
                  emptyState={recipientEmptyState}
                />
              </Tabs.Panel>
            </Tabs>
          </>
        )}
      </Stack>
    </AppLayout>
  );
}
