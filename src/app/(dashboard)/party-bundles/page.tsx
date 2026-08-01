"use client";

import {
  AddPartyBundle,
  ConfirmationModal,
  FormatDate,
  PartyBundleDetailsModal,
  PpTable,
  StatusBadge,
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components";
import { IconEllipsisH } from "@/icons";
import { AppLayout } from "@/layout";
import {
  giftSalesData,
  partyBundlesFilters,
  partyBundlesEmptyState,
  salesEmptyState,
  salesFilters,
  formatStringAmount,
} from "@/utils";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import { useState } from "react";
import classes from "@/styles/General.module.css";
import { NoImage } from "@/images";
import { useQuery } from "@tanstack/react-query";
import { GetPartyBundles, GetPartyBundlesOverview } from "@/services/api";

const tableHeaders = [
  "Product",
  "Product ID",
  "Price",
  "Purchased",
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

const PartyBundles = () => {
  const [activePage, setActivePage] = useState(1);
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [confirmationType, setConfirmationType] = useState<"success" | "error">(
    "success"
  );
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [
    bundleModalOpened,
    { open: openBundleModal, close: closeBundleModal },
  ] = useDisclosure(false);
  const [
    addBundleModalOpened,
    { open: openAddBundleModal, close: closeAddBundleModal },
  ] = useDisclosure(false);
  const [
    confirmationModalOpened,
    { open: openConfirmationModal, close: closeConfirmationModal },
  ] = useDisclosure(false);

  const { data: partyBundlesOverview, isFetching: isFetchingOverview } =
    useQuery({
      queryKey: ["partyBundlesOverview"],
      queryFn: () => GetPartyBundlesOverview(),
    });

  const overviewData = partyBundlesOverview?.data;

  const {
    data: partyBundles,
    isFetching: isFetchingBundles,
    refetch,
  } = useQuery({
    queryKey: ["partyBundles", activePage],
    queryFn: () => GetPartyBundles(),
  });

  const bundlesData = partyBundles?.data || [];

  const rows = bundlesData?.map((data) => {
    return (
      <Table.Tr
        key={data.id}
        onClick={() => handleBundleClick(String(data.id))}
        className={`cursor-pointer`}
      >
        <Table.Td>
          <Flex align="center" gap={8}>
            <Box className="relative w-10 h-10 bg-white overflow-hidden">
              <Image
                src={data?.images[0] || NoImage}
                alt="product image"
                fill
              />
            </Box>
            <Text fz={14}>{data?.name || "N/A"}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>#{data?.productId || "N/A"}</Table.Td>
        <Table.Td>₦{formatStringAmount(data?.amount || "0.00")}</Table.Td>
        <Table.Td>{data?.quantity || 0}</Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.status || ""} />
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

  const salesRows = giftSalesData?.map((data) => {
    return (
      <Table.Tr
        key={data.id}
        onClick={() =>
          handleOpenSalesModal("5ac2f0a1-9f90-4cfa-bc61-b9309ba5e200")
        }
        className={`cursor-pointer`}
      >
        <Table.Td>
          <Flex align="center" gap={8}>
            <Box className="relative w-10 h-10 bg-white overflow-hidden">
              <Image src={data?.image || NoImage} alt="product image" fill />
            </Box>
            <Text fz={14}>{data?.name || "N/A"}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>#{data?.id || "N/A"}</Table.Td>
        <Table.Td>₦{formatStringAmount(data?.price || "0.00")}</Table.Td>
        <Table.Td>{data?.quantity.toLocaleString() || 0}</Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar size="sm" src={data?.receivedBy?.avatar} alt="avatar" />
            <Text fz={14}>{data?.receivedBy?.name || "N/A"}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.dateBought} formatType="datePipeTime" />
        </Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.status || ""} />
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

  const handleBundleClick = (id: string) => {
    setSelectedBundleId(id);
    openBundleModal();
  };

  const handleOpenSalesModal = (id: string) => {
    console.log(id);
  };

  return (
    <AppLayout title="Party Bundles">
      <Box pos="relative">
        <Group
          mb={{ base: 20, md: 0 }}
          pos={{ base: "relative", md: "absolute" }}
          top={0}
          right={0}
        >
          <Button
            className={classes.btnWhite}
            onClick={openAddBundleModal}
            px={30}
            radius="xl"
          >
            Add Party Bundle
          </Button>
        </Group>
        <Tabs defaultValue="bundles">
          <Tabs.List>
            <Tabs.Tab value="bundles">Bundles</Tabs.Tab>
            <Tabs.Tab value="sales">Sales</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="bundles">
            <Flex direction={{ base: "column", md: "row" }} gap={20}>
              {isFetchingOverview ? (
                <SummaryCardSkeleton />
              ) : (
                <>
                  <SummaryCard
                    title="Items sold"
                    value={overviewData?.totalItemsSold}
                  />
                  <SummaryCard
                    title="Revenue Generated"
                    value={overviewData?.totalRevenue}
                  />
                  <SummaryCard
                    title="Order Fulfilment"
                    value={`${overviewData?.completedOrders} (${overviewData?.completionPercentage})`}
                  />
                </>
              )}
            </Flex>

            {/* Table */}
            <PpTable
              headers={tableHeaders}
              rowData={rows}
              totalItems={bundlesData?.length}
              activePage={activePage}
              setActivePage={setActivePage}
              isLoading={isFetchingBundles}
              rowsPerPage={10}
              hasActions
              emptyState={partyBundlesEmptyState}
              filters={partyBundlesFilters}
              mt={20}
            />
          </Tabs.Panel>

          <Tabs.Panel value="sales">
            <PpTable
              headers={salesTableHeaders}
              rowData={salesRows}
              totalItems={giftSalesData?.length}
              activePage={activePage}
              setActivePage={setActivePage}
              rowsPerPage={10}
              hasActions
              emptyState={salesEmptyState}
              filters={salesFilters}
            />
          </Tabs.Panel>
        </Tabs>
      </Box>

      {/* Add a bundle modal */}
      <AddPartyBundle
        opened={addBundleModalOpened}
        close={closeAddBundleModal}
        refetch={refetch}
        triggerConfirmation={openConfirmationModal}
        setConfirmationType={setConfirmationType}
        setConfirmationMessage={setConfirmationMessage}
      />

      {/* Bundle modal */}
      <PartyBundleDetailsModal
        opened={bundleModalOpened}
        close={closeBundleModal}
        id={selectedBundleId}
        refetch={refetch}
        setConfirmationMessage={setConfirmationMessage}
        setConfirmationType={setConfirmationType}
        openConfirmationModal={openConfirmationModal}
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

export default PartyBundles;
