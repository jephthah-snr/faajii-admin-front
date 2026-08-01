"use client";

import { IconCaretDown, IconEllipsisV, IconSearch } from "@/icons";
import { eventStoreHeaders, getStatusColor, rowsPerPage } from "@/utils";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Menu,
  rem,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import Image from "next/image";
import PpTable from "../table";
import inputClasses from "@/styles/Input.module.css";
import { NoImage } from "@/images";
import {
  ConfirmationModal,
  PartyStoreDetailsModal,
  StatusBadge,
} from "@/components/elements";
import { Store } from "@/services/api/event/event.types";
import { useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArchivePartyStoreItem, DeletePartyStoreItem } from "@/services/api";
import classes from "@/styles/General.module.css";

interface EventStoreProps {
  storeData: Store[];
  isFetching: boolean;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
}

const EventStore = ({
  storeData,
  isFetching,
  selectedFilter,
  onFilterChange,
  query,
  onQueryChange,
}: EventStoreProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [
    confirmationModalOpened,
    { open: openConfirmationModal, close: closeConfirmationModal },
  ] = useDisclosure(false);
  const [modalData, setModalData] = useState({
    type: "default" as ConfirmationModalTypes,
    title: "",
    message: "",
  });
  const [pendingAction, setPendingAction] = useState<
    "archive" | "delete" | null
  >(null);

  const queryClient = useQueryClient();
  const storeSummary = useMemo(() => {
    return storeData.reduce(
      (summary, item) => {
        summary.unitsSold += Number(item.itemsPurchased || 0);
        summary.unitsAvailable += Number(item.itemsLeft || 0);
        if (item.category === "ticket") summary.tickets += 1;
        if (item.category === "merch") summary.merchandise += 1;
        return summary;
      },
      { tickets: 0, merchandise: 0, unitsSold: 0, unitsAvailable: 0 },
    );
  }, [storeData]);

  /** --- Show confirmation modal --- **/
  const showConfirmation = (
    type: ConfirmationModalTypes,
    title: string,
    message: string
  ) => {
    setModalData({ type, title, message });
    openConfirmationModal();
  };

  const handleOpenModal = (id: string) => {
    setSelectedItem(id);
    open();
  };

  /** --- Archive Item Mutation --- **/
  const archiveItemMutation = useMutation({
    mutationFn: (id: string) => ArchivePartyStoreItem(id),
    onSuccess: () => {
      showConfirmation(
        "success",
        "Successful",
        "The item has been archived successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-event-party-store"] });
    },
    onError: (error: any) => {
      showConfirmation(
        "error",
        "Error",
        error?.response?.data?.message || "Failed to archive item"
      );
    },
  });

  /** --- Delete Item Mutation --- **/
  const removeItemMutation = useMutation({
    mutationFn: (id: string) => DeletePartyStoreItem(id),
    onSuccess: () => {
      showConfirmation(
        "success",
        "Successful",
        "The item has been removed successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-event-party-store"] });
      close();
    },
    onError: (error: any) => {
      showConfirmation(
        "error",
        "Error",
        error?.response?.data?.message || "Failed to remove item"
      );
    },
  });

  /** --- Prompt before archive --- **/
  const handleConfirmArchive = (id: string, isActive: number) => {
    setSelectedItem(id);
    setPendingAction("archive");
    setModalData({
      type: "warning",
      title: isActive === 1 ? "Archive Item" : "Restore Item",
      message:
        isActive === 1
          ? "Are you sure you want to archive this item?"
          : "Are you sure you want to restore this item?",
    });
    openConfirmationModal();
  };

  /** --- Prompt before delete --- **/
  const handleConfirmDelete = (id: string) => {
    setSelectedItem(id);
    setPendingAction("delete");
    setModalData({
      type: "warning",
      title: "Delete Item",
      message: "Are you sure you want to permanently delete this item?",
    });
    openConfirmationModal();
  };

  /** --- Execute confirmed action --- **/
  const handleConfirmedAction = () => {
    if (!selectedItem) return;
    if (pendingAction === "archive") archiveItemMutation.mutate(selectedItem);
    if (pendingAction === "delete") removeItemMutation.mutate(selectedItem);
    setPendingAction(null);
    closeConfirmationModal();
  };

  /** --- Table Rows --- **/
  const rows = storeData?.map((item) => (
    <Table.Tr
      key={item?.id}
      onClick={() => handleOpenModal(String(item?.id))}
      className="cursor-pointer"
    >
      <Table.Td c="#FFFFFF66">#{item?.id}</Table.Td>
      <Table.Td>
        <Flex align="center" gap={14}>
          <Image
            src={item?.images?.[0] || NoImage}
            alt="icon"
            className="rounded-[4px]"
            width={30}
            height={30}
          />
          <Box w={280} pr={10}>
            <Text truncate="end" fz={14}>
              {item?.name || "N/A"}
            </Text>
          </Box>
        </Flex>
      </Table.Td>
      <Table.Td>₦{Number(item?.price)?.toLocaleString()}</Table.Td>
      <Table.Td>
        <Text tt="capitalize" c={getStatusColor(item?.category?.toLowerCase())}>
          {item?.category}
        </Text>
      </Table.Td>
      <Table.Td>{item?.totalQuantity?.toLocaleString()}</Table.Td>
      <Table.Td>{item?.itemsPurchased?.toLocaleString()}</Table.Td>
      <Table.Td>{item?.itemsLeft?.toLocaleString()}</Table.Td>
      <Table.Td miw={120} px={0}>
        <StatusBadge status={item?.isActive === 1 ? "Active" : "Inactive"} />
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
                src={IconEllipsisV}
                alt="icon"
                style={{ width: "70%", height: "70%" }}
              />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
            <Menu.Item
              onClick={() =>
                handleConfirmArchive(String(item?.id), item?.isActive)
              }
            >
              {item?.isActive === 1 ? "Archive Item" : "Restore Item"}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => handleConfirmDelete(String(item?.id))}>
              Delete Item
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      {/* Filter & search */}
      {!isFetching && (
        <>
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={12}
          mb={18}
          wrap="wrap"
        >
          {[
            { label: "Ticket tiers", value: storeSummary.tickets, icon: "🎟️" },
            { label: "Merchandise", value: storeSummary.merchandise, icon: "👕" },
            { label: "Units sold", value: storeSummary.unitsSold, icon: "↗" },
            { label: "Available now", value: storeSummary.unitsAvailable, icon: "◌" },
          ].map((metric) => (
            <Box
              key={metric.label}
              bg="#171717"
              p={16}
              className="rounded-xl border border-[#242424]"
              miw={150}
              flex={1}
            >
              <Flex justify="space-between" align="flex-start">
                <Text fz={13} c="#868686">{metric.label}</Text>
                <Text fz={16}>{metric.icon}</Text>
              </Flex>
              <Text mt={8} fz={24} fw={700}>{metric.value.toLocaleString()}</Text>
            </Box>
          ))}
        </Flex>
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
          my={10}
          gap={10}
          py={10}
          bg="#0A0A0A"
          className="sticky top-14 z-10"
        >
          <Flex align="center" gap={16}>
            <Box className="rounded-[6px]" p={10} h={40} bg="#292929">
              <Flex align="center" gap={4} wrap="wrap">
                <Text fz={{ base: 12, md: 14 }} c="#868686">
                  Total Items Created:
                </Text>
                <Text fz={{ base: 12, md: 14 }} c="#fff">
                  {storeData?.length || 0}
                </Text>
              </Flex>
            </Box>

            <Menu shadow="md">
              <Menu.Target>
                <Button
                  size="sm"
                  h={40}
                  style={{ border: "1px solid #181818" }}
                  color="#0D0D0D"
                  radius={8}
                  miw={"fit-content"}
                >
                  <Flex align="center" justify="space-between" gap={10}>
                    <Text fz={{ base: 13, md: 14 }} c="#868686">
                      Item:
                    </Text>

                    <Flex align="center" gap={4}>
                      <Text fz={{ base: 13, md: 14 }}>{selectedFilter}</Text>
                      <Image
                        src={IconCaretDown}
                        width={20}
                        height={20}
                        alt="icon"
                      />
                    </Flex>
                  </Flex>
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                {["All", "Tickets", "Merchandise", "Gifts", "Products", "Services"].map(
                  (filter) => (
                    <Menu.Item
                      key={filter}
                      onClick={() => onFilterChange(filter)}
                    >
                      {filter}
                    </Menu.Item>
                  )
                )}
              </Menu.Dropdown>
            </Menu>
          </Flex>

          {/* Search */}
          <TextInput
            placeholder="Search"
            w={{ base: "100%", md: "30%" }}
            variant="default"
            leftSectionPointerEvents="none"
            classNames={{ input: inputClasses.searchInputAlt }}
            value={query}
            onChange={(e) => onQueryChange?.(e.currentTarget.value)}
            size="sm"
            radius="md"
            leftSection={
              <Image
                src={IconSearch}
                alt="icon"
                style={{ width: rem(16), height: rem(16) }}
              />
            }
          />
        </Flex>
        </>
      )}

      {/* Table */}
      <PpTable
        headers={eventStoreHeaders}
        rowData={rows}
        rowsPerPage={rowsPerPage}
        isLoading={isFetching}
      />

      <PartyStoreDetailsModal
        id={selectedItem || ""}
        opened={opened}
        onClose={close}
        onArchiveItem={(id) => handleConfirmArchive(id, 1)}
        onRemoveItem={handleConfirmDelete}
        loadingArchive={archiveItemMutation.isPending}
        loadingRemove={removeItemMutation.isPending}
      />

      <ConfirmationModal
        opened={confirmationModalOpened}
        close={closeConfirmationModal}
        type={modalData.type}
        title={modalData.title}
        message={modalData.message}
        actions={
          modalData.type === "warning" ? (
            <Flex justify="center" gap={14}>
              <Button
                radius="xl"
                className={classes.btnNeutral}
                onClick={closeConfirmationModal}
                disabled={
                  removeItemMutation.isPending || archiveItemMutation.isPending
                }
                miw="50%"
              >
                Cancel
              </Button>
              <Button
                radius="xl"
                className={classes.btnWarning}
                loading={
                  removeItemMutation.isPending || archiveItemMutation.isPending
                }
                disabled={
                  removeItemMutation.isPending || archiveItemMutation.isPending
                }
                onClick={handleConfirmedAction}
                miw="50%"
              >
                Yes, confirm
              </Button>
            </Flex>
          ) : (
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
          )
        }
      />
    </>
  );
};

export default EventStore;
