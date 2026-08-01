"use client";

import {
  ConfirmationModal,
  FormatDate,
  PpTable,
  SummaryItem,
} from "@/components";
import {
  IconCaretDown,
  IconCaretRight,
  IconEllipsisV,
  IconSearch,
} from "@/icons";
import { AppLayout } from "@/layout";
import { initialsColors, rowsPerPage } from "@/utils";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Menu,
  rem,
  ScrollArea,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import classes from "@/styles/General.module.css";
import { useQuery } from "@tanstack/react-query";
import { DeleteVendor, GetVendors, ToggleVendorStatus } from "@/services/api";
import inputClasses from "@/styles/Input.module.css";

const tableHeaders = [
  "ID",
  "Business Name",
  "Type",
  "Phone Number",
  "Email Address",
  "Ratings",
  "Date joined",
  "Action",
];

const VendorManagement = () => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const [isUserSuspended, setIsUserSuspended] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(
    "All",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);

  const [modalState, setModalState] = useState({
    open: false,
    type: "", // 'delete' | 'suspend' | 'success'
    title: "",
    message: "",
    actionLabel: "",
    cancelLabel: "Cancel",
    action: () => {},
  });

  const {
    data: vendors,
    isFetching: isFetchingVendors,
    refetch,
  } = useQuery({
    queryKey: [
      "vendors",
      activePage,
      rowsPerPage,
      selectedFilter,
      debouncedQuery,
    ],
    queryFn: () =>
      GetVendors(
        String(activePage),
        String(rowsPerPage),
        debouncedQuery,
        selectedFilter,
      ),
    placeholderData: (prev) => prev,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const vendorsData = vendors?.data?.activeVendors || [];
  const activeVendorsCount = vendors?.data?.pagination?.active?.total || 0;

  useEffect(() => {
    setIsUserSuspended(false);
  }, []);

  const openModal = (type: string, options: any = {}) => {
    switch (type) {
      case "delete":
        setModalState({
          open: true,
          type,
          title: "Delete Vendor?",
          message: "Do you really want to delete this vendor?",
          actionLabel: "Delete",
          cancelLabel: "Cancel",
          action: () => handleDelete(options.vendorId),
        });
        break;

      case "suspend":
        setModalState({
          open: true,
          type,
          title: isUserSuspended ? "Unblock Vendor?" : "Suspend Vendor?",
          message: `Do you really want to ${
            isUserSuspended ? "unblock" : "suspend"
          } this vendor?`,
          actionLabel: isUserSuspended ? "Unblock" : "Suspend",
          cancelLabel: "Cancel",
          action: () => handleSuspend(options.vendorId),
        });
        break;

      case "error":
        setModalState({
          open: true,
          type,
          title: "Error",
          message: options.message || "Something went wrong",
          actionLabel: "Close",
          cancelLabel: "",
          action: () =>
            setModalState((prev) => ({
              ...prev,
              open: false,
            })),
        });
        break;

      case "success":
        setModalState({
          open: true,
          type,
          title: "Successful",
          message: options.message || "Operation completed successfully",
          actionLabel: "Done",
          cancelLabel: "",
          action: () =>
            setModalState((prev) => ({
              ...prev,
              open: false,
            })),
        });
        break;

      default:
        break;
    }
  };

  const handleDelete = async (vendorId: string) => {
    setIsLoading(true);
    try {
      await DeleteVendor(vendorId);
      refetch();
      setModalState((prev) => ({ ...prev, open: false }));
      openModal("success", { message: "Vendor has been deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting vendor:", error);
      openModal("error", {
        message: error?.response?.data?.message || "Error deleting vendor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async (vendorId: string) => {
    setIsLoading(true);
    try {
      if (isUserSuspended) {
        await ToggleVendorStatus(vendorId, "active");
        openModal("success", {
          message: "Vendor has been unblocked successfully",
        });
      } else {
        await ToggleVendorStatus(vendorId, "suspend");
        openModal("success", {
          message: "Vendor has been suspended successfully",
        });
      }
      refetch();
      setModalState((prev) => ({ ...prev, open: false }));
    } catch (error: any) {
      console.error("Error suspending vendor:", error);
      openModal("error", {
        message: error?.response?.data?.message || "Error suspending vendor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rows = vendorsData?.map((data) => (
    <Table.Tr
      key={data?.id}
      onClick={() => router.push(`/vendor-management/${data?.id}`)}
      className="cursor-pointer"
    >
      <Table.Td tt="uppercase">#{data?.id}</Table.Td>
      <Table.Td>
        <Flex align="center" gap={8}>
          <Avatar
            size="sm"
            src={data?.avatar || undefined}
            name={data?.name || "U"}
            color="initials"
            allowedInitialsColors={initialsColors}
            alt="avatar"
          />
          <Text fz={14} tt="capitalize">
            {data?.name || "N/A"}
          </Text>
        </Flex>
      </Table.Td>
      <Table.Td>
        <Box w={200} pr={10}>
          <Text truncate="end" fz={14}>
            {data?.title || "N/A"}
          </Text>
        </Box>
      </Table.Td>
      <Table.Td>{data?.phone || "N/A"}</Table.Td>
      <Table.Td>{data?.email || "N/A"}</Table.Td>
      <Table.Td>{`${data?.ratingValue || 0}/5`}</Table.Td>
      <Table.Td>
        <FormatDate data={data?.created_at} formatType="fullDate" />
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
              onClick={() => {
                openModal("suspend", {
                  vendorId: data.id,
                });
              }}
            >
              Suspend
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              onClick={() => {
                openModal("delete", {
                  vendorId: data.id,
                });
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout title="Vendor Management">
      <Flex direction="column" gap={20}>
        {!isFetchingVendors && (
          <>
            {/* Summary Section */}
            <ScrollArea scrollbarSize={0}>
              <Flex align="center" gap={16}>
                <Card miw={240} bg="#171717E5" p="md" radius={16}>
                  <SummaryItem
                    label="Total Vendors"
                    value={
                      <Text fz={20} fw={500} c="#FFFFFF">
                        {vendors?.data?.totalActiveVendors}
                      </Text>
                    }
                  />
                </Card>

                <Card
                  miw={240}
                  bg="#171717E5"
                  p="md"
                  radius={16}
                  className="cursor-pointer"
                  onClick={() => router.push("/vendor-management/pending")}
                >
                  <SummaryItem
                    label="Vendors pending approval"
                    value={
                      <Flex
                        w="100%"
                        align="center"
                        justify="space-between"
                        gap={8}
                      >
                        <Text fz={20} fw={500} c="#FFFFFF">
                          {vendors?.data?.totalInactiveVendors}
                        </Text>
                        <ActionIcon bg="#222222" radius="xl">
                          <Image
                            src={IconCaretRight}
                            width={20}
                            height={20}
                            alt="icon"
                          />
                        </ActionIcon>
                      </Flex>
                    }
                  />
                </Card>

                <Card
                  miw={240}
                  bg="#171717E5"
                  p="md"
                  radius={16}
                  className="cursor-pointer"
                  onClick={() => router.push("/vendor-management/rejected")}
                >
                  <SummaryItem
                    label="Rejected vendors"
                    value={
                      <Flex
                        w="100%"
                        align="center"
                        justify="space-between"
                        gap={8}
                      >
                        <Text fz={20} fw={500} c="#FFFFFF">
                          {vendors?.data?.totalRejectedVendors}
                        </Text>
                        <ActionIcon bg="#222222" radius="xl">
                          <Image
                            src={IconCaretRight}
                            width={20}
                            height={20}
                            alt="icon"
                          />
                        </ActionIcon>
                      </Flex>
                    }
                  />
                </Card>
              </Flex>
            </ScrollArea>

            {/* Filter & Search */}
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "flex-start", md: "center" }}
              justify="space-between"
              bg="#0A0A0A"
              my={10}
              py={10}
              gap={10}
              className="sticky top-14 z-10"
            >
              <Flex w="100%" align="center" justify="space-between" gap={16}>
                <Menu shadow="md">
                  <Menu.Target>
                    <Button
                      size="sm"
                      h={40}
                      style={{ border: "1px solid #181818" }}
                      color="#0D0D0D"
                      radius={8}
                      miw="fit-content"
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
                    {["All"].map((filter) => (
                      <Menu.Item
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                      >
                        {filter}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>

                <TextInput
                  placeholder="Search"
                  variant="default"
                  leftSectionPointerEvents="none"
                  classNames={{ input: inputClasses.searchInputAlt }}
                  value={query}
                  onChange={(e: any) => setQuery(e.currentTarget.value)}
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

              <Button
                h={38}
                px={14}
                radius="md"
                className={classes.btnWhite}
                styles={{ root: { minWidth: 160 } }}
              >
                Add New Vendor
              </Button>
            </Flex>
          </>
        )}

        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={activeVendorsCount}
          activePage={activePage}
          setActivePage={setActivePage}
          rowsPerPage={rowsPerPage}
          isLoading={isFetchingVendors}
        />
      </Flex>

      <ConfirmationModal
        type={
          modalState.type === "delete" || modalState.type === "error"
            ? "error"
            : modalState.type === "suspend"
              ? "warning"
              : "success"
        }
        opened={modalState.open}
        close={() => setModalState((prev) => ({ ...prev, open: false }))}
        title={modalState.title}
        message={modalState.message}
        actions={
          modalState.type === "success" || modalState.type === "error" ? (
            <Flex justify="center">
              <Button
                radius="xl"
                w="50%"
                className={classes.btnWhite}
                onClick={modalState.action}
              >
                {modalState.actionLabel}
              </Button>
            </Flex>
          ) : (
            <Flex justify="center" gap={14}>
              <Button
                radius="xl"
                className={classes.btnNeutral}
                onClick={() =>
                  setModalState((prev) => ({ ...prev, open: false }))
                }
                disabled={isLoading}
                miw="50%"
              >
                {modalState.cancelLabel}
              </Button>

              <Button
                radius="xl"
                className={
                  modalState.type === "delete"
                    ? classes.btnDanger
                    : modalState.type === "suspend"
                      ? isUserSuspended
                        ? classes.btnWhite
                        : classes.btnWarning
                      : classes.btnWhite
                }
                onClick={modalState.action}
                loading={isLoading}
                miw="50%"
              >
                {modalState.actionLabel}
              </Button>
            </Flex>
          )
        }
      />
    </AppLayout>
  );
};

export default VendorManagement;
