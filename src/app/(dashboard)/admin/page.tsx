"use client";

import {
  AddAdmin,
  AdminDetails,
  ConfirmationModal,
  PpTable,
  StatusBadge,
} from "@/components";
import { AppLayout } from "@/layout";
import {
  adminEmptyState,
  adminFilters,
  initialsColors,
  rowsPerPage,
} from "@/utils";
import { Avatar, Box, Button, Drawer, Flex, Table, Text } from "@mantine/core";
import {
  useDebouncedValue,
  useDisclosure,
  useMediaQuery,
} from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import classes from "@/styles/General.module.css";
import { useQuery } from "@tanstack/react-query";
import { GetAdmins } from "@/services/api";
import { IAdmin } from "@/services/api/admin/admin.types";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";

const tableHeaders = [
  "Admin ID",
  "Name",
  "Email Address",
  "Phone Number",
  "Role",
  "Status",
];

const Admin = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [activePage, setActivePage] = useState(1);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const [
    adminDetailsOpened,
    { open: openAdminDetailsModal, close: closeAdminDetailsModal },
  ] = useDisclosure(false);

  const [
    addAdminModalOpened,
    { open: openAddAdminModal, close: closeAddAdminModal },
  ] = useDisclosure(false);
  const [
    confirmationModalOpened,
    { open: openConfirmationModal, close: closeConfirmationModal },
  ] = useDisclosure(false);

  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationType, setConfirmationType] =
    useState<ConfirmationModalTypes>("default");

  // Fetch admin data
  const {
    data: admins,
    isFetching: isFetchingAdmins,
    refetch: refetchAdmins,
  } = useQuery({
    queryKey: ["admins", activePage, rowsPerPage, debouncedQuery],
    queryFn: () =>
      GetAdmins(String(activePage), String(rowsPerPage), debouncedQuery),
    placeholderData: (prev) => prev,
  });
  const adminData = useMemo(() => admins?.data?.data || [], [admins]);
  const totalItems = admins?.data?.pagination?.total || 0;

  const loggedInAdminMatch = useMemo(() => {
    if (!loggedInUser || !adminData.length) return null;
    return adminData.find((admin) => admin.email === loggedInUser.email);
  }, [loggedInUser, adminData]);

  useEffect(() => {
    if (loggedInAdminMatch) {
      setSelectedAdminId(String(loggedInAdminMatch.id));
      setIsLoggedInUser(true);
    }
  }, [loggedInAdminMatch]);

  const handleSelectAdmin = (admin: IAdmin) => {
    setSelectedAdminId(String(admin?.id));

    if (loggedInUser?.email && admin?.email === loggedInUser?.email) {
      setIsLoggedInUser(true);
    } else {
      setIsLoggedInUser(false);
    }

    if (isMobile) {
      openAdminDetailsModal();
    }
  };

  const rows = adminData?.map((data) => {
    return (
      <Table.Tr
        key={data?.id}
        onClick={() => handleSelectAdmin(data)}
        className={`cursor-pointer`}
      >
        <Table.Td>#{data?.id || "N/A"}</Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              size="sm"
              name={`${data?.firstName || ""} ${data?.lastName || ""}`.trim() || "U"}
              color="initials"
              allowedInitialsColors={initialsColors}
              src={data?.avatar}
              alt="avatar"
            />
            <Text fz={14} tt="capitalize">
              {`${data?.firstName || ""} ${data?.lastName || ""}`.trim() || "N/A"}
            </Text>
          </Flex>
        </Table.Td>
        <Table.Td>{data?.email || "N/A"}</Table.Td>
        <Table.Td>{data?.phoneNumber || "N/A"}</Table.Td>
        <Table.Td tt="capitalize">{data?.roleName || data?.adminRole || "N/A"}</Table.Td>
        <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.isSuspended ? "Suspended" : "Active"} />
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout
      title="Admin"
      isAdmin
      adminChildren={
        <AdminDetails
          id={selectedAdminId}
          refetch={refetchAdmins}
          isLoggedInUser={isLoggedInUser}
        />
      }
    >
      <Box mt={-20}>
        <Flex justify="flex-end" mb={10}>
          <Button
            radius="xl"
            className={classes.btnWhite}
            onClick={openAddAdminModal}
          >
            Add an Admin
          </Button>
        </Flex>

        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={activePage}
          setActivePage={setActivePage}
          isLoading={isFetchingAdmins}
          rowsPerPage={rowsPerPage}
          hasActions
          emptyState={adminEmptyState}
          filters={adminFilters}
          query={query}
          handleQuery={setQuery}
        />
      </Box>

      {/* Add Admin modal */}
      <AddAdmin
        opened={addAdminModalOpened}
        refetch={refetchAdmins}
        close={closeAddAdminModal}
        triggerConfirmation={openConfirmationModal}
        setConfirmationMessage={setConfirmationMessage}
        setConfirmationType={setConfirmationType}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        type={confirmationType}
        opened={confirmationModalOpened}
        close={closeConfirmationModal}
        title={confirmationType === "error" ? "Error" : "Successful"}
        message={confirmationMessage}
        actions={
          <Flex justify="center">
            <Button
              radius="xl"
              w="50%"
              className={classes.btnWhite}
              onClick={closeConfirmationModal}
            >
              {confirmationType === "error" ? "Retry" : "Done"}
            </Button>
          </Flex>
        }
      />

      <Drawer
        opened={adminDetailsOpened}
        onClose={closeAdminDetailsModal}
        classNames={{
          content: classes.drawerContent,
          header: classes.drawerHeader,
        }}
        position="bottom"
      >
        <AdminDetails
          id={selectedAdminId}
          isLoggedInUser={isLoggedInUser}
          refetch={refetchAdmins}
          closeDrawer={closeAdminDetailsModal}
        />
      </Drawer>
    </AppLayout>
  );
};

export default Admin;
