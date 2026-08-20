"use client";

import {
  DateFilter,
  DownloadCsvButton,
  FormatDate,
  OrderDetailsModal,
  OrderStatusModal,
  PendingBackend,
  PpTable,
  StatusBadge,
  StatusFilter,
  TableToolbar,
} from "@/components";
import { AppLayout } from "@/layout";
import { GetAllOrders } from "@/services/api";
import { Order } from "@/services/api/order-management/order.types";
import {
  convertToNaira,
  formatLocalDate,
  formatStatusLabel,
  formatStringAmount,
  generateCsvSuffix,
  isEndpointUnavailable,
  orderStatuses,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import {
  Avatar,
  Box,
  Divider,
  Flex,
  Menu,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

const tableHeaders = [
  "Payment Reference",
  "Reciever's Name",
  "Order Amount",
  "Email Address",
  "Phone Number",
  "Date Ordered",
  "Date Concluded",
  "Status",
];

const OrderManagement = () => {
  const [activePage, setActivePage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>("");
  const [opened, { open, close }] = useDisclosure(false);
  const [
    openedStatusModal,
    { open: openStatusModal, close: closeStatusModal },
  ] = useDisclosure(false);
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [debouncedQuery] = useDebouncedValue(query, 500);

  const [draftStatuses, setDraftStatuses] = useState<string[]>([]);
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
  const [appliedDateRange, setAppliedDateRange] = useState<
    [string | null, string | null]
  >([null, null]);

  const statusParam = appliedStatuses.length ? appliedStatuses.join(",") : "";

  //Fetching orders data
  const {
    data: orders,
    isFetching: isFetchingOrders,
    refetch,
    error: ordersError,
  } = useQuery({
    retry: retryUnlessUnavailable,
    queryKey: [
      "orders",
      activePage,
      rowsPerPage,
      appliedStatuses,
      appliedDateRange,
      debouncedQuery,
    ],
    queryFn: () =>
      GetAllOrders(
        String(activePage),
        String(rowsPerPage),
        debouncedQuery,
        appliedDateRange[0] || "",
        appliedDateRange[1] || "",
        statusParam
      ),
  });
  //const orderMetrics = orders?.data.metrics;
  const ordersData = orders?.data.list || [];
  const totalItems = orders?.data.pagination?.total;

  /* const ordersSummary = [
    {
      label: "Total Orders",
      value: orderMetrics?.totalOrders || 0,
    },
    {
      label: "Completed Orders",
      value: orderMetrics?.completedOrders || 0,
    },
    {
      label: "Pending Orders",
      value: orderMetrics?.newOrders || 0,
    },
  ]; */

  const handleDateChange = (range: [Date | null, Date | null]) => {
    // Always sync UI
    setDateRange(range);

    // Clear case
    if (!range[0] || !range[1]) {
      setAppliedDateRange([null, null]);
      return;
    }

    // Apply case
    setAppliedDateRange([formatLocalDate(range[0]), formatLocalDate(range[1])]);
  };

  const handleOpenModal = (order: Order) => {
    setSelectedOrderId(String(order.id));
    open();
  };

  const handleOpenStatusModal = (order: Order, status: string) => {
    setSelectedOrderId(String(order.id));
    setSelectedStatus(status);
    openStatusModal();
  };

  const selectedOrder = ordersData.find(
    (order) => order.id.toString() === selectedOrderId
  );

  useEffect(() => {
    if (selectedOrder) {
      setSelectedStatus(selectedOrder?.deliveryStatus);
    }
  }, [selectedOrder]);

  const handleDownloadCSV = () => {
    if (!ordersData || ordersData.length === 0) return;
    const suffix = generateCsvSuffix(
      appliedStatuses.join(", "),
      appliedDateRange
    );

    const headers = [
      "Payment Reference",
      "Reciever's Name",
      "Order Amount",
      "Email Address",
      "Phone Number",
      "Date Ordered",
      "Date Concluded",
      "Status",
    ];

    const rows = ordersData.map((order) => [
      order?.reference || "N/A",
      order?.receiver?.name || "N/A",
      formatStringAmount(order?.orderAmount) || "N/A",
      order?.receiver?.email || "N/A",
      order?.receiver?.phone || "N/A",
      order?.createdAt || "N/A",
      order?.completedAt || "N/A",
      order?.status || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `PV Orders${suffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rows = ordersData?.map((data) => {
    const isConvertedToCash = data?.status === "Converted to Cash";

    const badgeStatus = isConvertedToCash
      ? data?.status
      : formatStatusLabel(data?.deliveryStatus || "");

    return (
      <Table.Tr
        key={data?.id}
        onClick={() => handleOpenModal(data)}
        className={`cursor-pointer`}
      >
        <Table.Td>#{data?.reference || "N/A"}</Table.Td>

        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              //src={data?.creator?.avatar || undefined}
              name={data?.receiver?.name || "U"}
              size={30}
              radius="xl"
              alt="avatar"
            />
            <Box maw={180}>
              <Text fz={14} c="#FFFFFFCC" tt="capitalize" truncate="end">
                {data?.receiver?.name || "-"}
              </Text>
            </Box>
          </Flex>
        </Table.Td>

        <Table.Td>
          ₦ {formatStringAmount(convertToNaira(data?.orderAmount) || "0.00")}
        </Table.Td>

        <Table.Td>{data?.receiver?.email || "N/A"}</Table.Td>

        <Table.Td>{data?.receiver?.phone || "N/A"}</Table.Td>

        {/* <Table.Td>
          <Flex align="center" justify="space-between" miw={240} pr={10}>
            <Flex align="center" gap={10}>
              <BackgroundImage
                w={36}
                h={36}
                radius={4}
                src={data?.items?.[0]?.image || NoImage.src}
              />
              <Flex direction="column">
                <Text fz={14} c="#FFFFFFCC">
                  {data?.items?.[0]?.name || "-"}
                </Text>
                <Text fz={13} c="#FFFFFF80">
                  ₦ {formatStringAmount(data?.items?.[0]?.price || "0.00")}
                </Text>
              </Flex>
            </Flex>

            {data?.items?.length > 1 && (
              <Flex
                align="center"
                justify="center"
                bg="var(--fj-surface-elevated)"
                w={20}
                h={20}
                p="md"
                className="rounded-[4px]"
              >
                <Text fz={14} c="#D9D9D9">
                  +{data?.items?.length - 1}
                </Text>
              </Flex>
            )}
          </Flex>
        </Table.Td> */}

        <Table.Td>
          <FormatDate data={data?.createdAt} formatType="fullDate" />
        </Table.Td>

        <Table.Td>
          <FormatDate data={data?.completedAt} formatType="fullDate" />
        </Table.Td>

        <Table.Td miw={120}>
          <Menu position="bottom-end" disabled={isConvertedToCash}>
            <Menu.Target>
              <Flex
                onClick={(e) => e.stopPropagation()}
                align="center"
                gap={2}
                className="cursor-pointer"
              >
                <StatusBadge
                  status={badgeStatus}
                  px={0}
                  useAltColor
                  hasDropdown
                  fullWidth
                />
              </Flex>
            </Menu.Target>

            <Menu.Dropdown
              bg="var(--fj-surface-elevated)"
              style={{ border: "1px solid #1C1C1C", borderRadius: "12px" }}
            >
              {orderStatuses.map((status, index) => (
                <React.Fragment key={status}>
                  <Menu.Item
                    ta="left"
                    py={4}
                    px={0}
                    pr={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenStatusModal(data, status);
                    }}
                  >
                    <StatusBadge status={status} useAltColor hasDot />
                  </Menu.Item>

                  {index !== orderStatuses.length - 1 && (
                    <Divider color="#1C1C1C" my={4} />
                  )}
                </React.Fragment>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  if (isEndpointUnavailable(ordersError)) {
    return (
      <AppLayout title="Order Tracking">
        <PendingBackend
          feature="Order tracking"
          endpoints={[
            "GET /admin/order-management",
            "PATCH /admin/gift-orders/:id/status",
          ]}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Order Tracking">
      <Flex direction="column" gap={20}>
        {/* Summary */}
        {/* <ScrollArea scrollbarSize={0}>
          {isFetchingOrders ? (
            <Flex align="center" gap={16}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} radius="md" h={120} w="auto" miw={240} />
              ))}
            </Flex>
          ) : (
            <Flex align="center" gap={16}>
              {ordersSummary?.map((summary) => (
                <Card
                  key={summary.label}
                  w="auto"
                  miw={240}
                  bg="var(--fj-surface)"
                  p="md"
                  radius={16}
                >
                  <SummaryItem
                    label={summary.label}
                    value={
                      <Text fz={20} fw={500} c="#FFFFFF">
                        {summary.value?.toLocaleString()}
                      </Text>
                    }
                  />
                </Card>
              ))}
            </Flex>
          )}
        </ScrollArea> */}

        {/* Filter & Search */}
        {!isFetchingOrders && (
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            gap={10}
            bg="var(--fj-bg)"
            py={10}
            className="sticky top-14 z-10"
            wrap="wrap"
          >
            <Flex align="center" gap={16} wrap="wrap">
              <Text>Filter by:</Text>

              {/* Status filter */}
              <StatusFilter
                value={draftStatuses}
                onApply={(statuses) => {
                  setDraftStatuses(statuses);
                  setAppliedStatuses(statuses);
                }}
              />

              {/* Date filter */}
              <DateFilter
                value={dateRange}
                onChange={handleDateChange}
                hasControl
              />
            </Flex>

            <TableToolbar
              query={query}
              onQueryChange={setQuery}
              searchPlaceholder="Search orders"
              action={<DownloadCsvButton onClick={handleDownloadCSV} />}
            />
          </Flex>
        )}

        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={activePage}
          setActivePage={setActivePage}
          isLoading={isFetchingOrders}
          rowsPerPage={rowsPerPage}
        />
      </Flex>

      {selectedOrder && (
        <OrderStatusModal
          order={selectedOrder}
          selectedStatus={selectedStatus}
          opened={openedStatusModal}
          close={closeStatusModal}
          refetch={refetch}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal
          opened={opened}
          onClose={close}
          data={selectedOrder}
          refetch={refetch}
        />
      )}
    </AppLayout>
  );
};

export default OrderManagement;
