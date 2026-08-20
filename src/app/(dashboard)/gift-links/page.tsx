"use client";

import {
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { AppLayout } from "@/layout";
import { GetGiftLink, GetGiftLinks, SetGiftLinkStatus } from "@/services/api";
import {
  GiftLinkStatus,
  GiftLinkType,
} from "@/services/api/gift-links/gift-links.types";
import { EmptyState, PendingBackend, TableSkeleton } from "@/components";
import {
  asList,
  formatDateTime,
  formatMoney,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { FilterPill, TableToolbar } from "@/components";
import { capitalizeString } from "@/utils";

const statusColor: Record<GiftLinkStatus, string> = {
  active: "teal",
  closed: "gray",
  suspended: "red",
};

const typeLabel: Record<GiftLinkType, string> = {
  secretSanta: "Secret Santa",
  birthday: "Birthday",
};

/**
 * "Receive Gifts" pages users create to collect cash without hosting an event.
 * Contributions are money movements, so the admin needs sight of them for
 * settlement and abuse review.
 */
export default function GiftLinksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [status, setStatus] = useState<GiftLinkStatus | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const linksQuery = useQuery({
    queryKey: ["admin-gift-links", page, debouncedSearch, status],
    queryFn: () =>
      GetGiftLinks({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        status,
      }),
    retry: retryUnlessUnavailable,
  });

  const detailQuery = useQuery({
    queryKey: ["admin-gift-link", selectedId],
    queryFn: () => GetGiftLink(selectedId!),
    enabled: Boolean(selectedId) && opened,
    retry: retryUnlessUnavailable,
  });

  const setStatusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: GiftLinkStatus }) =>
      SetGiftLinkStatus(id, next),
    onSuccess: () => {
      notifications.show({ color: "teal", message: "Gift link updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-gift-links"] });
      queryClient.invalidateQueries({ queryKey: ["admin-gift-link"] });
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  const links = asList(linksQuery.data?.data?.data);
  const pagination = linksQuery.data?.data?.pagination;
  const detail = detailQuery.data?.data;

  const openLink = (id: string) => {
    setSelectedId(id);
    open();
  };

  return (
    <AppLayout
      title="Gift links"
      subTitle="Secret Santa and birthday pages users share to receive gifts"
    >
      {isEndpointUnavailable(linksQuery.error) ? (
        <PendingBackend
          feature="Gift links"
          endpoints={[
            "GET /admin/gift-links",
            "GET /admin/gift-links/:id",
            "PATCH /admin/gift-links/:id/status",
          ]}
        />
      ) : (
        <Stack gap="xl">
          <TableToolbar
            query={search}
            onQueryChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search title, slug or owner"
            action={
              <FilterPill
                label="Status"
                value={status ? capitalizeString(status) : "All"}
                items={["All", "Active", "Closed", "Suspended"]}
                onChange={(value) => {
                  const next = String(value).toLowerCase();
                  setStatus(
                    next === "all" ? undefined : (next as GiftLinkStatus),
                  );
                  setPage(1);
                }}
              />
            }
          />

          <Card radius="lg" p={0}>
            {linksQuery.isFetching ? (
              <TableSkeleton />
            ) : (
              <Table.ScrollContainer minWidth={940}>
                <Table verticalSpacing="md" horizontalSpacing="lg">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Link</Table.Th>
                      <Table.Th>Owner</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Raised</Table.Th>
                      <Table.Th>Contributors</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Created</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {links.map((link) => (
                      <Table.Tr
                        key={link.id}
                        className="cursor-pointer"
                        onClick={() => openLink(link.id)}
                      >
                        <Table.Td>
                          <Text fw={650} lineClamp={1}>
                            {link.title}
                          </Text>
                          <Text c="var(--fj-text-muted)" fz="xs">
                            /gift/{link.slug}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text>{link.ownerName || `User #${link.userId}`}</Text>
                          <Text c="var(--fj-text-muted)" fz="xs">
                            {link.ownerEmail || "No email"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light">{typeLabel[link.type]}</Badge>
                        </Table.Td>
                        <Table.Td fw={700}>
                          {formatMoney(link.totalRaised, link.currency)}
                        </Table.Td>
                        <Table.Td>{link.contributorCount}</Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={statusColor[link.status]}
                          >
                            {link.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{formatDateTime(link.created_at)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}

            {!linksQuery.isFetching && links.length === 0 && (
              <EmptyState
                title="No gift links"
                description="Links users create to receive gifts will appear here."
                mb={40}
              />
            )}
          </Card>

          {pagination && pagination.totalPages > 1 && (
            <Group justify="center">
              <Button
                variant="light"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Text>
                Page {page} of {pagination.totalPages}
              </Text>
              <Button
                variant="light"
                disabled={page === pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </Group>
          )}
        </Stack>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={detail?.title || "Gift link"}
        size="lg"
        centered
      >
        {detailQuery.isFetching ? (
          <TableSkeleton />
        ) : detail ? (
          <Stack gap="md">
            <SimpleGrid cols={2}>
              <Card radius="md" p="sm">
                <Text fz="xs" c="var(--fj-text-muted)">
                  Raised
                </Text>
                <Text fw={700}>
                  {formatMoney(detail.totalRaised, detail.currency)}
                </Text>
              </Card>
              <Card radius="md" p="sm">
                <Text fz="xs" c="var(--fj-text-muted)">
                  Settled
                </Text>
                <Text fw={700}>
                  {formatMoney(detail.settledAmount, detail.currency)}
                </Text>
              </Card>
            </SimpleGrid>

            <Card radius="md" p="sm">
              <Text fz="xs" c="var(--fj-text-muted)">
                Delivery address
              </Text>
              <Text fz="sm">
                {detail.deliveryAddress || "None provided"}
              </Text>
            </Card>

            <Text fw={700}>Well wishers ({detail.wellWishers.length})</Text>
            <Table>
              <Table.Tbody>
                {detail.wellWishers.map((wisher) => (
                  <Table.Tr key={wisher.id}>
                    <Table.Td>
                      <Text fw={600}>
                        {wisher.anonymous ? "Anonymous" : wisher.name}
                      </Text>
                      {wisher.message && (
                        <Text c="var(--fj-text-muted)" fz="xs" lineClamp={1}>
                          {wisher.message}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text fw={650}>
                        {wisher.amount === null
                          ? "Gift"
                          : formatMoney(wisher.amount, wisher.currency)}
                      </Text>
                      <Text c="var(--fj-text-muted)" fz="xs">
                        {formatDateTime(wisher.created_at)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {detail.wellWishers.length === 0 && (
              <Text c="var(--fj-text-muted)" fz="sm">
                No contributions yet.
              </Text>
            )}

            <Group grow>
              {detail.status !== "suspended" ? (
                <Button
                  color="red"
                  variant="light"
                  loading={setStatusMutation.isPending}
                  onClick={() =>
                    setStatusMutation.mutate({
                      id: detail.id,
                      next: "suspended",
                    })
                  }
                >
                  Suspend link
                </Button>
              ) : (
                <Button
                  color="teal"
                  loading={setStatusMutation.isPending}
                  onClick={() =>
                    setStatusMutation.mutate({ id: detail.id, next: "active" })
                  }
                >
                  Restore link
                </Button>
              )}
              <Anchor
                href={`https://www.faajii.com/gift/${detail.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                ta="center"
              >
                Open public page
              </Anchor>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </AppLayout>
  );
}
