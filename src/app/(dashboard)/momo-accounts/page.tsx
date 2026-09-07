"use client";

import { Badge, Switch, Table, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useMemo, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import {
  GetMomoAccounts,
  GetMomoProviders,
  SetMomoAccountEnabled,
} from "@/services/api";
import { MomoAccountStatus } from "@/services/api/finance/finance.types";
import { PpTable, SampleDataNotice } from "@/components";
import {
  asList,
  formatDateTime,
  formatStatusLabel,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
  type FilterItem,
} from "@/utils";
import { IconMomo } from "@/config/icons";
import { mockMomoAccounts } from "@/mocks";

const statusColor: Record<MomoAccountStatus, string> = {
  active: "teal",
  pending: "yellow",
  disabled: "gray",
  failed: "red",
};

const statusOptions = ["All", "Active", "Pending", "Disabled", "Failed"];

const tableHeaders = [
  "Account holder",
  "Linked by",
  "Provider",
  "Status",
  "Verified",
  "Linked",
  "Enabled",
];

const momoEmptyState = {
  title: "No MoMo accounts",
  description:
    "Accounts appear here as users link mobile money for funding.",
  icon: IconMomo,
};

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
  const [filters, setFilters] = useState<Record<string, string>>({});

  const status = filters.status as MomoAccountStatus | undefined;
  const providerId = filters.providerId;

  // Served by the same public route the app uses, so the filter can't drift.
  const providersQuery = useQuery({
    queryKey: ["momo-providers"],
    queryFn: GetMomoProviders,
    retry: retryUnlessUnavailable,
    staleTime: 1000 * 60 * 30,
  });

  const providerOptions = useMemo(
    () =>
      asList(providersQuery.data?.data).map((provider) => ({
        value: String(provider.id),
        label: `${provider.name} (${provider.country})`,
      })),
    [providersQuery.data],
  );

  const momoFilters: FilterItem[] = useMemo(
    () => [
      {
        title: "Status",
        apiKey: "status",
        default: "All",
        items: statusOptions,
        transform: (value) => value?.toLowerCase(),
      },
      {
        title: "Provider",
        apiKey: "providerId",
        default: "All",
        items: ["All", ...providerOptions.map((option) => option.label)],
        transform: (value) =>
          providerOptions.find((option) => option.label === value)?.value || "",
      },
    ],
    [providerOptions],
  );

  const accountsQuery = useQuery({
    queryKey: ["admin-momo-accounts", page, debouncedSearch, status, providerId],
    queryFn: () =>
      GetMomoAccounts({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        status: status || undefined,
        providerId: providerId ? Number(providerId) : undefined,
      }),
    retry: retryUnlessUnavailable,
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

  // Not deployed yet — the table runs on sample rows so the UI stays reviewable.
  const isSample = isEndpointUnavailable(accountsQuery.error);
  const accounts = isSample
    ? mockMomoAccounts
    : asList(accountsQuery.data?.data?.data);
  const totalItems = isSample
    ? mockMomoAccounts.length
    : accountsQuery.data?.data?.pagination?.total || 0;

  const rows = accounts.map((account) => (
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
          onClick={() => router.push(`/user-management/${account.userId}`)}
        >
          {account.userName || `User #${account.userId}`}
        </Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {account.userEmail || "No email"}
        </Text>
      </Table.Td>
      <Table.Td>{account.providerName || "Unknown"}</Table.Td>
      <Table.Td>
        <Badge variant="light" color={statusColor[account.status] || "gray"}>
          {formatStatusLabel(account.status)}
        </Badge>
      </Table.Td>
      <Table.Td>{formatDateTime(account.verifiedAt, "Not verified")}</Table.Td>
      <Table.Td>{formatDateTime(account.created_at)}</Table.Td>
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
  ));

  return (
    <AppLayout
      title="MoMo accounts"
      subTitle="Mobile money accounts linked for funding and payouts"
    >
      {isSample && <SampleDataNotice integration="momo-accounts" mb="lg" />}

      <PpTable
        headers={tableHeaders}
        rowData={rows}
        totalItems={totalItems}
        activePage={page}
        setActivePage={setPage}
        rowsPerPage={rowsPerPage}
        isLoading={accountsQuery.isFetching}
        hasActions
        filters={momoFilters}
        onFilterChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        query={search}
        handleQuery={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search user, name or number"
        emptyState={momoEmptyState}
      />
    </AppLayout>
  );
}
