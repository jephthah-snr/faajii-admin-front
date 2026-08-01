"use client";

import {
  AddGift,
  ConfirmationModal,
  FormatDate,
  PpTable,
  ProductDetailsModal,
  StatusBadge,
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components";
import { IconEllipsisH } from "@/icons";
import { AppLayout } from "@/layout";
import {
  formatStringAmount,
  giftShopEmptyState,
  giftShopFilters,
  salesEmptyState,
  salesFilters,
} from "@/utils";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  Menu,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import Image from "next/image";
import { useState } from "react";
import classes from "@/styles/General.module.css";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { GetAllGifts, GetGiftSales, GetGiftsStats } from "@/services/api";
import { NoImage } from "@/images";

const tableHeaders = [
  "Product",
  "Product ID",
  "Price",
  "Stock",
  "Purchased",
  "Total",
  "Amount Generated",
  "Status",
  "",
];
const salesTableHeaders = [
  "Product",
  "Product ID",
  "Price",
  "Quantity",
  "Received By",
  "Date Bought",
  "Status",
  "",
];

const GiftShop = () => {
  const [activePage, setActivePage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [confirmationType, setConfirmationType] = useState<"success" | "error">(
    "success"
  );
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const [giftModalOpened, { open: openGiftModal, close: closeGiftModal }] =
    useDisclosure(false);
  const [
    addGiftModalOpened,
    { open: openAddGiftModal, close: closeAddGiftModal },
  ] = useDisclosure(false);
  const [
    confirmationModalOpened,
    { open: openConfirmationModal, close: closeConfirmationModal },
  ] = useDisclosure(false);

  //Fetching gifts stats data
  const {
    data: giftsStats,
    isFetching: isFetchingGiftsStats,
    refetch: refetchGiftsStats,
  } = useQuery({
    queryKey: ["giftsStats"],
    queryFn: () => GetGiftsStats(),
  });
  const giftsStatsD = giftsStats?.data;

  //Fetching gifts data
  const {
    data: giftShopData,
    isFetching: isFetchingGifts,
    refetch: refetchGifts,
  } = useQuery({
    queryKey: ["gifts"],
    queryFn: () => GetAllGifts(),
  });
  const giftShopDataD = giftShopData?.data;

  //Fetching gift sales data
  const { data: giftSalesData, isFetching: isFetchingGiftSales } = useQuery({
    queryKey: ["giftSales"],
    queryFn: () => GetGiftSales(),
  });
  const giftSalesDataD = giftSalesData?.data?.data;

  const handleRefetch = () => {
    refetchGifts();
    refetchGiftsStats();
  };

  const rows = giftShopDataD?.map((data) => {
    return (
      <Table.Tr
        key={data.id}
        onClick={() => handleOpenGiftModal(data.id)}
        className={`cursor-pointer`}
      >
        <Table.Td>
          <Flex align="center" gap={8}>
            <Box className="w-10 h-10 bg-white relative overflow-hidden">
              <Image
                src={
                  data?.images && data?.images?.length > 0
                    ? data?.images[0]
                    : NoImage
                }
                alt="product image"
                fill
              />
            </Box>
            <Text fz={14}>{data?.name}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>#{data?.productId || "N/A"}</Table.Td>
        <Table.Td>₦{formatStringAmount(data?.amount || 0.0)}</Table.Td>
        <Table.Td>{data?.quantity || 0}</Table.Td>
        <Table.Td>{data?.unitsSold || 0}</Table.Td>
        <Table.Td>{data?.total || 0}</Table.Td>
        <Table.Td>₦{formatStringAmount(data?.totalSales || 0.0)}</Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.status || "Unknown"} />
        </Table.Td>
        <Table.Td>
          <Menu shadow="md">
            <Menu.Target>
              <ActionIcon
                variant="transparent"
                aria-label="More"
                onClick={(event) => event.stopPropagation()}
              >
                <Image
                  src={IconEllipsisH}
                  alt="icon"
                  style={{ width: "70%", height: "70%" }}
                />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
              <Menu.Item>Edit</Menu.Item>
              <Menu.Divider />
              <Menu.Item>Archive</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  const salesRows = giftSalesDataD?.map((data) => {
    return (
      <Table.Tr
        key={data.id}
        onClick={() => handleOpenSalesModal(data?.orderRef)}
        className={`cursor-pointer`}
      >
        <Table.Td>
          <Flex align="center" gap={8}>
            <Box className="relative w-10 h-10 bg-white overflow-hidden">
              <Image
                src={
                  data?.productImages && data?.productImages?.length > 0
                    ? data?.productImages[0]
                    : NoImage
                }
                alt="product image"
                fill
              />
            </Box>
            <Text fz={14}>{data?.productName || "N/A"}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>#{data?.productId || "-"}</Table.Td>
        <Table.Td>{data?.price || "₦0.00"}</Table.Td>
        <Table.Td>{data?.quantity || "N/A"}</Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar size="sm" src={data?.receivedBy?.avatar} alt="avatar" />
            <Text fz={14}>{data?.receivedBy || "N/A"}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.date} formatType="datePipeTime" />
        </Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.paymentStatus || "N/A"} />
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

  const handleOpenGiftModal = (id: number) => {
    setSelectedProductId(id.toString());
    openGiftModal();
  };

  const handleOpenSalesModal = (orderRef: string) => {
    console.log(orderRef);
  };

  return (
    <AppLayout title="Gift Shop">
      <Box pos="relative">
        <Group pos="absolute" top={0} right={0}>
          <Button
            className={classes.btnWarning}
            onClick={openAddGiftModal}
            px={30}
            radius="xl"
          >
            Add a Gift
          </Button>
        </Group>
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="sales">Sales</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={20}
              className="overflow-x-hidden md:overflow-x-auto hide-scrollbar"
            >
              {isFetchingGiftsStats ? (
                <SummaryCardSkeleton />
              ) : (
                <>
                  <SummaryCard
                    title="Inventory Volume"
                    miw={{ base: "auto", md: 240 }}
                    value={giftsStatsD?.inventoryVolume?.toLocaleString() ?? 0}
                  />
                  <SummaryCard
                    title="Inventory Value"
                    miw={{ base: "auto", md: 240 }}
                    value={formatStringAmount(giftsStatsD?.inventoryValue ?? 0)}
                    isCurrency
                  />
                  <SummaryCard
                    title="Items Sold"
                    miw={{ base: "auto", md: 240 }}
                    value={giftsStatsD?.itemsSold?.toLocaleString() ?? 0}
                  />
                  <SummaryCard
                    title="Revenue Generated"
                    miw={{ base: "auto", md: 240 }}
                    value={formatStringAmount(
                      giftsStatsD?.reveneGenerated ?? 0
                    )}
                    isCurrency
                  />
                  <SummaryCard
                    title="Order Fulfilment"
                    miw={{ base: "auto", md: 240 }}
                    value={giftsStatsD?.orderFufilment ?? "0"}
                  />
                </>
              )}
            </Flex>

            {/* Table */}
            <PpTable
              headers={tableHeaders}
              rowData={rows}
              totalItems={giftShopDataD?.length}
              activePage={activePage}
              setActivePage={setActivePage}
              rowsPerPage={10}
              isLoading={isFetchingGifts}
              mt={20}
              hasActions
              emptyState={giftShopEmptyState}
              filters={giftShopFilters}
            />
          </Tabs.Panel>

          <Tabs.Panel value="sales">
            <PpTable
              headers={salesTableHeaders}
              rowData={salesRows}
              totalItems={giftSalesDataD?.length}
              activePage={activePage}
              setActivePage={setActivePage}
              isLoading={isFetchingGiftSales}
              rowsPerPage={10}
              hasActions
              emptyState={salesEmptyState}
              filters={salesFilters}
            />
          </Tabs.Panel>
        </Tabs>
      </Box>

      <ProductDetailsModal
        opened={giftModalOpened}
        close={closeGiftModal}
        type="gift"
        id={selectedProductId}
      />

      {/* Add a gift modal */}
      <AddGift
        refetch={handleRefetch}
        opened={addGiftModalOpened}
        close={closeAddGiftModal}
        triggerConfirmation={openConfirmationModal}
        setConfirmationType={setConfirmationType}
        setConfirmationMessage={setConfirmationMessage}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        type={confirmationType}
        opened={confirmationModalOpened}
        close={closeConfirmationModal}
        title={confirmationType === "success" ? "Successful" : "Error"}
        message={confirmationMessage}
        actions={
          <Flex justify="center">
            <Button
              radius="xl"
              w="50%"
              className={classes.btnWhite}
              onClick={closeConfirmationModal}
            >
              Done
            </Button>
          </Flex>
        }
      />
    </AppLayout>
  );
};

export default GiftShop;
