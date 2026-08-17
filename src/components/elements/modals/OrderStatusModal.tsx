"use client";

import { Order } from "@/services/api/order-management/order.types";
import {
  Button,
  Divider,
  Flex,
  Menu,
  Modal,
  Text,
  Textarea,
} from "@mantine/core";
import StatusBadge from "../status-badge";
import { normalizeStatus, orderStatuses, orderStatusSchema } from "@/utils";
import { UpdateOrderStatus } from "@/services/api";
import React, { useEffect, useState } from "react";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import ConfirmationModal from "./ConfirmationModal";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";

interface OrderStatusModalProps {
  order: Order;
  selectedStatus: string | undefined;
  opened: boolean;
  close: () => void;
  refetch: () => void;
}

const OrderStatusModal = ({
  order,
  selectedStatus,
  opened,
  close,
  refetch,
}: OrderStatusModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(selectedStatus || "");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationType, setConfirmationType] =
    useState<ConfirmationModalTypes>("success");
  const [
    openedConfirmation,
    { open: openConfirmation, close: closeConfirmation },
  ] = useDisclosure(false);

  const statusesRequiringNote = ["Refunded", "Returned", "Failed"];
  const requiresNote = statusesRequiringNote.includes(status);

  useEffect(() => {
    if (opened) {
      setStatus(selectedStatus || "");
      form.setFieldValue("status", selectedStatus || "");
    }
  }, [opened, selectedStatus]);

  useEffect(() => {
    if (!requiresNote) {
      form.setFieldValue("note", "");
    }
  }, [requiresNote]);

  const form = useForm({
    initialValues: {
      status: "",
      note: "",
    },
    validate: yupResolver(orderStatusSchema),
    validateInputOnChange: ["status"],
    transformValues: (values) => ({
      ...values,
    }),
  });

  const handleStatusChange = async (values: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        deliveryStatus: normalizeStatus(values.status),
        ...(values.note?.trim() && { note: values.note }),
      };

      await UpdateOrderStatus(String(order?.id), payload);

      setConfirmationMessage("Order status has been updated.");
      setConfirmationType("success");
      openConfirmation();

      handleClose();

      refetch();
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      setConfirmationMessage(
        error?.response?.data?.message ||
          "Failed to update order status. Please try again.",
      );
      setConfirmationType("error");
      openConfirmation();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    close();
    form.reset();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        transitionProps={{ transition: "fade-up" }}
        centered
        withCloseButton={false}
        styles={{
          content: {
            backgroundColor: "#000",
            borderRadius: "24px",
          },
          header: {
            backgroundColor: "#000",
          },
          title: {
            textAlign: "left",
          },
        }}
        overlayProps={{
          bg: "#191919CC",
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        title={
          <Flex justify="space-between" px="sm">
            <Flex direction="column" align="flex-start">
              <Text fz={18} fw={700}>
                {`Reference #${order?.reference}`}
              </Text>

              <Link
                target="_blank"
                href={`https://www.faajii.rsvp/`}
                style={{ color: "#D9D9D9B2", fontSize: "13px" }}
              >
                www.faajii.rsvp
              </Link>
            </Flex>

            <Modal.CloseButton className={classes.rightDrawerClose} />
          </Flex>
        }
      >
        <form onSubmit={form.onSubmit(handleStatusChange)}>
          <Flex direction="column" gap={20} p="sm">
            {/* Status */}
            <Flex direction="column" gap={4} pb={requiresNote ? 0 : 20}>
              <Text fz={13} c="#D9D9D9B2">
                Status
              </Text>

              <Menu position="bottom-start">
                <Menu.Target>
                  <Flex
                    onClick={(e) => e.stopPropagation()}
                    align="center"
                    gap={2}
                    className="cursor-pointer w-fit"
                  >
                    <StatusBadge
                      status={status}
                      px={18}
                      bg="var(--fj-surface-card)"
                      size="xl"
                      style={{ border: "1px solid #2D2D2D" }}
                      useAltColor
                      hasDropdown
                    />
                  </Flex>
                </Menu.Target>

                <Menu.Dropdown
                  bg="var(--fj-surface-elevated)"
                  style={{ border: "1px solid #1C1C1C", borderRadius: "12px" }}
                >
                  {orderStatuses.map((item, index) => (
                    <React.Fragment key={item}>
                      <Menu.Item
                        ta="left"
                        py={4}
                        px={0}
                        pr={20}
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatus(item);
                          form.setFieldValue("status", item);
                        }}
                      >
                        <StatusBadge status={item} useAltColor hasDot />
                      </Menu.Item>

                      {index !== orderStatuses.length - 1 && (
                        <Divider color="#1C1C1C" my={4} />
                      )}
                    </React.Fragment>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Flex>

            {/* Notes */}
            {requiresNote && (
              <Textarea
                label="Notes"
                placeholder="Enter notes for this delivery."
                autosize
                minRows={3}
                maxRows={3}
                classNames={{ input: inputClasses.dashedBorderInput }}
                {...form.getInputProps("note")}
              />
            )}

            {/* Buttons */}
            <Flex align="center" gap={10}>
              <Button
                h={50}
                radius="xl"
                color="#363636"
                fz={{ base: 15, md: 16 }}
                w={{ base: "45%", md: "40%" }}
                styles={{ root: { minWidth: "auto", padding: "0 18px" } }}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                h={50}
                radius="xl"
                color="#5769E9"
                fz={{ base: 15, md: 16 }}
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting || !form.isValid()}
                styles={{ root: { minWidth: "auto" } }}
              >
                Update Status
              </Button>
            </Flex>
          </Flex>
        </form>
      </Modal>

      <ConfirmationModal
        title={confirmationType === "success" ? "Successful" : "Error"}
        opened={openedConfirmation}
        close={closeConfirmation}
        message={confirmationMessage}
        type={confirmationType}
      />
    </>
  );
};

export default OrderStatusModal;
