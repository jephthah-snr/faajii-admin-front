"use client";

import {
  ConfirmationModal,
  FormatDate,
  PpTable,
  StatusBadge,
} from "@/components";
import { IconEllipsisH } from "@/icons";
import { AppLayout } from "@/layout";
import {
  buildDefaultFilters,
  eventEmptyState,
  eventFilters,
  formatStringAmount,
  initialsColors,
  rowsPerPage,
} from "@/utils";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Flex,
  Menu,
  Table,
  Text,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DeleteEvent, GetEvents } from "@/services/api";
import { useRouter } from "nextjs-toploader/app";
import classes from "@/styles/General.module.css";

const tableHeaders = [
  "Event ID",
  "Event Name",
  "User",
  "Budget",
  "Date",
  "Time",
  "Status",
  "",
];

const EventManagement = () => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [selectedEventID, setSelectedEventID] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState(buildDefaultFilters(eventFilters));

  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [
    successModalOpened,
    { open: openSuccessModal, close: closeSuccessModal },
  ] = useDisclosure(false);

  //Fetching events data
  const {
    data: events,
    isFetching: isFetchingEvents,
    refetch,
  } = useQuery({
    queryKey: ["events", activePage, rowsPerPage, debouncedQuery, filters],
    queryFn: () =>
      GetEvents(
        String(activePage),
        String(rowsPerPage),
        debouncedQuery,
        filters.status,
        filters.startDate,
        filters.endDate
      ),
    placeholderData: (prev) => prev,
  });
  const eventsData = events?.data?.data || [];
  const totalItems = events?.data?.pagination?.total || 0;

  const handleDeleteEvent = async (id: string) => {
    setIsDeleting(true);
    try {
      await DeleteEvent(id);
      openSuccessModal();
      refetch();
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpen = (id: string) => {
    setSelectedEventID(String(id));
    openDeleteModal();
  };

  const rows = eventsData?.map((data) => {
    return (
      <Table.Tr
        key={data.eventId}
        onClick={() => router.push(`/event-management/${data.id}`)}
        className={`cursor-pointer`}
      >
        <Table.Td>#{data?.eventId || "N/A"}</Table.Td>
        <Table.Td>
          <Box w={300} pr={10}>
            <Text truncate="end" fz={14} tt="capitalize">
              {data?.name || "N/A"}
            </Text>
          </Box>
        </Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              size="sm"
              src={data?.creatorAvatar}
              name={data?.creatorName || "U"}
              color="initials"
              allowedInitialsColors={initialsColors}
              alt="avatar"
            />
            <Text fz={14} tt="capitalize">
              {data?.creatorName || "N/A"}
            </Text>
          </Flex>
        </Table.Td>
        <Table.Td>₦{formatStringAmount(data?.eventBudget) || "0.00"}</Table.Td>
        <Table.Td>
          <FormatDate data={data?.startDate} formatType="fullDate" />
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.startDate} formatType="time" />
          {" - "}
          <FormatDate data={data?.endDate} formatType="time" />
        </Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.status} />
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
              <Menu.Item onClick={() => handleOpen(String(data.id))}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout title="Event Management">
      <Box>
        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={activePage}
          setActivePage={setActivePage}
          rowsPerPage={rowsPerPage}
          hasActions
          isLoading={isFetchingEvents}
          emptyState={eventEmptyState}
          filters={eventFilters}
          query={query}
          handleQuery={setQuery}
          onFilterChange={setFilters}
        />
      </Box>

      <ConfirmationModal
        type="error"
        opened={deleteModalOpened}
        close={closeDeleteModal}
        title="Delete Event?"
        message="Do you really want to delete this event?"
        actions={
          <Flex justify="center" gap={14}>
            <Button
              radius="xl"
              className={classes.btnNeutral}
              onClick={closeDeleteModal}
              disabled={isDeleting}
              miw="50%"
            >
              Cancel
            </Button>
            <Button
              radius="xl"
              className={classes.btnDanger}
              onClick={() => handleDeleteEvent(selectedEventID)}
              loading={isDeleting}
              miw="50%"
            >
              Delete Event
            </Button>
          </Flex>
        }
      />

      <ConfirmationModal
        type="success"
        opened={successModalOpened}
        close={closeSuccessModal}
        title="Successful"
        message="Event has been deleted successfully"
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

export default EventManagement;
