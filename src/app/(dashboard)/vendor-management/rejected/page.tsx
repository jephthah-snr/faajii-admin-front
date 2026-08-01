"use client";

import { ConfirmationModal, FormatDate, PpTable } from "@/components";
import { IconEllipsisV, IconSearch } from "@/icons";
import { AppLayout } from "@/layout";
import { initialsColors, rowsPerPage } from "@/utils";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Flex,
  Menu,
  rem,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import classes from "@/styles/General.module.css";
import { useQuery } from "@tanstack/react-query";
import { ApproveVendor, GetVendors, RejectVendor } from "@/services/api";
import inputClasses from "@/styles/Input.module.css";

const tableHeaders = [
  "Business Name",
  "Type",
  "Phone Number",
  "Email Address",
  "Request Date",
  "Action",
];

const RejectedVendors = () => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);

  const [modalState, setModalState] = useState({
    open: false,
    type: "", // 'approve' | 'reject' | 'error' | 'success'
    title: "",
    message: "",
    actionLabel: "",
    cancelLabel: "Cancel",
    action: () => {},
  });

  //Fetching vendors data
  const {
    data: vendors,
    isFetching: isFetchingVendors,
    refetch,
  } = useQuery({
    queryKey: ["vendors", activePage, rowsPerPage, debouncedQuery],
    queryFn: () =>
      GetVendors(
        String(activePage),
        String(rowsPerPage),
        debouncedQuery,
        "All",
      ),
    placeholderData: (prev) => prev,
  });
  const vendorsData = vendors?.data?.rejectedVendors || [];
  const rejectedVendorsCount = vendors?.data?.pagination?.rejected?.total || 0;

  const openModal = (type: string, options: any = {}) => {
    switch (type) {
      case "approve":
        setModalState({
          open: true,
          type,
          title: "Approve Vendor?",
          message: "Do you really want to approve this vendor?",
          actionLabel: "Approve",
          cancelLabel: "Cancel",
          action: () => handleApprove(options.vendorId),
        });
        break;

      case "reject":
        setModalState({
          open: true,
          type,
          title: "Reject Vendor?",
          message: "Do you really want to reject this vendor?",
          actionLabel: "Reject",
          cancelLabel: "Cancel",
          action: () => handleReject(options.vendorId),
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

  const handleReject = async (vendorId: string) => {
    setIsLoading(true);
    try {
      await RejectVendor(vendorId);
      setModalState((prev) => ({ ...prev, open: false }));
      openModal("success", {
        message: "Vendor has been rejected successfully",
      });

      refetch();
    } catch (error: any) {
      console.error("Error rejecting vendor:", error);
      openModal("error", {
        message: error?.response?.data?.message || "Error rejecting vendor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    setIsLoading(true);
    try {
      await ApproveVendor(vendorId);
      setModalState((prev) => ({ ...prev, open: false }));
      openModal("success", {
        message: "Vendor has been approved successfully",
      });

      refetch();
    } catch (error: any) {
      console.error("Error approving vendor:", error);
      openModal("error", {
        message: error?.response?.data?.message || "Error approving vendor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rows = vendorsData?.map((data) => {
    return (
      <Table.Tr
        key={data?.id}
        onClick={() => router.push(`/vendor-management/rejected/${data?.id}`)}
        className={`cursor-pointer`}
      >
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
                  openModal("approve", {
                    vendorId: data.id,
                  });
                }}
              >
                Approve
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout title="Vendors" hasBackButton>
      <Flex direction="column" gap={20}>
        {/* Filter & search */}
        {!isFetchingVendors && (
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            bg="#0A0A0A"
            my={10}
            py={10}
            gap={16}
            className="sticky top-14 z-10"
          >
            <Flex align="center" gap={16}>
              <Text c="#fff" fw={700} fz={16}>
                Rejected Vendors
              </Text>
              <Box className="rounded-[6px]" p={10} h={38} bg="#292929">
                <Flex align="center" gap={4} wrap="wrap">
                  <Text fz={14} c="#868686">
                    Total:
                  </Text>
                  <Text fz={14} c="#fff">
                    {vendors?.data?.totalRejectedVendors}
                  </Text>
                </Flex>
              </Box>
            </Flex>

            <TextInput
              placeholder="Search"
              variant="default"
              w={{ base: "100%", md: "auto" }}
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
        )}

        {/* Table */}
        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={rejectedVendorsCount}
          activePage={activePage}
          setActivePage={setActivePage}
          rowsPerPage={rowsPerPage}
          isLoading={isFetchingVendors}
        />
      </Flex>

      {/* Confirmation modal */}
      <ConfirmationModal
        type={
          modalState.type === "approve"
            ? "warning"
            : modalState.type === "reject" || modalState.type === "error"
              ? "error"
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
                  modalState.type === "reject"
                    ? classes.btnDanger
                    : modalState.type === "approve"
                      ? classes.btnWarning
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

export default RejectedVendors;
