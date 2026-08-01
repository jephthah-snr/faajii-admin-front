"use client";

import {
  AddDrink,
  AddDrinkBrand,
  ConfirmationModal,
  FormatDate,
  PpTable,
  ProductDetailsModal,
  StatusBadge,
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components";
import { IconEllipsisH, IconEllipsisV, IconSearch } from "@/icons";
import { AppLayout } from "@/layout";
import {
  drinkBrands,
  drinksEmptyState,
  drinksFilters,
  formatStringAmount,
  giftSalesData,
  salesEmptyState,
  salesFilters,
} from "@/utils";
import {
  ActionIcon,
  Avatar,
  BackgroundImage,
  Box,
  Button,
  Flex,
  Group,
  Menu,
  rem,
  Table,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import Image from "next/image";
import { useState } from "react";
import classes from "@/styles/General.module.css";
import { useDisclosure } from "@mantine/hooks";
import inputClasses from "@/styles/Input.module.css";
import { GetAllDrinks, GetDrinksOverview } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { NoImage } from "@/images";

const tableHeaders = [
  "Product",
  "Product ID",
  "Price",
  "Stock",
  "Purchased",
  "Total",
  "Drink Brand",
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

const Drinks = () => {
  const [activePage, setActivePage] = useState(1);
  const [drinkModalOpened, { open: openDrinkModal, close: closeDrinkModal }] =
    useDisclosure(false);
  const [
    addDrinkModalOpened,
    { open: openAddDrinkModal, close: closeAddDrinkModal },
  ] = useDisclosure(false);
  const [
    addDrinkBrandModalOpened,
    { open: openAddDrinkBrandModal, close: closeAddDrinkBrandModal },
  ] = useDisclosure(false);
  const [
    successModalOpened,
    { open: openSuccessModal, close: closeSuccessModal },
  ] = useDisclosure(false);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState("");

  //Fetching drinks overview
  const { data: drinksOverview, isFetching: isFetchingDrinksOverview } =
    useQuery({
      queryKey: ["drinksOverview"],
      queryFn: () => GetDrinksOverview(),
    });
  const drinksOverviewD = drinksOverview?.data;

  //Fetching drinks data
  const {
    data: drinks,
    isFetching: isFetchingDrinks,
    //refetch: refetchDrinks,
  } = useQuery({
    queryKey: ["drinks"],
    queryFn: () => GetAllDrinks(),
  });
  const drinksData = drinks?.data;

  /*   const handleRefetch = () => {
    refetchGifts();
    refetchGiftsStats();
  }; */

  const rows = drinksData?.map((data) => {
    return (
      <Table.Tr
        key={data?.id}
        onClick={() => handleOpenDrinkModal(data?.id)}
        className={`cursor-pointer`}
      >
        <Table.Td>
          <Flex align="center" gap={8}>
            <Box className="relative w-10 h-10 bg-white overflow-hidden">
              <Image
                //src={data?.images[0] || NoImage}
                src={NoImage}
                alt="product image"
                fill
              />
            </Box>
            <Text fz={14}>{data?.name}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>#{data?.productId || "-"}</Table.Td>
        <Table.Td>₦{formatStringAmount(data?.amount || 0.0)}</Table.Td>
        <Table.Td>{data?.quantity || "-"}</Table.Td>
        <Table.Td>{data?.unitsSold || 0}</Table.Td>
        <Table.Td>{data?.total || 0}</Table.Td>
        <Table.Td>₦{formatStringAmount(data?.totalSales || 0.0)}</Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={"Available"} />
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
              <Menu.Item>Delete</Menu.Item>
            </Menu.Dropdown>
          </Menu>
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
              <Image src={data.image} alt="product image" fill />
            </Box>
            <Text fz={14}>{data.name}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>#{data.id || "-"}</Table.Td>
        <Table.Td>₦{data.price.toLocaleString() || "-"}</Table.Td>
        <Table.Td>{data.quantity || "-"}</Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar size="sm" src={data.receivedBy.avatar} alt="avatar" />
            <Text fz={14}>{data.receivedBy.name || "-"}</Text>
          </Flex>
        </Table.Td>
        <Table.Td>
          <FormatDate data={data.dateBought} formatType="datePipeTime" />
        </Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data.status} />
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

  const handleOpenDrinkModal = (id: number) => {
    setSelectedProductId(id.toString());
    openDrinkModal();
  };

  const handleOpenSalesModal = (id: string) => {
    console.log(id);
  };

  return (
    <AppLayout title="Drinks">
      <Box pos="relative">
        <Group
          mb={{ base: 20, md: 0 }}
          pos={{ base: "relative", md: "absolute" }}
          top={0}
          right={0}
        >
          <Button
            onClick={openAddDrinkModal}
            className={classes.btnWhite}
            radius="xl"
          >
            Add a Drink
          </Button>
          <Button
            onClick={openAddDrinkBrandModal}
            className={classes.btnWarning}
            radius="xl"
          >
            Add a Drink Brand
          </Button>
        </Group>

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="drinkBrands">Drink Brands</Tabs.Tab>
            <Tabs.Tab value="sales">Sales</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={20}
              className="overflow-x-hidden md:overflow-x-auto hide-scrollbar"
            >
              {isFetchingDrinksOverview ? (
                <SummaryCardSkeleton />
              ) : (
                <>
                  <SummaryCard
                    title="Inventory Volume"
                    miw={{ base: "auto", md: 240 }}
                    value={
                      drinksOverviewD?.inventoryVolume?.toLocaleString() ?? 0
                    }
                  />
                  <SummaryCard
                    title="Inventory Value"
                    miw={{ base: "auto", md: 240 }}
                    value={formatStringAmount(
                      drinksOverviewD?.inventoryValue ?? 0
                    )}
                    isCurrency
                  />
                  <SummaryCard
                    title="Items Sold"
                    miw={{ base: "auto", md: 240 }}
                    value={drinksOverviewD?.itemsSold?.toLocaleString() ?? 0}
                  />
                  <SummaryCard
                    title="Revenue Generated"
                    miw={{ base: "auto", md: 240 }}
                    value={formatStringAmount(
                      drinksOverviewD?.reveneGenerated ?? 0
                    )}
                    isCurrency
                  />
                  <SummaryCard
                    title="Order Fulfilment"
                    miw={{ base: "auto", md: 240 }}
                    value={drinksOverviewD?.orderFufilment ?? "0"}
                  />
                </>
              )}
            </Flex>

            {/* Table */}
            <PpTable
              headers={tableHeaders}
              rowData={rows}
              totalItems={drinksData?.length}
              activePage={activePage}
              setActivePage={setActivePage}
              rowsPerPage={10}
              isLoading={isFetchingDrinks}
              mt={20}
              hasActions
              emptyState={drinksEmptyState}
              filters={drinksFilters}
            />
          </Tabs.Panel>

          <Tabs.Panel value="drinkBrands">
            <Flex
              bg={"#FFFFFF0D"}
              p={8}
              mb={10}
              gap={30}
              className="rounded-lg"
            >
              <TextInput
                placeholder="Search"
                variant="default"
                leftSection={
                  <Image
                    src={IconSearch}
                    alt="icon"
                    style={{ width: rem(16), height: rem(16) }}
                  />
                }
                leftSectionPointerEvents="none"
                classNames={{ input: inputClasses.searchInput }}
                //value={query}
                //onChange={(e) => handleQuery?.(e.target.value)}
                size="sm"
                radius="md"
              />
            </Flex>

            {/* Brands */}
            <Flex direction={{ base: "column", md: "row" }} gap={20} mt={40}>
              {drinkBrands?.map((brand, index) => (
                <BackgroundImage
                  key={index}
                  src={brand.image.src}
                  radius="lg"
                  p={10}
                  h={140}
                >
                  <Flex justify="space-between" gap={10}>
                    <Flex direction="column">
                      <Text fw={700}>{brand.name}</Text>
                      <Text c="#E0E0E0">{brand.itemsCount} items</Text>
                    </Flex>

                    <ActionIcon variant="transparent" aria-label="More">
                      <Image
                        src={IconEllipsisV}
                        alt="icon"
                        style={{ width: "70%", height: "70%" }}
                      />
                    </ActionIcon>
                  </Flex>
                </BackgroundImage>
              ))}
            </Flex>
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

      <ProductDetailsModal
        opened={drinkModalOpened}
        close={closeDrinkModal}
        type="drink"
        id={selectedProductId}
      />

      {/* Add Drink Modal */}
      <AddDrink
        opened={addDrinkModalOpened}
        close={closeAddDrinkModal}
        triggerConfirmation={openSuccessModal}
        setSuccessMessage={setSuccessMessage}
      />

      {/* Add a Drink Brand modal */}
      <AddDrinkBrand
        opened={addDrinkBrandModalOpened}
        close={closeAddDrinkBrandModal}
        triggerConfirmation={openSuccessModal}
        setSuccessMessage={setSuccessMessage}
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
    </AppLayout>
  );
};

export default Drinks;
