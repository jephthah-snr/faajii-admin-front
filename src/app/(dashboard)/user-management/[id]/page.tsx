"use client";

import { AppLayout } from "@/layout";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Group,
  ScrollArea,
  Skeleton,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import classes from "@/styles/General.module.css";
import {
  ConfirmationModal,
  EditUserModal,
  FormatDate,
  PpTable,
  StatusBadge,
  SummaryCard,
  SummaryCardSkeletonAlt,
  TransactionModal,
  UserProfileSkeleton,
} from "@/components";
import {
  eventEmptyState,
  eventFilters,
  formatStringAmount,
  initialsColors,
  rowsPerPage,
  transactionEmptyState,
  transactionFilters,
} from "@/utils";
import { useEffect, useState } from "react";
import Image from "next/image";
import { IconCredit, IconDebit, IconDebit2, IconEllipsisH } from "@/icons";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  DeleteUser,
  GetUserActivities,
  GetUserDetails,
  GetUserEvents,
  GetUserFilteredEvents,
  GetUserQuickStats,
  GetUserTransactions,
  ResetUserPin,
  SuspendUser,
} from "@/services/api";

const tableHeaders = [
  "Transaction ID",
  "Wallet",
  "Transaction",
  "Amount",
  "Date/Time",
  "Status",
];

const eventsCreatedTableHeaders = [
  "Event Name",
  "Date",
  "Time",
  "Attendees",
  "Vendors",
  "Status",
];

const profileEventsableHeaders = [
  "Event ID",
  "Event Name",
  "Role",
  "Budget",
  "Date",
  "Time",
  "Status",
  "",
];

const profileTransactionsTableHeaders = [
  "Transaction ID",
  "Wallet",
  "Transaction",
  "Amount",
  "Date/Time",
  "Status",
];

const profileActivityTableHeaders = [
  "Event",
  "Action",
  "Performer",
  "Performer Role",
  "Date/Time",
  "Activity Type",
];

const UserDetails = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [activePage, setActivePage] = useState(1);
  const [activeTransactionsPage, setActiveTransactionsPage] = useState(1);
  const [activeEventTab, setActiveEventTab] = useState<
    "userevents" | "coplannedevents" | "rsvpevents"
  >("userevents");
  const [isLoading, setIsLoading] = useState(false);
  const [isUserSuspended, setIsUserSuspended] = useState(false);
  const [selectedRef, setSelectedRef] = useState<string>("");
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);

  //Fetching user details
  const {
    data: user,
    isFetching: isFetchingUser,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => GetUserDetails(id),
  });
  const userProfile = user?.data?.userProfile;
  const recentTransactions = user?.data?.recentTransaction || [];

  useEffect(() => {
    if (userProfile?.status === "suspended") {
      setIsUserSuspended(true);
    }
  }, [userProfile]);

  //Fetching quick stats
  const { data: stats, isFetching: isFetchingQuickStats } = useQuery({
    queryKey: ["stats", id],
    queryFn: () => GetUserQuickStats(id),
  });
  const quickStats = stats?.data;

  //Fetching user events
  const { data: userEvents, isFetching: isFetchingUserEvents } = useQuery({
    queryKey: ["userEvents", id],
    queryFn: () => GetUserEvents(id),
  });
  const userEventsData = userEvents?.data || [];

  //Fetching user transactions
  const { data: transactions, isFetching: isFetchingTransactions } = useQuery({
    queryKey: [
      "transactions",
      id,
      activeTransactionsPage,
      rowsPerPage,
      debouncedQuery,
    ],
    queryFn: () =>
      GetUserTransactions(
        id,
        String(activeTransactionsPage),
        String(rowsPerPage),
        debouncedQuery,
      ),
  });
  const userTransactions = transactions?.data?.data || [];
  const totalTransactionItems = transactions?.data?.pagination?.total || 0;

  //Fetching user filtered events
  const { data: filteredEvents, isFetching: isFetchingFilteredEvents } =
    useQuery({
      queryKey: ["filteredEvents", id, activeEventTab],
      queryFn: () => GetUserFilteredEvents(id, "1", "10", activeEventTab),
    });
  const userFilteredEvents = filteredEvents?.data || [];

  //Fetching user activities
  const { data: activities, isFetching: isFetchingActivities } = useQuery({
    queryKey: ["activities", id],
    queryFn: () => GetUserActivities(id),
  });
  const userActivities = activities?.data || [];

  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [
    suspendModalOpened,
    { open: openSuspendModal, close: closeSuspendModal },
  ] = useDisclosure(false);
  const [
    successModalOpened,
    { open: openSuccessModal, close: closeSuccessModal },
  ] = useDisclosure(false);
  const [
    transactionModalOpened,
    { open: openTransactionModal, close: closeTransactionModal },
  ] = useDisclosure(false);
  const [
    recentTransactionModalOpened,
    { open: openRecentTransactionModal, close: closeRecentTransactionModal },
  ] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);

  const [
    resetPinModalOpened,
    { open: openResetPinModal, close: closeResetPinModal },
  ] = useDisclosure(false);
  const [
    resetPinSuccessModalOpened,
    { open: openResetPinSuccessModal, close: closeResetPinSuccessModal },
  ] = useDisclosure(false);
  const [
    resetPinErrorModalOpened,
    { open: openResetPinErrorModal, close: closeResetPinErrorModal },
  ] = useDisclosure(false);

  const [successMessage, setSuccessMessage] = useState("");

  const handleRecentTransaction = (ref: string) => {
    setSelectedRef(ref);
    openRecentTransactionModal();
  };

  const handleTransaction = (ref: string) => {
    setSelectedRef(ref);
    openTransactionModal();
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await DeleteUser(String(userProfile?.id));
      setSuccessMessage("User has been deleted successfully");
      closeDeleteModal();
      openSuccessModal();
      // Navigate back to user list after successful deletion
      setTimeout(() => {
        router.push("/user-management");
      }, 1500);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    try {
      setIsLoading(true);
      // Simulate API call

      if (isUserSuspended) {
        await SuspendUser(String(userProfile?.id));
        setSuccessMessage(`User has been unblocked successfully`);
      } else {
        await SuspendUser(String(userProfile?.id));
        setSuccessMessage(`User has been suspended successfully`);
      }
      refetchProfile();
      closeSuspendModal();
      openSuccessModal();
    } catch (error) {
      console.error("Error suspending user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPin = async () => {
    try {
      setIsLoading(true);
      await ResetUserPin(String(userProfile?.id));
      closeResetPinModal();
      openResetPinSuccessModal();
    } catch (error) {
      console.error("Error resetting PIN:", error);
      closeResetPinModal();
      openResetPinErrorModal();
    } finally {
      setIsLoading(false);
    }
  };

  const formatPartyVibe = (
    vibe: string[] | string | null | undefined,
  ): string => {
    if (!vibe) {
      return "N/A";
    }

    if (Array.isArray(vibe)) {
      return vibe.length > 0 ? vibe.join(", ") : "N/A";
    }

    if (typeof vibe === "string") {
      const trimmed = vibe.trim();
      return trimmed === "" ? "N/A" : trimmed;
    }

    return "N/A";
  };

  const eventsFilteredRows = userFilteredEvents?.map((data, index) => {
    return (
      <Table.Tr key={index}>
        <Table.Td>{data?.name || "N/A"}</Table.Td>
        <Table.Td>
          <FormatDate data={data?.startDate} formatType="fullDate" />
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.startDate} formatType="time" /> {" - "}
          <FormatDate data={data?.endDate} formatType="time" />
        </Table.Td>
        <Table.Td>{data?.invitedCount || "0"}</Table.Td>
        <Table.Td>{data?.vendorsCount || "0"}</Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.status} />
        </Table.Td>
      </Table.Tr>
    );
  });

  const rows = recentTransactions?.map((data) => {
    return (
      <Table.Tr
        key={data.ref}
        onClick={() => handleRecentTransaction(data.ref)}
        className={`cursor-pointer`}
      >
        <Table.Td>#{data?.transactionRef || "N/A"}</Table.Td>
        <Table.Td>{data?.wallet?.partyBankName || "N/A"}</Table.Td>
        <Table.Td>
          <Flex gap={8}>
            <Image
              src={data?.direction === "CREDIT" ? IconCredit : IconDebit2}
              alt="icon"
            />
            <Text fz={14}>{data?.narration || "N/A"}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>
          ₦{formatStringAmount(data?.transactionAmount) || "0.00"}
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.created_at} formatType="datePipeTime" />
        </Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.transactionStatus} />
        </Table.Td>
      </Table.Tr>
    );
  });

  const profileEventsRows = userEventsData?.map((data, index) => {
    return (
      <Table.Tr
        key={index}
        onClick={() => router.push(`/event-management/${data?.id}`)}
        className={`cursor-pointer`}
      >
        <Table.Td>#{data?.eventId || "N/A"}</Table.Td>
        <Table.Td>{data?.name || "N/A"}</Table.Td>
        <Table.Td tt="capitalize">{data?.role || "N/A"}</Table.Td>
        <Table.Td>₦{formatStringAmount(data?.eventBudget || "0.00")}</Table.Td>
        <Table.Td>
          <FormatDate data={data?.startDate} formatType="fullDate" />
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.startDate} formatType="time" /> {" - "}{" "}
          <FormatDate data={data?.endDate} formatType="time" />
        </Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.status} />
        </Table.Td>
        <Table.Td>
          <ActionIcon variant="transparent" aria-label="More">
            <Image
              src={IconEllipsisH}
              alt="icon"
              style={{ width: "70%", height: "70%" }}
            />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  });

  const profileTransactionsRows = userTransactions?.map((data) => {
    return (
      <Table.Tr
        key={data.ref}
        onClick={() => handleTransaction(data.ref)}
        className="cursor-pointer"
      >
        <Table.Td>#{data?.transactionRef || "N/A"}</Table.Td>
        <Table.Td>{data.wallet?.partyBankName || "N/A"}</Table.Td>
        <Table.Td>
          <Flex gap={8}>
            <Image
              src={data?.direction === "CREDIT" ? IconCredit : IconDebit}
              alt="icon"
            />
            <Text fz={14}>{data?.narration || "N/A"}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>
          ₦{formatStringAmount(data?.transactionAmount) || "0.00"}
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.created_at} formatType="datePipeTime" />
        </Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.transactionStatus} />
        </Table.Td>
      </Table.Tr>
    );
  });

  const profileActivityRows = userActivities?.map((data) => {
    return (
      <Table.Tr key={data.id}>
        <Table.Td>{data?.eventName || "N/A"}</Table.Td>
        <Table.Td>{data?.title || "N/A"}</Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              size="sm"
              src={data?.metaData?.actor?.imageUrl}
              name={data?.metaData?.actor?.name || "-"}
              color="initials"
              allowedInitialsColors={initialsColors}
              alt="avatar"
            />
            <Text fz={14}>{data?.metaData?.actor?.name || "-"}</Text>
          </Flex>
        </Table.Td>
        <Table.Td tt="capitalize">{data?.performerRole || "N/A"}</Table.Td>
        <Table.Td>
          <FormatDate data={data?.created_at} formatType="datePipeTime" />
        </Table.Td>
        <Table.Td>{data?.activityType || "N/A"}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout title="User Management" subTitle="User Details" hasBackButton>
      <Box pos="relative">
        <Group
          mb={{ base: 20, md: 0 }}
          pos={{ base: "relative", md: "absolute" }}
          top={0}
          right={0}
        >
          <Button
            className={classes.btnWhite}
            onClick={openSuspendModal}
            radius="xl"
          >
            {isUserSuspended ? "Unblock User" : "Suspend User"}
          </Button>
          <Button
            className={classes.btnDanger}
            onClick={openDeleteModal}
            radius="xl"
          >
            Delete User
          </Button>
        </Group>
        <Tabs defaultValue="overview" keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="events">Events</Tabs.Tab>
            <Tabs.Tab value="transactions">Transactions</Tabs.Tab>
            {/* <Tabs.Tab value="activities">Activities</Tabs.Tab> */}
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Flex direction={{ base: "column", md: "row" }} gap={20}>
              <Card
                w={{ base: "100%", md: "30%" }}
                bg="#222222E5"
                radius={"lg"}
                p={24}
              >
                {isFetchingUser ? (
                  <UserProfileSkeleton />
                ) : (
                  <>
                    <Flex
                      justify="space-between"
                      align="center"
                      mb={10}
                      gap={10}
                    >
                      <Flex align="center" gap={10}>
                        <Text fw={700} c="#fff">
                          Profile
                        </Text>
                        <Text
                          fz={12}
                          c="#24A181"
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={openEditModal}
                        >
                          Edit
                        </Text>
                      </Flex>
                      <StatusBadge status={userProfile?.status || "N/A"} />
                    </Flex>

                    {/* Profile summary */}
                    <Flex direction="column" gap={20}>
                      <Flex direction="column" align="center" gap={5} mt={10}>
                        <Avatar
                          src={userProfile?.avatar || "-"}
                          name={userProfile?.name || "User"}
                          color="initials"
                          allowedInitialsColors={initialsColors}
                          style={{ border: "3px solid #fff" }}
                          size={120}
                        />
                        <Flex direction="column" align="center">
                          <Text c="#fff" tt="capitalize">
                            {userProfile?.name || "N/A"}
                          </Text>
                          {/* <Text c="#D9D9D9B2">{userProfile?.tag || "-"}</Text> */}
                        </Flex>
                      </Flex>

                      {/* Bio */}
                      <Text c="#fff" fz={13}>
                        {userProfile?.bio || "N/A"}
                      </Text>

                      <Flex direction="column" gap={10}>
                        <ProfileDetail
                          title="Email"
                          value={userProfile?.email}
                        />
                        <ProfileDetail
                          title="Phone"
                          value={userProfile?.phoneNumber}
                        />
                        <ProfileDetail
                          title="Party vibe"
                          value={formatPartyVibe(
                            userProfile?.partyPlanningVibe,
                          )}
                        />
                        <ProfileDetail
                          title="Joined"
                          value={
                            <FormatDate
                              data={userProfile?.created_at || ""}
                              formatType="dateTime"
                            />
                          }
                        />
                      </Flex>

                      {/* Reset Transaction PIN */}
                      <Box mt={20}>
                        <Text
                          fz={12}
                          c="#24A181"
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={openResetPinModal}
                        >
                          Reset PIN
                        </Text>
                      </Box>
                    </Flex>
                  </>
                )}
              </Card>

              <Box w={{ base: "100%", md: "70%" }}>
                <Flex direction="column" gap={20}>
                  <Card bg="#222222E5" radius={"lg"} p={24}>
                    {isFetchingQuickStats ? (
                      <Skeleton radius={"xl"} width={100} height={18} />
                    ) : (
                      <Text fw={700} c="#fff">
                        Quick Stats
                      </Text>
                    )}

                    <Box
                      className="overflow-x-hidden md:overflow-x-auto hide-scrollbar flex flex-wrap md:flex-nowrap gap-x-0 md:gap-x-6 gap-y-6"
                      mt={20}
                    >
                      {isFetchingQuickStats ? (
                        <SummaryCardSkeletonAlt />
                      ) : (
                        <>
                          <SummaryCard
                            className="profile-stats-card"
                            title="Events Created"
                            value={quickStats?.EventsCreated || 0}
                            withLightTitle
                          />
                          <SummaryCard
                            className="profile-stats-card borderLeft"
                            title="Events Co-planned"
                            value={quickStats?.eventsCoPlanned || 0}
                            withLightTitle
                          />
                          <SummaryCard
                            className="profile-stats-card dynamicBorder"
                            title="RSVP’s Received"
                            value={quickStats?.rsvpEvents || 0}
                            withLightTitle
                          />
                          <SummaryCard
                            className="profile-stats-card borderLeft"
                            title="Total Amount Spent"
                            value={formatStringAmount(
                              quickStats?.totalAmountSpent || 0,
                            )}
                            isCurrency
                            withLightTitle
                          />
                          <SummaryCard
                            className="profile-stats-card dynamicBorder"
                            title="Gifts Sent"
                            value={quickStats?.giftsGiven || 0}
                            withLightTitle
                          />
                          <SummaryCard
                            className="profile-stats-card borderLeft"
                            title="Gifts received"
                            value={quickStats?.giftsReceived || 0}
                            withLightTitle
                          />
                        </>
                      )}
                    </Box>
                  </Card>
                  <Card bg="#222222E5" radius={"lg"} p={24}>
                    <Tabs
                      defaultValue="userevents"
                      value={activeEventTab}
                      onChange={(value) =>
                        setActiveEventTab(
                          value as
                            | "userevents"
                            | "coplannedevents"
                            | "rsvpevents",
                        )
                      }
                      classNames={{
                        list: classes.tabListAlt,
                        tab: classes.tabAlt,
                        tabLabel: classes.tabLabelAlt,
                      }}
                    >
                      {isFetchingQuickStats ? (
                        <Flex align="center" justify="center" gap={20}>
                          <Skeleton width={100} height={20} radius={"lg"} />
                          <Skeleton width={100} height={20} radius={"lg"} />
                          <Skeleton width={100} height={20} radius={"lg"} />
                        </Flex>
                      ) : (
                        <Tabs.List justify="center">
                          <Tabs.Tab value="userevents">Events Created</Tabs.Tab>
                          <Tabs.Tab value="coplannedevents">
                            Co-planned Events
                          </Tabs.Tab>
                          <Tabs.Tab value="rsvpevents">Event RSVP’s</Tabs.Tab>
                        </Tabs.List>
                      )}

                      <Tabs.Panel value="userevents">
                        <Card bg={"#2B2B2B"} c={"#fff"} radius={"lg"} p={6}>
                          <ScrollArea.Autosize
                            mah={250}
                            p={10}
                            type="scroll"
                            scrollbarSize={7}
                            offsetScrollbars
                          >
                            <PpTable
                              headers={eventsCreatedTableHeaders}
                              rowData={eventsFilteredRows}
                              totalItems={userFilteredEvents?.length}
                              activePage={activePage}
                              setActivePage={setActivePage}
                              className={`${classes.noHeaderBorder} ${classes.noRowBorder}`}
                              isLoading={isFetchingFilteredEvents}
                              rowsPerPage={10}
                              showPagination={false}
                            />
                          </ScrollArea.Autosize>
                        </Card>
                      </Tabs.Panel>

                      <Tabs.Panel value="coplannedevents">
                        <Card bg={"#2B2B2B"} c={"#fff"} radius={"lg"} p={6}>
                          <ScrollArea.Autosize
                            mah={250}
                            p={10}
                            type="scroll"
                            scrollbarSize={7}
                            offsetScrollbars
                          >
                            <PpTable
                              headers={eventsCreatedTableHeaders}
                              rowData={eventsFilteredRows}
                              totalItems={userFilteredEvents?.length}
                              activePage={activePage}
                              setActivePage={setActivePage}
                              className={`${classes.noHeaderBorder} ${classes.noRowBorder}`}
                              isLoading={isFetchingFilteredEvents}
                              rowsPerPage={10}
                              showPagination={false}
                            />
                          </ScrollArea.Autosize>
                        </Card>
                      </Tabs.Panel>

                      <Tabs.Panel value="rsvpevents">
                        <Card bg={"#2B2B2B"} c={"#fff"} radius={"lg"} p={6}>
                          <ScrollArea.Autosize
                            mah={250}
                            p={10}
                            type="scroll"
                            scrollbarSize={7}
                            offsetScrollbars
                          >
                            <PpTable
                              headers={eventsCreatedTableHeaders}
                              rowData={eventsFilteredRows}
                              totalItems={userFilteredEvents?.length}
                              activePage={activePage}
                              setActivePage={setActivePage}
                              className={`${classes.noHeaderBorder} ${classes.noRowBorder}`}
                              isLoading={isFetchingFilteredEvents}
                              rowsPerPage={10}
                              showPagination={false}
                            />
                          </ScrollArea.Autosize>
                        </Card>
                      </Tabs.Panel>
                    </Tabs>
                  </Card>
                </Flex>
              </Box>
            </Flex>

            {/* Recent Transactions */}
            <Card bg={"#222222E5"} radius={"lg"} p={24} mt={20}>
              <Text fw={700}>Recent Transactions</Text>

              <PpTable
                headers={tableHeaders}
                rowData={rows}
                totalItems={recentTransactions?.length}
                activePage={activePage}
                setActivePage={setActivePage}
                rowsPerPage={10}
                addOnStyle={`${classes.noRowBorder}`}
                emptyState={transactionEmptyState}
                isLoading={isFetchingUser}
                mt={10}
              />
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="events">
            <PpTable
              headers={profileEventsableHeaders}
              rowData={profileEventsRows}
              totalItems={userEventsData?.length}
              activePage={activePage}
              setActivePage={setActivePage}
              isLoading={isFetchingUserEvents}
              rowsPerPage={10}
              hasActions
              emptyState={eventEmptyState}
              filters={eventFilters}
            />
          </Tabs.Panel>

          <Tabs.Panel value="transactions">
            <PpTable
              headers={profileTransactionsTableHeaders}
              rowData={profileTransactionsRows}
              totalItems={totalTransactionItems}
              activePage={activeTransactionsPage}
              setActivePage={setActiveTransactionsPage}
              rowsPerPage={rowsPerPage}
              isLoading={isFetchingTransactions}
              hasActions
              emptyState={transactionEmptyState}
              filters={transactionFilters}
              query={query}
              handleQuery={setQuery}
            />
          </Tabs.Panel>

          <Tabs.Panel value="activities">
            <PpTable
              headers={profileActivityTableHeaders}
              rowData={profileActivityRows}
              totalItems={userActivities?.length}
              activePage={activePage}
              setActivePage={setActivePage}
              isLoading={isFetchingActivities}
              rowsPerPage={10}
              hasActions
            />
          </Tabs.Panel>
        </Tabs>
      </Box>

      {/* Delete User Modal */}
      <ConfirmationModal
        type="error"
        opened={deleteModalOpened}
        close={closeDeleteModal}
        title="Delete User?"
        message="Do you really want to delete this user?"
        actions={
          <Flex justify="center" gap={14}>
            <Button
              radius="xl"
              className={classes.btnNeutral}
              onClick={closeDeleteModal}
              disabled={isLoading}
              miw="50%"
            >
              Cancel
            </Button>
            <Button
              radius="xl"
              className={classes.btnDanger}
              onClick={handleDelete}
              loading={isLoading}
              miw="50%"
            >
              Delete User
            </Button>
          </Flex>
        }
      />

      {/* Suspend User Modal */}
      <ConfirmationModal
        type="warning"
        opened={suspendModalOpened}
        close={closeSuspendModal}
        title={isUserSuspended ? "Unblock User?" : "Suspend User?"}
        message={`Do you really want to ${
          isUserSuspended ? "unblock" : "suspend"
        } this user?`}
        actions={
          <Flex justify="center" gap={14}>
            <Button
              radius="xl"
              className={classes.btnNeutral}
              onClick={closeSuspendModal}
              disabled={isLoading}
              miw="50%"
            >
              Cancel
            </Button>
            <Button
              radius="xl"
              className={
                isUserSuspended ? classes.btnWhite : classes.btnWarning
              }
              onClick={handleSuspend}
              loading={isLoading}
              miw="50%"
            >
              {isUserSuspended ? "Unblock User" : "Suspend User"}
            </Button>
          </Flex>
        }
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        type="success"
        opened={successModalOpened}
        close={closeSuccessModal}
        title="Successful"
        message={successMessage}
        actions={
          <Flex justify="center">
            <Button
              radius="xl"
              w="50%"
              className={classes.btnWhite}
              onClick={closeSuccessModal}
            >
              Done
            </Button>
          </Flex>
        }
      />

      {/* Reset PIN Warning Modal */}
      <ConfirmationModal
        type="warning"
        opened={resetPinModalOpened}
        close={closeResetPinModal}
        title="Reset PIN?"
        message="This will reset the user's transaction PIN to 0000. They will be required to change it on next login."
        actions={
          <Flex justify="center" gap={14}>
            <Button
              radius="xl"
              className={classes.btnNeutral}
              onClick={closeResetPinModal}
              disabled={isLoading}
              miw="50%"
            >
              Cancel
            </Button>
            <Button
              radius="xl"
              className={classes.btnWarning}
              onClick={handleResetPin}
              loading={isLoading}
              miw="50%"
            >
              Reset PIN
            </Button>
          </Flex>
        }
      />

      {/* Reset PIN Success Modal */}
      <ConfirmationModal
        type="success"
        opened={resetPinSuccessModalOpened}
        close={closeResetPinSuccessModal}
        title="Successful"
        message="PIN has been reset to 0000"
        actions={
          <Flex justify="center">
            <Button
              radius="xl"
              w="50%"
              className={classes.btnWhite}
              onClick={closeResetPinSuccessModal}
            >
              Done
            </Button>
          </Flex>
        }
      />

      {/* Reset PIN Error Modal */}
      <ConfirmationModal
        type="error"
        opened={resetPinErrorModalOpened}
        close={closeResetPinErrorModal}
        title="Reset Failed"
        message="Something went wrong while resetting the PIN. Please try again."
        actions={
          <Flex justify="center">
            <Button
              radius="xl"
              className={classes.btnDanger}
              onClick={() => {
                closeResetPinErrorModal();
              }}
              miw="50%"
            >
              Okay
            </Button>
          </Flex>
        }
      />

      <TransactionModal
        opened={recentTransactionModalOpened}
        close={closeRecentTransactionModal}
        transactionRef={selectedRef}
      />

      <TransactionModal
        opened={transactionModalOpened}
        close={closeTransactionModal}
        transactionRef={selectedRef}
      />

      <EditUserModal
        opened={editModalOpened}
        close={closeEditModal}
        userProfile={userProfile}
      />
    </AppLayout>
  );
};

export default UserDetails;

const ProfileDetail = ({
  title,
  value,
}: {
  title: string;
  value: string | React.ReactNode;
}) => {
  return (
    <Flex gap={16}>
      <Text fz={13} c="#D9D9D9B2" flex="25% 0 0">
        {title}
      </Text>
      <Flex gap={4} flex="75% 0 0">
        <Text fz={13} c="#D9D9D9B2">
          :
        </Text>
        <Text fz={13} c="#fff">
          {value || "N/A"}
        </Text>
      </Flex>
    </Flex>
  );
};
