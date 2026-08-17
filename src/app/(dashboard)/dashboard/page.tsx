"use client";

import {
  ChartSkeleton,
  EmptyState,
  FormatDate,
  PpTable,
  SummaryCard,
  SummaryCardSkeleton,
  TransactionModal,
} from "@/components";
import {
  IconCredit,
  IconDebit,
  IconEvents,
  IconPurchases,
  IconUsers,
  IconVendors,
} from "@/config/icons";
import { AppLayout } from "@/layout";
import {
  Avatar,
  Box,
  Card,
  Flex,
  Group,
  Progress,
  RingProgress,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { LineChart } from "@mantine/charts";
import { useQuery } from "@tanstack/react-query";
import {
  GetChartData,
  GetDashboardRecentTransactions,
  GetSubStats,
  GetUserAnalytics,
} from "@/services/api";
import {
  asList,
  capitalizeString,
  convertToNaira,
  formatStringAmount,
  getFirstName,
  initialsColors,
  transactionEmptyState,
} from "@/utils";
import { useDisclosure } from "@mantine/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const tableHeaders = [
  "Transaction ID",
  "Transaction",
  "User",
  "Amount",
  "Date",
  "Time",
];

/** Section heading used to separate the dashboard's bands. */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Text
    fw={600}
    fz={12}
    tt="uppercase"
    c="var(--fj-text-muted)"
    style={{ letterSpacing: "0.06em" }}
  >
    {children}
  </Text>
);

const Dashboard = () => {
  const [activePage, setActivePage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTransactionRef, setSelectedTransactionRef] =
    useState<string>("");

  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const canSeeMoney = loggedInUser?.permission !== "support";

  const { data: analytics, isFetching: isFetchingAnalytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => GetUserAnalytics(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const userAnalytics = analytics?.data;

  const { data: chartStats, isFetching: isFetchingChart } = useQuery({
    queryKey: ["chartStats"],
    queryFn: () => GetChartData("users"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const chartData = asList(chartStats?.data);

  const {
    data: dashboardRecentTransactions,
    isFetching: isFetchingTransactions,
  } = useQuery({
    queryKey: ["dashboardRecentTransactions"],
    queryFn: () => GetDashboardRecentTransactions(),
    enabled: canSeeMoney,
  });
  const recentTransactions = asList(dashboardRecentTransactions?.data);

  const { data: subStats, isFetching: isFetchingSubStats } = useQuery({
    queryKey: ["subStats"],
    queryFn: () => GetSubStats(),
  });
  const stats = subStats?.data?.stats;
  const vendorStats = subStats?.data?.vendorStats;

  const handleOpenModal = (ref: string) => {
    setSelectedTransactionRef(ref);
    open();
  };

  /* ---------------------------------------------------------- Events split */
  // A ring reads the composition of the event book at a glance in a way four
  // stacked label/value rows never did — the eye gets proportion first, then
  // exact counts from the legend.
  const totalEvents = stats?.totalEvents ?? 0;
  const eventSegments = [
    { label: "Active", value: stats?.activeEvents ?? 0, color: "var(--fj-viz-3)" },
    {
      label: "Completed",
      value: stats?.completedEvents ?? 0,
      color: "var(--fj-viz-2)",
    },
    { label: "Pending", value: stats?.pendingEvents ?? 0, color: "var(--fj-viz-1)" },
  ];
  const accountedFor = eventSegments.reduce((sum, s) => sum + s.value, 0);
  const ringSections = eventSegments.map((segment) => ({
    value: accountedFor > 0 ? (segment.value / accountedFor) * 100 : 0,
    color: segment.color,
    tooltip: `${segment.label}: ${segment.value.toLocaleString()}`,
  }));

  /* ------------------------------------------------------------- Vendor mix */
  const vendorTotal = vendorStats?.numberOfVendors ?? 0;
  const vendorActive = vendorStats?.activeVendors ?? 0;
  const vendorFlagged = vendorStats?.flaggedVendors ?? 0;
  const vendorActiveRate =
    vendorTotal > 0 ? (vendorActive / vendorTotal) * 100 : 0;

  const rows = recentTransactions.map((data) => {
    const isPvb = data?.reference?.startsWith("PVB");
    const formattedAmount = isPvb
      ? convertToNaira(data?.transactionAmount || 0)
      : data?.transactionAmount;

    return (
      <Table.Tr
        key={data?.transactionId}
        onClick={() => handleOpenModal(String(data.transactionId))}
        className="cursor-pointer"
      >
        <Table.Td>#{data?.transactionRef || "-"}</Table.Td>
        <Table.Td>
          <Flex gap={10} align="center">
            {data?.direction === "CREDIT" ? (
              <IconCredit size={18} color="var(--fj-success)" variant="Bulk" />
            ) : (
              <IconDebit size={18} color="var(--fj-danger)" variant="Bulk" />
            )}
            <Box w={300} pr={10}>
              <Text truncate="end" fz={14}>
                {data?.narration || "-"}
              </Text>
            </Box>
          </Flex>
        </Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              size="sm"
              name={data?.user?.name || "-"}
              color="initials"
              allowedInitialsColors={initialsColors}
              src={data?.user?.avatar}
              alt="avatar"
            />
            <Text fz={14} tt="capitalize">
              {data?.user?.name || "-"}
            </Text>
          </Flex>
        </Table.Td>
        <Table.Td fw={600}>
          ₦{formatStringAmount(formattedAmount || "0.00")}
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.created_at} formatType="fullDate" />
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.created_at} formatType="time" />
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout
      title={
        <>
          <Avatar
            src={loggedInUser?.avatar}
            name={getFirstName(loggedInUser?.fullName || "User")}
          />
          <Text c="var(--fj-text-primary)" fz={18}>
            Hello{" "}
            <span className="font-bold">
              {getFirstName(capitalizeString(loggedInUser?.fullName || "User"))}
            </span>
          </Text>
        </>
      }
      isDashboard
    >
      <Flex direction="column" gap={32}>
        {/* ------------------------------------------------------- Headline */}
        <Stack gap={12}>
          <SectionLabel>Platform at a glance</SectionLabel>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            {isFetchingAnalytics || isFetchingSubStats ? (
              <SummaryCardSkeleton />
            ) : (
              <>
                <SummaryCard
                  title="Total Users"
                  icon={IconUsers}
                  value={userAnalytics?.totalUsers}
                  tooltip="Everyone in the system, including guests who RSVP'd without creating an account."
                />
                <SummaryCard
                  title="Active Users"
                  icon={IconUsers}
                  value={userAnalytics?.activeUsers?.users}
                  tooltip="Users with a Faajii account who can sign in to the app."
                />
                <SummaryCard
                  title="New Signups"
                  icon={IconUsers}
                  value={userAnalytics?.newSignups?.users}
                  tooltip="New accounts created this month."
                />
                <SummaryCard
                  title="Active Events"
                  icon={IconEvents}
                  value={stats?.activeEvents}
                  tooltip="Events currently running or accepting guests."
                />
              </>
            )}
          </SimpleGrid>
        </Stack>

        {/* -------------------------------------------- Growth & event split */}
        <Flex direction={{ base: "column", lg: "row" }} gap={20} align="stretch">
          <Card w={{ base: "100%", lg: "62%" }} radius="lg">
            <Group justify="space-between" mb="md">
              <Stack gap={2}>
                <Text fw={700} fz={16}>
                  User growth
                </Text>
                <Text fz={12} c="var(--fj-text-muted)">
                  New signups per month
                </Text>
              </Stack>
            </Group>

            {isFetchingChart ? (
              <ChartSkeleton />
            ) : chartData.length === 0 ? (
              <EmptyState
                compact
                title="No signup data"
                description="Once users start joining, growth will be charted here."
              />
            ) : (
              /* LineChart rather than AreaChart: Mantine's AreaChart does not
                 render its series under React 19 with recharts 2 — the axes and
                 grid draw but the area never does. */
              <LineChart
                h={260}
                data={chartData}
                dataKey="month"
                withDots={false}
                curveType="monotone"
                gridAxis="y"
                strokeWidth={2.5}
                series={[{ name: "totalUsers", label: "Signups", color: "faajii.6" }]}
                valueFormatter={(value) => value.toLocaleString()}
              />
            )}
          </Card>

          <Card w={{ base: "100%", lg: "38%" }} radius="lg">
            <Stack gap={2} mb="md">
              <Text fw={700} fz={16}>
                Events
              </Text>
              <Text fz={12} c="var(--fj-text-muted)">
                How the event book breaks down
              </Text>
            </Stack>

            {isFetchingSubStats ? (
              <Flex direction="column" align="center" gap={20}>
                <Skeleton height={160} circle />
                <Stack gap={10} w="100%">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} height={12} radius="xl" />
                  ))}
                </Stack>
              </Flex>
            ) : totalEvents === 0 ? (
              <EmptyState
                compact
                title="No events yet"
                description="Events created in the app will be summarised here."
              />
            ) : (
              <Stack gap={20} align="center">
                <RingProgress
                  size={172}
                  thickness={14}
                  roundCaps
                  sections={ringSections}
                  rootColor="var(--fj-surface-elevated)"
                  label={
                    <Stack gap={0} align="center">
                      <Text fz={26} fw={800} lh={1.1}>
                        {totalEvents.toLocaleString()}
                      </Text>
                      <Text fz={11} c="var(--fj-text-muted)">
                        total events
                      </Text>
                    </Stack>
                  }
                />

                <Stack gap={10} w="100%">
                  {eventSegments.map((segment) => (
                    <Group key={segment.label} justify="space-between" gap={8}>
                      <Group gap={8}>
                        <Box
                          w={8}
                          h={8}
                          style={{
                            borderRadius: "50%",
                            background: segment.color,
                          }}
                        />
                        <Text fz={13} c="var(--fj-text-secondary)">
                          {segment.label}
                        </Text>
                      </Group>
                      <Group gap={8}>
                        <Text fz={14} fw={700}>
                          {segment.value.toLocaleString()}
                        </Text>
                        <Text fz={12} c="var(--fj-text-muted)" w={38} ta="right">
                          {accountedFor > 0
                            ? `${Math.round((segment.value / accountedFor) * 100)}%`
                            : "0%"}
                        </Text>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            )}
          </Card>
        </Flex>

        {/* ------------------------------------------------------ Supply side */}
        <Stack gap={12}>
          <SectionLabel>Vendor network</SectionLabel>
          <Card radius="lg">
            {isFetchingSubStats ? (
              <Flex gap={20} wrap="wrap">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} height={54} style={{ flex: 1 }} />
                ))}
              </Flex>
            ) : (
              <Flex
                direction={{ base: "column", md: "row" }}
                gap={{ base: 20, md: 32 }}
                align={{ base: "stretch", md: "center" }}
              >
                <Group gap={14} wrap="nowrap" style={{ flex: 1 }}>
                  <Flex
                    align="center"
                    justify="center"
                    w={44}
                    h={44}
                    style={{
                      borderRadius: 12,
                      background: "var(--fj-surface-elevated)",
                    }}
                  >
                    <IconVendors
                      size={20}
                      color="var(--fj-viz-2)"
                      variant="Bulk"
                    />
                  </Flex>
                  <Stack gap={0}>
                    <Text fz={22} fw={800} lh={1.2}>
                      {vendorTotal.toLocaleString()}
                    </Text>
                    <Text fz={12} c="var(--fj-text-muted)">
                      Registered vendors
                    </Text>
                  </Stack>
                </Group>

                <Stack gap={8} style={{ flex: 2 }}>
                  <Group justify="space-between">
                    <Text fz={13} c="var(--fj-text-secondary)">
                      Active
                    </Text>
                    <Text fz={13} fw={600}>
                      {vendorActive.toLocaleString()} of{" "}
                      {vendorTotal.toLocaleString()}
                    </Text>
                  </Group>
                  <Progress
                    value={vendorActiveRate}
                    color="teal"
                    size="md"
                    radius="xl"
                  />
                </Stack>

                <Group gap={14} wrap="nowrap" style={{ flex: 1 }}>
                  <Flex
                    align="center"
                    justify="center"
                    w={44}
                    h={44}
                    style={{
                      borderRadius: 12,
                      background: vendorFlagged
                        ? "var(--fj-danger-soft)"
                        : "var(--fj-surface-elevated)",
                    }}
                  >
                    <IconPurchases
                      size={20}
                      color={
                        vendorFlagged
                          ? "var(--fj-danger)"
                          : "var(--fj-text-muted)"
                      }
                      variant="Bulk"
                    />
                  </Flex>
                  <Stack gap={0}>
                    <Text
                      fz={22}
                      fw={800}
                      lh={1.2}
                      c={vendorFlagged ? "var(--fj-danger)" : undefined}
                    >
                      {vendorFlagged.toLocaleString()}
                    </Text>
                    <Text fz={12} c="var(--fj-text-muted)">
                      Flagged for review
                    </Text>
                  </Stack>
                </Group>
              </Flex>
            )}
          </Card>
        </Stack>

        {/* ------------------------------------------------ Recent activity */}
        {canSeeMoney && (
          <Stack gap={12}>
            <SectionLabel>Recent activity</SectionLabel>
            <Card radius="lg" p={0}>
              <Box px="lg" pt="lg">
                <Text fw={700} fz={16}>
                  Recent transactions
                </Text>
              </Box>

              {/* Deliberately no toolbar — this is a preview of the ledger, not
                  a place to search it. Transactions has its own page for that. */}
              <PpTable
                headers={tableHeaders}
                rowData={rows}
                totalItems={recentTransactions.length}
                activePage={activePage}
                setActivePage={setActivePage}
                rowsPerPage={10}
                addOnStyle="noRowBorder"
                isLoading={isFetchingTransactions}
                emptyState={transactionEmptyState}
                skeletonRows={5}
                showPagination={false}
                px="xs"
              />
            </Card>
          </Stack>
        )}
      </Flex>

      <TransactionModal
        opened={opened}
        close={close}
        transactionRef={selectedTransactionRef}
      />
    </AppLayout>
  );
};

export default Dashboard;
