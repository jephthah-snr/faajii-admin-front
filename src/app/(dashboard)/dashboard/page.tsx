"use client";

import {
  ChartSkeleton,
  FormatDate,
  PpTable,
  SubStatSkeleton,
  SummaryCard,
  SummaryCardSkeleton,
  TransactionModal,
} from "@/components";
import { IconCredit, IconDebit2 } from "@/icons";
import { AppLayout } from "@/layout";
import {
  Avatar,
  Box,
  Card,
  Flex,
  Skeleton,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import Image from "next/image";
import { useState } from "react";
import classes from "@/styles/General.module.css";
import { LineChart } from "@mantine/charts";
import { useQuery } from "@tanstack/react-query";
import {
  GetChartData,
  GetDashboardRecentTransactions,
  GetSubStats,
  GetUserAnalytics,
} from "@/services/api";
import {
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
  //"Status",
];

const Dashboard = () => {
  const [activePage, setActivePage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTransactionRef, setSelectedTransactionRef] =
    useState<string>("");
  const [activeTab, setActiveTab] = useState<"users" | "active" | "recent">(
    "users",
  );

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  //Fetching user analytics
  const { data: analytics, isFetching: isFetchingAnalytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => GetUserAnalytics(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const userAnalytics = analytics?.data;

  //Fetching chart data
  const { data: chartStats, isFetching: isFetchingChart } = useQuery({
    queryKey: ["chartStats", activeTab],
    queryFn: () => GetChartData(activeTab),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const chartData = chartStats?.data;

  //Fetching transactions data
  const {
    data: dashboardRecentTransactions,
    isFetching: isFetchingTransactions,
  } = useQuery({
    queryKey: ["dashboardRecentTransactions"],
    queryFn: () => GetDashboardRecentTransactions(),
    enabled: loggedInUser?.permission !== "support",
  });
  const recentTransactions = dashboardRecentTransactions?.data || [];

  //Fetching sub stats data
  const { data: subStats, isFetching: isFetchingSubStats } = useQuery({
    queryKey: ["subStats"],
    queryFn: () => GetSubStats(),
  });
  const subStatsD = subStats?.data;

  const handleOpenModal = (ref: string) => {
    setSelectedTransactionRef(ref);
    open();
  };

  // Data for SubStatsCards
  const subStatsData = {
    events: [
      { label: "Events Created", value: subStatsD?.stats?.totalEvents ?? 0 },
      { label: "Active Events", value: subStatsD?.stats?.activeEvents ?? 0 },
      {
        label: "Completed Events",
        value: subStatsD?.stats?.completedEvents ?? 0,
      },
      {
        label: "Pending Events",
        value: subStatsD?.stats?.pendingEvents ?? 0,
      },
    ],
    vendors: [
      {
        label: "No. of Vendors",
        value: subStatsD?.vendorStats?.numberOfVendors ?? 0,
      },
      {
        label: "Active Vendors",
        value: subStatsD?.vendorStats?.activeVendors ?? 0,
      },
      {
        label: "Flagged Vendors",
        value: subStatsD?.vendorStats?.flaggedVendors ?? 0,
      },
    ],
    gifts: [
      {
        label: "Bought & Delivered",
        value: subStatsD?.giftStats?.paidAndCompletedOrders ?? 0,
      },
      {
        label: "Failed Deliveries",
        value: subStatsD?.giftStats?.failedOrders ?? 0,
      },
    ],
    drinks: [
      {
        label: "Bought & Delivered",
        value: subStatsD?.drinkStats?.paidAndCompletedOrders ?? 0,
      },
      {
        label: "Failed Deliveries",
        value: subStatsD?.drinkStats?.failedOrders ?? 0,
      },
    ],
  };

  const rows = recentTransactions.map((data) => {
    const isPvb = data?.reference?.startsWith("PVB");
    const formattedAmount = isPvb
      ? convertToNaira(data?.transactionAmount || 0)
      : data?.transactionAmount;

    return (
      <Table.Tr
        key={data?.transactionId}
        onClick={() => handleOpenModal(String(data.transactionId))}
        className={`cursor-pointer`}
      >
        <Table.Td>#{data?.transactionRef || "-"}</Table.Td>
        <Table.Td>
          <Flex gap={8}>
            <Image
              src={data?.direction === "CREDIT" ? IconCredit : IconDebit2}
              alt="icon"
            />
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
        <Table.Td>₦{formatStringAmount(formattedAmount || "0.00")}</Table.Td>
        <Table.Td>
          <FormatDate data={data?.created_at} formatType="fullDate" />
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.created_at} formatType="time" />
        </Table.Td>
        {/* <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.transactionStatus} />
        </Table.Td> */}
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
          <Text c={"#FFFFFF"} fz={18}>
            Hello{" "}
            <span className="font-bold">
              {getFirstName(capitalizeString(loggedInUser?.fullName || "User"))}
            </span>
          </Text>
        </>
      }
      isDashboard
    >
      <Flex direction="column" gap={40}>
        {/* User Analytics */}
        <Box>
          <Flex direction="column" gap={10}>
            {isFetchingAnalytics ? (
              <Skeleton radius={"xl"} width={100} height={18} />
            ) : (
              <Text fw={700}>User Analytics</Text>
            )}
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={20}
              className="overflow-x-hidden md:overflow-x-auto hide-scrollbar"
            >
              {isFetchingAnalytics ? (
                <SummaryCardSkeleton />
              ) : (
                <>
                  <SummaryCard
                    title="Total Users"
                    value={userAnalytics?.totalUsers}
                    tooltip="The total number of people in the system, including registered account holders and guests who RSVP'd without creating an account."
                  />
                  <SummaryCard
                    title="Active Users"
                    value={userAnalytics?.activeUsers?.users}
                    tooltip="The number of users who have created a Faajii account and can log in to the platform."
                    //metric={userAnalytics?.activeUsers?.percentageIncrease}
                  />
                  <SummaryCard
                    title="New Signups"
                    value={userAnalytics?.newSignups?.users}
                    tooltip="The number of new Faajii accounts created during the current month."
                    //metric={userAnalytics?.newSignups?.percentageIncrease}
                  />
                  {/* <SummaryCard
                    title="App Downloads"
                    value={userAnalytics?.appDownloads?.downloads}
                    metric={userAnalytics?.appDownloads?.percentageIncrease}
                  />
                  <SummaryCard
                    title="Number of Vendors"
                    value={userAnalytics?.vendors?.activeVendors}
                    metric={userAnalytics?.vendors?.percentageIncrease}
                  /> */}
                </>
              )}
            </Flex>
          </Flex>
        </Box>

        {/* Chart & Sub Stats */}
        <Flex direction={{ base: "column", md: "row" }} gap={20}>
          <Card w={{ base: "100%", md: "60%" }} radius={"lg"} bg={"#222222E5"}>
            {isFetchingChart ? (
              <ChartSkeleton />
            ) : (
              <Tabs
                defaultValue="users"
                value={activeTab}
                onChange={(value) =>
                  setActiveTab(value as "users" | "active" | "recent")
                }
                classNames={{
                  list: classes.tabListAlt,
                  tab: classes.tabAlt,
                  tabLabel: classes.tabLabelAlt,
                }}
              >
                <Tabs.List justify="center">
                  <Tabs.Tab value="users">New Signups</Tabs.Tab>
                  {/*  <Tabs.Tab value="active">Active Users</Tabs.Tab>
                  <Tabs.Tab value="recent">New Signups</Tabs.Tab> */}
                </Tabs.List>

                <Tabs.Panel value="users">
                  <LineChart
                    h={220}
                    data={chartData || []}
                    dataKey="month"
                    withDots={false}
                    series={[{ name: "totalUsers", color: "#5769E9" }]}
                    curveType="monotone"
                  />
                </Tabs.Panel>

                <Tabs.Panel value="active">
                  <LineChart
                    h={220}
                    data={chartData || []}
                    dataKey="month"
                    withDots={false}
                    series={[{ name: "totalUsers", color: "#FF9801" }]}
                    curveType="monotone"
                  />
                </Tabs.Panel>

                <Tabs.Panel value="recent">
                  <LineChart
                    h={220}
                    data={chartData || []}
                    dataKey="month"
                    withDots={false}
                    series={[{ name: "totalUsers", color: "#D8549C" }]}
                    curveType="monotone"
                  />
                </Tabs.Panel>
              </Tabs>
            )}
          </Card>

          <Box
            className="overflow-x-auto grid grid-cols-1 gap-4"
            w={{ base: "100%", md: "40%" }}
          >
            {isFetchingSubStats ? (
              [...Array(1)].map((_, rowIndex) => (
                <SubStatSkeleton key={rowIndex} />
              ))
            ) : (
              <>
                <SubStatsCard title="Events" data={subStatsData?.events} />
                {/* <SubStatsCard title="Vendors" data={subStatsData?.vendors} />
                <SubStatsCard title="Gifts" data={subStatsData?.gifts} />
                <SubStatsCard title="Drinks" data={subStatsData?.drinks} /> */}
              </>
            )}
          </Box>
        </Flex>

        {/* Recent Transactions */}
        {loggedInUser?.permission !== "support" && (
          <Card bg={"#222222E5"} radius={"lg"} p={24}>
            <Text fw={700}>Recent Transactions</Text>

            <PpTable
              headers={tableHeaders}
              rowData={rows}
              totalItems={recentTransactions.length}
              activePage={activePage}
              setActivePage={setActivePage}
              rowsPerPage={10}
              addOnStyle={`${classes.noRowBorder}`}
              isLoading={isFetchingTransactions}
              emptyState={transactionEmptyState}
              mt={10}
            />
          </Card>
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

interface SubStatsData {
  label: string;
  value: number | string;
}

const SubStatsCard = ({
  title,
  data,
}: {
  title: string;
  data: SubStatsData[];
}) => {
  return (
    <Card flex={1} radius={"lg"} bg={"#222222E5"}>
      <Flex direction="column" gap={10}>
        <Text fw={700} fz={14} c="#fff">
          {title}
        </Text>
        {data?.map((item, index) => (
          <Flex
            key={index}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={4}
          >
            <Text fz={12} c="#fff">
              {item.label}
            </Text>
            <Text fz="sm" c="#fff" fw={700}>
              {item.value?.toLocaleString()}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
};
