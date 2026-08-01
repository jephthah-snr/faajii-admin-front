"use client";

import { IconCaretDown, IconEdit } from "@/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  NumberInput,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import Image from "next/image";
import classes from "@/styles/General.module.css";
import {
  AdminDetailsSkeleton,
  ConfirmationModal,
  FormatDate,
} from "@/components";
import { useQuery } from "@tanstack/react-query";
import { DeleteAdmin, GetSingleAdmin } from "@/services/api";
import { capitalizeString, initialsColors } from "@/utils";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";

interface AdminDetailsProps {
  id: string;
  isLoggedInUser: boolean;
  refetch: () => void;
  closeDrawer?: () => void;
}

const defaultModalConfig = {
  type: "error" as ConfirmationModalTypes | undefined,
  title: "Delete Admin?",
  message: "Do you really want to delete this admin?",
};

const AdminDetails = ({
  id,
  isLoggedInUser,
  refetch,
  closeDrawer,
}: AdminDetailsProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [modalConfig, setModalConfig] = useState(defaultModalConfig);

  useEffect(() => {
    if (!opened) {
      setModalConfig(defaultModalConfig);
    }
  }, [opened, close]);

  const { data: adminDetails, isFetching: isFetchingAdminDetails } = useQuery({
    queryKey: ["adminDetails", id],
    queryFn: () => GetSingleAdmin(id),
  });
  const details = adminDetails?.data || null;

  const handleDeleteAdmin = async () => {
    setIsDeleting(true);
    try {
      await DeleteAdmin(id);
      setModalConfig({
        type: "success",
        title: "Successful",
        message: "Admin deleted successfully.",
      });
      closeDrawer?.();
      refetch();
    } catch (error: any) {
      console.log(error);

      setModalConfig({
        type: "warning",
        title: "Error",
        message: "Failed to delete admin.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      {isFetchingAdminDetails ? (
        <AdminDetailsSkeleton />
      ) : (
        <>
          <Flex justify={"flex-end"} direction="column" gap={8}>
            <Text c="#D9D9D9B2" fz={13} ta="right">
              Admin ID :{" "}
              <span className="font-medium text-white">#{details?.id}</span>
            </Text>
            <Text c="#D9D9D9B2" fz={13} ta="right">
              Signed Up :{" "}
              <span className="font-medium text-white">
                <FormatDate
                  data={details?.created_at || ""}
                  formatType="dateTime"
                />
              </span>
            </Text>
          </Flex>

          <Box className="md:overflow-auto md:h-[75vh]" mt={40}>
            <Flex direction="column" align="center" gap={30}>
              <Box pos="relative" w="fit-content">
                <Avatar
                  size={105}
                  name={`${details?.firstName || ""} ${details?.lastName || ""}`.trim() || "U"}
                  color="initials"
                  allowedInitialsColors={initialsColors}
                  src={details?.avatar}
                  alt="avatar"
                />

                <Image
                  className="absolute bottom-0 right-0 cursor-pointer"
                  src={IconEdit}
                  width={40}
                  height={40}
                  alt="icon"
                />
              </Box>

              {/* Form */}
              <Flex direction="column" gap={10} w="100%">
                <TextInput
                  label="Full Name"
                  value={`${details?.firstName || ""} ${details?.lastName || ""}`.trim() || "N/A"}
                  placeholder="e.g John Doe"
                  readOnly
                />
                <Select
                  label="Admin Role"
                  placeholder="Tap to select"
                  value={capitalizeString(details?.role || "")}
                  rightSection={
                    <Image
                      src={IconCaretDown}
                      width={20}
                      height={20}
                      alt="icon"
                    />
                  }
                  data={["Admin", "Super", "Support", "Finance"]}
                />
                <TextInput
                  type="email"
                  label="E-mail Address"
                  value={details?.email}
                  placeholder="e.g. johndoe@email.com"
                  readOnly
                />
                <NumberInput
                  label="Phone Number"
                  value={details?.phoneNumber}
                  hideControls
                  readOnly
                />
              </Flex>

              {!isLoggedInUser && (
                <Button
                  className={classes.btnDanger}
                  onClick={open}
                  radius="xl"
                  w={{ base: "100%", md: "80%" }}
                >
                  Delete Admin
                </Button>
              )}
            </Flex>
          </Box>
        </>
      )}

      <ConfirmationModal
        type={modalConfig.type}
        opened={opened}
        close={close}
        title={modalConfig.title}
        message={modalConfig.message}
        actions={
          <Flex justify="center" gap={14}>
            <Button
              radius="xl"
              className={
                modalConfig.type === "error"
                  ? classes.btnNeutral
                  : classes.btnWhite
              }
              onClick={close}
              disabled={isDeleting}
              miw="50%"
            >
              {modalConfig.type === "error"
                ? "Cancel"
                : modalConfig.type === "warning"
                ? "Retry"
                : "Done"}
            </Button>

            {modalConfig.type === "error" && (
              <Button
                radius="xl"
                className={classes.btnDanger}
                onClick={handleDeleteAdmin}
                disabled={isDeleting}
                loading={isDeleting}
                miw="50%"
              >
                Delete
              </Button>
            )}
          </Flex>
        }
      />
    </Box>
  );
};

export default AdminDetails;
