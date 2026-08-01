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
  Menu,
  Rating,
  ScrollArea,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import classes from "@/styles/General.module.css";
import {
  ConfirmationModal,
  VendorDetailsSkeleton,
  FormatDate,
  PpTable,
  StatusBadge,
  SummaryItem,
  VendorOrderModal,
  VendorOverviewPanel,
} from "@/components";
import {
  formatStatusLabel,
  formatStringAmount,
  getPhoneCountryFlag,
  initialsColors,
  rowsPerPage,
} from "@/utils";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { IconEllipsisV } from "@/icons";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { vendorTabTypes } from "@/services/api/utils/utils.types";
import {
  VendorDetails,
  VendorOrders,
  VendorTransaction,
} from "@/services/api/vendor-management/vendor.types";
import {
  DeleteVendor,
  GetVendorDetails,
  ToggleVendorStatus,
  RevokeVendorOrder,
} from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const orderHeaders = [
  "Event Details",
  "Timeline",
  "Event Creator",
  "Payment",
  "Status",
  "Action",
];

const VendorDetailsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<vendorTabTypes>("overview");
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserSuspended, setIsUserSuspended] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [title, setTitle] = useState("");

  const [modalState, setModalState] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
    actionLabel: "",
    cancelLabel: "Cancel",
    action: () => {},
  });

  const effectiveTab = activeTab === "team" ? "overview" : activeTab;

  //Fetching vendor details
  const {
    data: vendorDetails,
    isFetching: isFetchingDetails,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["vendor-details", id, effectiveTab],
    queryFn: () => GetVendorDetails(id, effectiveTab),
  });

  const vendorOverview =
    activeTab === "overview" || activeTab === "team"
      ? (vendorDetails?.data as VendorDetails)
      : null;
  const vendorOrders =
    activeTab === "orders" ? (vendorDetails?.data as VendorOrders) : null;
  const vendorTransactions =
    activeTab === "transactions"
      ? (vendorDetails?.data as VendorTransaction[])
      : [];

  const revokeOrderMutation = useMutation({
    mutationFn: (orderId: string) => RevokeVendorOrder(id, orderId),
    onSuccess: () => {
      closeVendorOrderModal();
      queryClient.invalidateQueries({ queryKey: ["vendor-details", id] });
      openModal("success", { message: "Vendor booking has been revoked" });
    },
    onError: (error: any) => {
      openModal("error", {
        message: error?.response?.data?.message || "Unable to revoke booking",
      });
    },
  });

  // Set vendor title
  useEffect(() => {
    if (vendorOverview) {
      setTitle(vendorOverview?.vendor?.name);
    }
  }, [vendorOverview]);

  const teamMembersWithFlags = useMemo(() => {
    return vendorOverview?.teamMembers?.map((member: any) => ({
      ...member,
      flag: getPhoneCountryFlag(member?.phoneNumber || ""),
    }));
  }, [vendorOverview?.teamMembers]);

  // Overview summary
  const overviewSummary = [
    {
      label: "Total Orders Completed",
      value: vendorOverview?.statistics?.totalOrdersCompleted,
    },
    {
      label: "Ratings",
      value: vendorOverview?.statistics?.averageRating,
      isRating: true,
    },
    {
      label: "Total Amount Made",
      value: `₦ ${formatStringAmount(
        String(vendorOverview?.statistics?.totalAmountMade),
      )}`,
    },
  ];

  useEffect(() => {
    if (vendorOverview?.vendor?.status === "Inactive") {
      setIsUserSuspended(true);
    }
  }, [vendorOverview]);

  const [
    openedVendorOrderModal,
    { open: openVendorOrderModal, close: closeVendorOrderModal },
  ] = useDisclosure(false);

  const openModal = (type: string, options: any = {}) => {
    switch (type) {
      case "delete":
        setModalState({
          open: true,
          type,
          title: "Delete Vendor?",
          message: "Do you really want to delete this vendor?",
          actionLabel: "Delete",
          cancelLabel: "Cancel",
          action: handleDelete,
        });
        break;

      case "suspend":
        setModalState({
          open: true,
          type,
          title: isUserSuspended ? "Unblock Vendor?" : "Suspend Vendor?",
          message: `Do you really want to ${
            isUserSuspended ? "unblock" : "suspend"
          } this vendor?`,
          actionLabel: isUserSuspended ? "Unblock" : "Suspend",
          cancelLabel: "Cancel",
          action: handleSuspend,
        });
        break;

      case "error":
        setModalState({
          open: true,
          type,
          title: "Error",
          message: options.message || "Something went wrong",
          actionLabel: "Close",
          cancelLabel: "",
          action: () =>
            setModalState((prev) => ({
              ...prev,
              open: false,
            })),
        });
        break;

      case "success":
        setModalState({
          open: true,
          type,
          title: "Successful",
          message: options.message || "Operation completed successfully",
          actionLabel: "Done",
          cancelLabel: "",
          action: () => setModalState((prev) => ({ ...prev, open: false })),
        });
        break;
      default:
        break;
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await DeleteVendor(String(id));
      openModal("success", {
        message: "Vendor has been deleted successfully",
      });
      // Navigate back to user list after successful deletion
      setTimeout(() => {
        router.push("/vendor-management");
      }, 1000);
    } catch (error: any) {
      console.error("Error deleting vendor:", error);
      openModal("error", {
        message: error?.response?.data?.message || "Error deleting vendor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    try {
      setIsLoading(true);
      // Simulate API call

      if (isUserSuspended) {
        await ToggleVendorStatus(String(id), "active");
        openModal("success", {
          message: "Vendor has been unblocked successfully",
        });
      } else {
        await ToggleVendorStatus(String(id), "suspend");
        openModal("success", {
          message: "Vendor has been suspended successfully",
        });
      }
      refetchProfile();
    } catch (error: any) {
      console.error("Error suspending vendor:", error);
      openModal("error", {
        message: error?.response?.data?.message || "Error suspending vendor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const orderRows = vendorOrders?.orders?.map((data, index) => {
    return (
      <Table.Tr
        key={index}
        onClick={() => {
          setSelectedOrder(data);
          openVendorOrderModal();
        }}
        className={`cursor-pointer`}
      >
        <Table.Td>
          <Flex direction="column" gap={2}>
            <Text c="#F8F8F8E5" fz={14}>
              {data?.event?.name}
            </Text>
            <Text c="#FFFFFF80" fz={12}>
              {data?.event?.description}
            </Text>
          </Flex>
        </Table.Td>
        <Table.Td>
          <Flex direction="column" gap={2}>
            <Text c="#F8F8F8E5" fz={14}>
              <FormatDate
                data={data?.event?.startDate || ""}
                formatType="orderStart"
              />{" "}
              -{" "}
              <FormatDate
                data={data?.event?.endDate || ""}
                formatType="orderEnd"
              />
            </Text>
            <Text c="#FFFFFF80" fz={12}>
              <FormatDate
                data={data?.event?.startDate || ""}
                formatType="orderTime"
              />{" "}
              -{" "}
              <FormatDate
                data={data?.event?.endDate || ""}
                formatType="orderTime"
              />
            </Text>
          </Flex>
        </Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              src={data?.host?.avatar || undefined}
              name={data?.host?.name || "U"}
              color="initials"
              allowedInitialsColors={initialsColors}
              alt="avatar"
            />
            <Flex direction="column" gap={2}>
              <Text c="#F8F8F8E5" fz={14}>
                {data?.host?.name}
              </Text>
              <Text c="#FFFFFF80" fz={12}>
                {data?.host?.phone}
              </Text>
            </Flex>
          </Flex>
        </Table.Td>
        <Table.Td>
          <Flex direction="column" gap={2}>
            <Text c="#F8F8F8E5" fz={14}>
              {data?.payment?.status}
            </Text>
            <Text c="#FFFFFF80" fz={12}>
              Budget: {data?.payment?.budget}
            </Text>
          </Flex>
        </Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge
            status={formatStatusLabel(data?.status || "")}
            px={0}
            useAltColor
          />
        </Table.Td>
        <Table.Td>
          <Menu>
            <Menu.Target>
              <ActionIcon
                variant="transparent"
                aria-label="More"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={IconEllipsisV}
                  alt="icon"
                  style={{ width: "70%", height: "70%" }}
                />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  revokeOrderMutation.mutate(String(data.id));
                }}
              >
                Revoke order
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout title="Vendors" subTitle={title || "N/A"} hasBackButton>
      <Box pos="relative">
        <Group
          mb={{ base: 20, md: 0 }}
          pos={{ base: "relative", md: "absolute" }}
          top={0}
          right={0}
        >
          <Button
            className={classes.btnNeutral}
            onClick={() => openModal("suspend")}
            radius="xl"
            fz={{ base: 14, md: 16 }}
            px={{ base: 16, md: "auto" }}
          >
            {isUserSuspended ? "Unblock Vendor" : "Suspend Vendor"}
          </Button>
          <Button
            color="#FF6464"
            c="#000000"
            onClick={() => openModal("delete")}
            radius="xl"
            fz={{ base: 14, md: 16 }}
            px={{ base: 16, md: "auto" }}
          >
            Delete Vendor Profile
          </Button>
        </Group>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onChange={(value) => setActiveTab(value as vendorTabTypes)}
          keepMounted={false}
        >
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="team">Team Members</Tabs.Tab>
            <Tabs.Tab value="orders">Orders</Tabs.Tab>
            <Tabs.Tab value="transactions">Transactions</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            {isFetchingDetails ? (
              <VendorDetailsSkeleton />
            ) : (
              <Flex direction="column" gap={20} w="100%">
                {/* Summary */}
                <ScrollArea scrollbarSize={0}>
                  <Flex align="center" justify="space-between" gap={16}>
                    {overviewSummary.map((summary) => (
                      <Card
                        key={summary.label}
                        w={{ base: "auto", md: "100%" }}
                        miw={{ base: 240, md: "auto" }}
                        bg="#171717E5"
                        p="md"
                        radius={16}
                      >
                        <SummaryItem
                          label={summary.label}
                          value={
                            <Flex align="center" gap={8}>
                              {summary.isRating && (
                                <Rating
                                  color="white"
                                  classNames={{ root: classes.starRating }}
                                  defaultValue={Number(summary.value)}
                                  readOnly
                                />
                              )}
                              <Text fz={20} fw={500} c="#FFFFFF">
                                {summary.value}
                              </Text>
                            </Flex>
                          }
                        />
                      </Card>
                    ))}
                  </Flex>
                </ScrollArea>

                <VendorOverviewPanel vendorOverview={vendorOverview} />
              </Flex>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="team">
            <Flex direction="column" gap={14} p="md">
              {teamMembersWithFlags?.map((member, index) => {
                return (
                  <Flex key={index} align="center" gap={8}>
                    <Avatar
                      size="md"
                      src={member?.avatar || undefined}
                      name={member?.name || "N/A"}
                      color="initials"
                      allowedInitialsColors={initialsColors}
                      alt="avatar"
                    />
                    <Flex direction="column" gap={2}>
                      <Text c="#fff" fw={500} fz={14} tt="capitalize">
                        {member?.name || "N/A"} {member?.flag}
                      </Text>
                      <Text c="#D9D9D9B2" fz={13}>
                        {member?.phoneNumber || "N/A"}
                      </Text>
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
          </Tabs.Panel>

          <Tabs.Panel value="orders">
            <PpTable
              headers={orderHeaders}
              rowData={orderRows}
              totalItems={vendorOrders?.totalOrders || 0}
              activePage={activePage}
              setActivePage={setActivePage}
              isLoading={isFetchingDetails}
              rowsPerPage={rowsPerPage}
            />
          </Tabs.Panel>

          <Tabs.Panel value="transactions">
            <Card withBorder radius={16} p={0} bg="transparent">
              <Table.ScrollContainer minWidth={820}>
                <Table verticalSpacing="md" horizontalSpacing="lg">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Reference</Table.Th>
                      <Table.Th>Event</Table.Th>
                      <Table.Th>Purpose</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Date</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {vendorTransactions?.map((transaction) => (
                      <Table.Tr key={transaction.id}>
                        <Table.Td fw={600}>{transaction.reference}</Table.Td>
                        <Table.Td>{transaction.event?.name || "Direct payout"}</Table.Td>
                        <Table.Td>
                          <Text>{transaction.narration || transaction.category}</Text>
                          <Text c="dimmed" fz="xs" tt="capitalize">
                            {transaction.type}
                          </Text>
                        </Table.Td>
                        <Table.Td fw={600}>
                          {transaction.currency}{" "}
                          {Number(transaction.amount).toLocaleString()}
                        </Table.Td>
                        <Table.Td>
                          <StatusBadge
                            status={formatStatusLabel(transaction.status)}
                            px={0}
                            useAltColor
                          />
                        </Table.Td>
                        <Table.Td>
                          <FormatDate
                            data={transaction.createdAt}
                            formatType="fullDateTimeAlt"
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Box>

      {/* Vendor Order Modal */}
      <VendorOrderModal
        opened={openedVendorOrderModal}
        onClose={closeVendorOrderModal}
        data={selectedOrder}
        loadingRemove={revokeOrderMutation.isPending}
        onRemove={(orderId) => revokeOrderMutation.mutate(orderId)}
      />

      {/* Confirmation modal */}
      <ConfirmationModal
        type={
          modalState.type === "delete" || modalState.type === "error"
            ? "error"
            : modalState.type === "suspend"
              ? "warning"
              : "success"
        }
        opened={modalState.open}
        close={() => setModalState((prev) => ({ ...prev, open: false }))}
        title={modalState.title}
        message={modalState.message}
        actions={
          modalState.type === "success" || modalState.type === "error" ? (
            <Flex justify="center">
              <Button
                radius="xl"
                w="50%"
                className={classes.btnWhite}
                onClick={modalState.action}
              >
                {modalState.actionLabel}
              </Button>
            </Flex>
          ) : (
            <Flex justify="center" gap={14}>
              <Button
                radius="xl"
                className={classes.btnNeutral}
                onClick={() =>
                  setModalState((prev) => ({ ...prev, open: false }))
                }
                disabled={isLoading}
                miw="50%"
              >
                {modalState.cancelLabel}
              </Button>
              <Button
                radius="xl"
                className={
                  modalState.type === "delete"
                    ? classes.btnDanger
                    : isUserSuspended
                      ? classes.btnWhite
                      : classes.btnWarning
                }
                onClick={modalState.action}
                loading={isLoading}
                miw="50%"
              >
                {modalState.actionLabel}
              </Button>
            </Flex>
          )
        }
      />
    </AppLayout>
  );
};

export default VendorDetailsPage;
