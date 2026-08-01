"use client";

import { ConfirmationModal, PpTable, StatusBadge } from "@/components";
import { IconEllipsisH } from "@/icons";
import { AppLayout } from "@/layout";
import {
  buildDefaultFilters,
  getUuidPrefix,
  initialsColors,
  rowsPerPage,
  userEmptyState,
  userManagementFilters,
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
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import classes from "@/styles/General.module.css";
import { useQuery } from "@tanstack/react-query";
import { DeleteUser, GetUsers, SuspendUser } from "@/services/api";

const tableHeaders = [
  "User ID",
  "User",
  "Email Address",
  "Phone Number",
  "Status",
  "Total Events",
  "Active Events",
  "",
];

const UserManagement = () => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [filters, setFilters] = useState(
    buildDefaultFilters(userManagementFilters)
  );

  //Fetching users data
  const {
    data: users,
    isFetching: isFetchingUsers,
    refetch,
  } = useQuery({
    queryKey: ["users", activePage, rowsPerPage, debouncedQuery, filters],
    queryFn: () =>
      GetUsers(
        String(activePage),
        String(rowsPerPage),
        debouncedQuery,
        filters.status,
        filters.activeEvent,
        filters.startDate,
        filters.endDate
      ),
    placeholderData: (prev) => prev,
  });
  const usersData = users?.data?.data || [];
  const totalItems = users?.data?.pagination?.total || 0;

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
  const [successMessage, setSuccessMessage] = useState("");

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await DeleteUser(selectedUserId!);
      setSuccessMessage("User has been deleted successfully");
      refetch();
      closeDeleteModal();
      openSuccessModal();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    try {
      setIsLoading(true);

      await SuspendUser(selectedUserId!);
      setSuccessMessage("User has been suspended successfully");
      refetch();
      closeSuspendModal();
      openSuccessModal();
    } catch (error) {
      console.error("Error suspending user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const rows = usersData?.map((data) => {
    return (
      <Table.Tr
        key={data.ref}
        onClick={() => router.push(`/user-management/${data.ref}`)}
        className={`cursor-pointer`}
      >
        <Table.Td tt="uppercase">#{getUuidPrefix(data.ref)}</Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              size="sm"
              name={data?.name || "U"}
              color="initials"
              allowedInitialsColors={initialsColors}
              src={data?.avatar}
              alt="avatar"
            />
            <Text fz={14} tt="capitalize">
              {data?.name || "N/A"}
            </Text>
          </Flex>
        </Table.Td>
        <Table.Td>{data?.email || "-"}</Table.Td>
        <Table.Td>{data?.phoneNumber || "-"}</Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.status} />
        </Table.Td>
        <Table.Td>{data?.totalEvents || 0}</Table.Td>
        <Table.Td>{data?.activeEvents || 0}</Table.Td>
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
              <Menu.Item
                onClick={() => {
                  setSelectedUserId(String(data.id));
                  openSuspendModal();
                }}
              >
                Suspend
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                onClick={() => {
                  setSelectedUserId(String(data.id));
                  openDeleteModal();
                }}
                color="red"
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout title="User Management">
      <Box>
        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={activePage}
          setActivePage={setActivePage}
          rowsPerPage={rowsPerPage}
          hasActions
          isLoading={isFetchingUsers}
          emptyState={userEmptyState}
          filters={userManagementFilters}
          onFilterChange={setFilters}
          query={query}
          handleQuery={setQuery}
        />
      </Box>

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

      <ConfirmationModal
        type="warning"
        opened={suspendModalOpened}
        close={closeSuspendModal}
        title="Suspend User?"
        message="Do you really want to suspend this user?"
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
              className={classes.btnWarning}
              onClick={handleSuspend}
              loading={isLoading}
              miw="50%"
            >
              Suspend User
            </Button>
          </Flex>
        }
      />

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

export default UserManagement;
