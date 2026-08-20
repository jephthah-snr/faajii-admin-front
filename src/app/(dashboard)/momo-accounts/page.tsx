"use client";

import {
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Stack,
  Switch,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import {
  GetMomoAccounts,
  GetMomoProviders,
  SetMomoAccountEnabled,
} from "@/services/api";
import { MomoAccountStatus } from "@/services/api/finance/finance.types";
import {
  EmptyState,
  FilterPill,
  PendingBackend,
  TableSkeleton,
  TableToolbar,
} from "@/components";
import {
  asList,
  capitalizeString,
  formatDateTime,
  formatStatusLabel,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";

const statusColor: Record<MomoAccountStatus, string> = {
  active: "teal",
  pending: "yellow",
  disabled: "gray",
  failed: "red",
};

const statusOptions = ["All", "Active", "Pending", "Disabled", "Failed"];

/**
 * Mobile money accounts users link for funding and payouts
 * (`/v1/momo/link/*` in the app). Disabling one here stops further movement on
 * it without unlinking the user's record.
 */
export default function MomoAccountsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [status, setStatus] = useState<MomoAccountStatus | undefined>();
  const [providerId, setProviderId] = useState<string | null>(null);

  const accountsQuery = useQuery({
    queryKey: ["admin-momo-accounts", page, debouncedSearch, status, providerId],
    queryFn: () =>
      GetMomoAccounts({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        status,
        providerId: providerId ? Number(providerId) : undefined,
      }),
    retry: retryUnlessUnavailable,
  });

  // Served by the same public route the app uses, so the filter can't drift.
  const providersQuery = useQuery({
    queryKey: ["momo-providers"],
    queryFn: GetMomoProviders,
    retry: retryUnlessUnavailable,
    staleTime: 1000 * 60 * 30,
  });

  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      SetMomoAccountEnabled(id, enabled),
    onSuccess: (_, variables) => {
      notifications.show({
        color: "teal",
        message: variables.enabled ? "Account enabled" : "Account disabled",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-momo-accounts"] });
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  const accounts = asList(accountsQuery.data?.data?.data);
  const pagination = accountsQuery.data?.data?.pagination;
  const providerOptions: { value: string | null; label: string }[] = [
    { value: null, label: "All" },
    ...asList(providersQuery.data?.data).map((provider) => ({
      value: String(provider.id),
      label: `${provider.name} (${provider.country})`,
    })),
  ];

  return (
    <AppLayout
      title="MoMo accounts"
      subTitle="Mobile money accounts linked for funding and payouts"
    >
      {isEndpointUnavailable(accountsQuery.error) ? (
        <PendingBackend
          feature="MoMo accounts"
          endpoints={[
            "GET /admin/momo/accounts",
            "PATCH /admin/momo/accounts/:id",
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
            searchPlaceholder="Search user, name or number"
            action={
              <Flex gap={10} wrap="wrap">
                <FilterPill
                  label="Status"
                  value={status ? capitalizeString(status) : "All"}
                  items={statusOptions}
                  onChange={(value) => {
                    const next = String(value).toLowerCase();
                    setStatus(
                      next === "all" ? undefined : (next as MomoAccountStatus),
                    );
                    setPage(1);
                  }}
                />
                <FilterPill
                  label="Provider"
                  value={
                    providerOptions.find(
                      (option) => option.value === providerId,
                    )?.label || "All"
                  }
                  items={providerOptions.map((option) => option.label)}
                  onChange={(value) => {
                    const match = providerOptions.find(
                      (option) => option.label === value,
                    );
                    setProviderId(match?.value || null);
                    setPage(1);
                  }}
                />
              </Flex>
            }
          />

          <Card radius="lg" p={0}>
            {accountsQuery.isFetching ? (
              <TableSkeleton />
            ) : (
              <Table.ScrollContainer minWidth={980}>
                <Table verticalSpacing="md" horizontalSpacing="lg">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Account holder</Table.Th>
                      <Table.Th>Linked by</Table.Th>
                      <Table.Th>Provider</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Verified</Table.Th>
                      <Table.Th>Linked</Table.Th>
                      <Table.Th>Enabled</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {accounts.map((account) => (
                      <Table.Tr key={account.id}>
                        <Table.Td>
                          <Text fw={650}>{account.fullName}</Text>
                          <Text c="var(--fj-text-muted)" fz="xs">
                            {account.number} · {account.countryCode}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text
                            className="cursor-pointer"
                            td="underline"
                            onClick={() =>
                              router.push(`/user-management/${account.userId}`)
                            }
                          >
                            {account.userName || `User #${account.userId}`}
                          </Text>
                          <Text c="var(--fj-text-muted)" fz="xs">
                            {account.userEmail || "No email"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {account.providerName || "Unknown"}
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={statusColor[account.status] || "gray"}
                          >
                            {formatStatusLabel(account.status)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {formatDateTime(account.verifiedAt, "Not verified")}
                        </Table.Td>
                        <Table.Td>
                          {formatDateTime(account.created_at)}
                        </Table.Td>
                        <Table.Td>
                          <Switch
                            checked={account.enabled}
                            disabled={toggle.isPending}
                            onChange={(event) =>
                              toggle.mutate({
                                id: account.id,
                                enabled: event.currentTarget.checked,
                              })
                            }
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}

            {!accountsQuery.isFetching && accounts.length === 0 && (
              <EmptyState
                title="No MoMo accounts"
                description="Accounts appear here as users link mobile money for funding."
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
    </AppLayout>
  );
}
