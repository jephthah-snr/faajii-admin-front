"use client";

import { IconCaretDown, IconEllipsisV, IconSearch } from "@/icons";
import { Guest } from "@/services/api/event/event.types";
import {
  capitalizeString,
  eventGuestHeaders,
  getStatusColor,
  rowsPerPage,
} from "@/utils";
import {
  ActionIcon,
  Button,
  Card,
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
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import {
  AddGuestModal,
  ConfirmationModal,
  DateFilter,
  FormatDate,
  GuestDetailsModal,
} from "@/components/elements";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RemoveGuest, ResendRSVP } from "@/services/api";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";
import classes from "@/styles/General.module.css";

interface EventGuestProps {
  eventId: string;
  eventTitle: string;
  guestsData: Guest[];
  isFetching: boolean;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  onDateRangeChange?: (range: [string | null, string | null]) => void;
}

const EventGuests = ({
  eventId,
  eventTitle,
  guestsData,
  isFetching,
  selectedFilter,
  onFilterChange,
  query,
  onQueryChange,
  onDateRangeChange,
}: EventGuestProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<null | { id: string }>(
    null
  );
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [
    confirmationModalOpened,
    { open: openConfirmationModal, close: closeConfirmationModal },
  ] = useDisclosure(false);
  const [openedAddGuest, { open: openAddGuest, close: closeAddGuest }] =
    useDisclosure(false);

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

  const guestRows = guestsData?.map((guest, index) => {
    return (
      <Table.Tr
        key={index}
        onClick={() => handleOpenModal(String(guest?.id))}
        className={`cursor-pointer`}
      >
        <Table.Td tt="capitalize">{guest?.name || "N/A"}</Table.Td>
        <Table.Td>{guest?.phone || "N/A"}</Table.Td>
        <Table.Td>{guest?.email || "N/A"}</Table.Td>
        <Table.Td>
          <Flex align="center" gap={6}>
            <Text>{guest?.totalStorePurchases || 0}</Text>
            <Text>🛍️</Text>
          </Flex>
        </Table.Td>
        <Table.Td>
          <Text c={getStatusColor(guest?.status?.toLowerCase())}>
            {capitalizeString(guest?.status) || "N/A"}
          </Text>
        </Table.Td>
        <Table.Td>{guest?.rsvpSubmission?.reference || "N/A"}</Table.Td>
        <Table.Td>
          <FormatDate data={guest?.created_at} formatType="fullDate" />
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
              <Menu.Item onClick={() => handleResendRSVP(String(guest?.id))}>
                Resend RSVP
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item onClick={() => confirmRemoveGuest(String(guest?.id))}>
                Remove guest
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  /** --- Handle Resend RSVP --- **/
  const resendRsvpMutation = useMutation({
    mutationFn: (id: string) => ResendRSVP(id),
    onSuccess: () => {
      showConfirmation(
        "success",
        "Successful",
        "RSVP has been resent successfully"
      );
      queryClient.invalidateQueries({
        queryKey: ["event-details"],
      });
    },
    onError: (error: any) => {
      showConfirmation(
        "error",
        "Error",
        error?.response?.data?.message || "Failed to resend RSVP"
      );
    },
  });

  /** --- Handle Remove Guest --- **/
  const removeGuestMutation = useMutation({
    mutationFn: (id: string) => RemoveGuest(id),
    onSuccess: () => {
      showConfirmation(
        "success",
        "Successful",
        "The guest has been removed successfully"
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
        error?.response?.data?.message || "Failed to remove guest"
      );
    },
  });

  const confirmRemoveGuest = (id: string) => {
    setPendingAction({ id });
    setModalData({
      type: "warning",
      title: "Remove Guest?",
      message:
        "Are you sure you want to remove this guest from the event? This action cannot be undone.",
    });
    openConfirmationModal();
  };

  const handleRemoveGuest = () => {
    if (pendingAction?.id) {
      removeGuestMutation.mutate(pendingAction.id);
      setPendingAction(null);
      closeConfirmationModal();
    }
  };

  const handleResendRSVP = (id: string) => resendRsvpMutation.mutate(id);

  const handleDownloadCSV = () => {
    if (!guestsData || guestsData.length === 0) return;

    const headers = [
      "Name",
      "Phone",
      "Email",
      "Total Store Purchases",
      "Status",
      "RSVP Reference",
    ];

    const rows = guestsData.map((guest) => [
      guest?.name || "N/A",
      guest?.phone || "N/A",
      guest?.email || "N/A",
      guest?.totalStorePurchases || 0,
      guest?.status || "N/A",
      guest?.rsvpSubmission?.reference || "N/A",
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
    link.setAttribute("download", `${eventTitle} Guest List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    const normalized = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    );
    return normalized.toISOString();
  };

  const handleDateChange = (range: [Date | null, Date | null]) => {
    setDateRange(range);

    if (range[0] && range[1]) {
      const formatted: [string | null, string | null] = [
        formatDate(range[0]),
        formatDate(range[1]),
      ];
      onDateRangeChange?.(formatted);
    } else {
      const emptyRange: [string | null, string | null] = [null, null];
      onDateRangeChange?.(emptyRange);
    }
  };

  return (
    <>
      {/* Filter & search */}
      {!isFetching && (
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
          my={10}
          gap={10}
          py={10}
          wrap="wrap"
          bg="#0A0A0A"
          className="sticky top-14 z-10"
        >
          <Flex align="center" gap={16} wrap="wrap">
            <Card radius={6} p={10} h={40} bg="#292929">
              <Flex align="center" gap={4}>
                <Text fz={14} c="#868686">
                  Total RSVP:
                </Text>
                <Text fz={14} c="#fff">
                  {guestsData?.length || 0}
                </Text>
              </Flex>
            </Card>

            {/* Filter */}
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
                    <Text fz={14} c="#868686">
                      Filter:
                    </Text>

                    <Flex align="center" gap={4}>
                      <Text>{selectedFilter}</Text>
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
                {["All", "Confirmed", "Invited", "Pending", "Rejected"].map(
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

            {/* Date */}
            <DateFilter value={dateRange} onChange={handleDateChange} />

            {/* Export */}
            <Button
              size="sm"
              h={40}
              style={{ border: "1px solid #181818" }}
              leftSection={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#868686"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-upload"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                  <path d="M7 9l5 -5l5 5" />
                  <path d="M12 4l0 12" />
                </svg>
              }
              color="#0D0D0D"
              //c="#868686"
              radius={8}
              miw={"fit-content"}
              onClick={handleDownloadCSV}
            >
              Export as CSV
            </Button>
          </Flex>

          <Flex align="center" gap={16} wrap="wrap">
            {/* Search */}
            <TextInput
              placeholder="Search"
              w={{ base: "100%", md: "auto" }}
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

            <Button
              h={38}
              px={14}
              radius="md"
              className={classes.btnWhite}
              styles={{ root: { minWidth: 110 } }}
              onClick={openAddGuest}
            >
              Add Guest
            </Button>
          </Flex>
        </Flex>
      )}

      {/* Table */}
      <PpTable
        headers={eventGuestHeaders}
        rowData={guestRows}
        //totalItems={totalItems}
        //activePage={activePage}
        //setActivePage={setActivePage}
        rowsPerPage={rowsPerPage}
        isLoading={isFetching}
      />

      <GuestDetailsModal
        id={selectedItem || ""}
        opened={opened}
        onClose={close}
        onResendRSVP={handleResendRSVP}
        onRemoveGuest={confirmRemoveGuest}
        loadingResend={resendRsvpMutation.isPending}
        loadingRemove={removeGuestMutation.isPending}
      />

      <AddGuestModal opened={openedAddGuest} close={closeAddGuest} eventId={eventId} />

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
                disabled={removeGuestMutation.isPending}
                onClick={() => {
                  setPendingAction(null);
                  closeConfirmationModal();
                }}
                miw="50%"
              >
                Cancel
              </Button>
              <Button
                radius="xl"
                className={classes.btnWarning}
                onClick={handleRemoveGuest}
                loading={removeGuestMutation.isPending}
                disabled={removeGuestMutation.isPending}
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

export default EventGuests;
