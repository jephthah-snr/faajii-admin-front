"use client";

import { eventWishlistHeaders, rowsPerPage } from "@/utils";
import PpTable from "../table";
import Image from "next/image";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Flex,
  Menu,
  Progress,
  rem,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import {
  ConfirmationModal,
  StatusBadge,
  SummaryItem,
  WishlistDetailsModal,
} from "@/components/elements";
import { IconEllipsisV, IconSearch } from "@/icons";
import inputClasses from "@/styles/Input.module.css";
import { NoImage } from "@/images";
import { IWishlist } from "@/services/api/event/event.types";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import Link from "next/link";
import classes from "@/styles/General.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteWishlistItem } from "@/services/api";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";

interface EventWishlistProps {
  wishlistData: IWishlist;
  isFetching: boolean;
  query?: string;
  onQueryChange?: (query: string) => void;
}

const EventWishlist = ({
  wishlistData,
  isFetching,
  query,
  onQueryChange,
}: EventWishlistProps) => {
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

  const showConfirmation = (
    type: ConfirmationModalTypes,
    title: string,
    message: string
  ) => {
    setModalData({ type, title, message });
    openConfirmationModal();
  };

  const queryClient = useQueryClient();

  const handleOpenModal = (id: string) => {
    setSelectedItem(id);
    open();
  };

  const rows = wishlistData?.items?.map((item) => {
    const getProgressColor = (progress: number): string => {
      if (progress === 0) return "#F8F8F8E5";
      if (progress < 100) return "#F6D425";
      return "#10B980";
    };

    const progressColor = getProgressColor(item.progress);

    return (
      <Table.Tr
        key={item?.id}
        onClick={() => handleOpenModal(String(item?.id))}
        className={`cursor-pointer`}
      >
        <Table.Td>
          <Flex align="center" gap={14}>
            <Image
              src={item?.itemImage || NoImage}
              alt="icon"
              className="rounded-[4px]"
              width={30}
              height={30}
            />
            <Box w={280} pr={10}>
              <Text truncate="end" fz={14}>
                {item?.item || "N/A"}
              </Text>
            </Box>
          </Flex>
        </Table.Td>
        <Table.Td>₦{Number(item?.price)?.toLocaleString()}</Table.Td>
        <Table.Td>₦{item?.contributedAmount?.toLocaleString()}</Table.Td>
        <Table.Td>
          <Flex align="center" gap={16}>
            <Box>
              <Progress value={item?.progress} w={60} color={progressColor} />
            </Box>
            <Text fz={14} c={progressColor}>
              {item?.progress}%
            </Text>
          </Flex>
        </Table.Td>
        <Table.Td>{item?.contributorsList?.length || 0}</Table.Td>
        <Table.Td miw={140} px={0}>
          <StatusBadge status={item?.status} />
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
              <Menu.Item onClick={() => promptRemoveItem(String(item?.id))}>
                Remove Item
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  /** --- Handle Remove Item --- **/
  const removeItemMutation = useMutation({
    mutationFn: (id: string) => DeleteWishlistItem(id),
    onSuccess: () => {
      setSelectedItem(null);
      showConfirmation(
        "success",
        "Successful",
        "The item has been removed successfully"
      );
      queryClient.invalidateQueries({
        queryKey: ["event-details"],
      });
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

  const promptRemoveItem = (id: string) => {
    setModalData({
      type: "warning",
      title: "Remove Item",
      message: "Are you sure you want to remove this item?",
    });
    setSelectedItem(id);
    openConfirmationModal();
  };

  const executeRemoveItem = (id: string) => removeItemMutation.mutate(id);

  return (
    <>
      {/* Filter & search */}
      {!isFetching && (
        <>
          <Card bg="#171717E5" radius={16} p={26} w="100%" flex={1} my={10}>
            <Flex direction="column" gap={30}>
              {/* Name & type */}
              <Flex
                direction={{ base: "column", md: "row" }}
                align={{ base: "flex-start", md: "center" }}
                justify="space-between"
                gap={20}
              >
                <SummaryItem
                  label="Title"
                  tt="capitalize"
                  value={wishlistData?.wishlistName || "N/A"}
                />
                <SummaryItem
                  label="Wishlist URL:"
                  value={
                    wishlistData?.reference ? (
                      <Link
                        href={`https://pv.rsvp/wishlist/${wishlistData?.reference}`}
                        target="_blank"
                      >
                        <Text fw={500} c="#fff">
                          pv.rsvp/wishlist/{wishlistData?.reference}
                        </Text>
                      </Link>
                    ) : (
                      "N/A"
                    )
                  }
                />
                <SummaryItem
                  label="Account Number:"
                  value={wishlistData?.cashbox?.accountNumber || "N/A"}
                />
                <SummaryItem
                  label="Cash Box Balance:"
                  value={`₦ ${
                    wishlistData?.cashbox?.balance?.toLocaleString() || 0
                  }`}
                />
              </Flex>
            </Flex>
          </Card>

          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            mt={30}
            mb={20}
            gap={10}
            py={10}
            bg="#0A0A0A"
            className="sticky top-14 z-10"
          >
            <Flex align="center" gap={16}>
              <Box className="rounded-[6px]" p={10} h={40} bg="#292929">
                <Flex align="center" gap={4} wrap="wrap">
                  <Text fz={14} c="#868686">
                    Total Items Created:
                  </Text>
                  <Text fz={14} c="#fff">
                    {wishlistData?.items?.length || 0}
                  </Text>
                </Flex>
              </Box>
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
        headers={eventWishlistHeaders}
        rowData={rows}
        //totalItems={totalItems}
        //activePage={activePage}
        //setActivePage={setActivePage}
        rowsPerPage={rowsPerPage}
        isLoading={isFetching}
      />

      <WishlistDetailsModal
        id={selectedItem || ""}
        opened={opened}
        onClose={close}
        onRemove={promptRemoveItem}
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
                disabled={removeItemMutation.isPending}
                miw="50%"
              >
                Cancel
              </Button>
              <Button
                radius="xl"
                className={classes.btnWarning}
                loading={removeItemMutation.isPending}
                disabled={removeItemMutation.isPending}
                onClick={() => executeRemoveItem(String(selectedItem))}
                miw="50%"
              >
                Yes, remove
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

export default EventWishlist;
