"use client";

import { Box, Divider, Drawer, Flex, Loader, Menu, Text } from "@mantine/core";
import SummaryItem from "../summary-item";
import StatusBadge from "../status-badge";
import {
  convertToNaira,
  formatStatusLabel,
  formatStringAmount,
  orderStatuses,
} from "@/utils";
import { Order } from "@/services/api/order-management/order.types";
import { NoImageS } from "@/images";
import React, { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import OrderStatusModal from "./OrderStatusModal";
import Image from "next/image";
import FormatDate from "../format-date";
import Link from "next/link";

interface OrderDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  data: Order;
  refetch: () => void;
}

const OrderDetailsModal = ({
  opened,
  onClose,
  data,
  refetch,
}: OrderDetailsModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [imageLoading, setImageLoading] = useState(true);

  const [
    openedStatusModal,
    { open: openStatusModal, close: closeStatusModal },
  ] = useDisclosure(false);

  useEffect(() => {
    if (opened) {
      setSelectedStatus(data?.deliveryStatus || "");
    }
  }, [opened, data?.deliveryStatus]);

  useEffect(() => {
    setImageLoading(true);
  }, [data?.productImage, opened]);

  if (!data) return;

  const handleOpenStatusModal = (status: string) => {
    setSelectedStatus(status);
    openStatusModal();
  };

  const isConvertedToCash = data?.status === "Converted to Cash";

  const badgeStatus = isConvertedToCash
    ? data?.status
    : formatStatusLabel(data?.deliveryStatus || "");

  return (
    <>
      <Drawer
        size="md"
        title={
          <Flex direction="column" align="flex-start">
            <Text c="#fff" fz={18} fw={500}>
              {`Reference #${data?.reference}`}
            </Text>

            <Link
              target="_blank"
              href={`https://www.faajii.rsvp/`}
              style={{ color: "#D9D9D9B2", fontSize: "13px" }}
            >
              www.faajii.rsvp
            </Link>
          </Flex>
        }
        opened={opened}
        onClose={onClose}
      >
        <Flex direction="column" gap={30} pt={30}>
          {/* Item Details */}
          <Flex
            direction={{ base: "column", md: "row" }}
            align="flex-start"
            gap={26}
          >
            <Box pos="relative" w={{ base: "100%", md: 360 }}>
              {imageLoading && (
                <Flex
                  pos="absolute"
                  inset={0}
                  align="center"
                  justify="center"
                  bg="var(--fj-surface-elevated)"
                  className="rounded-xl"
                >
                  <Loader size="sm" />
                </Flex>
              )}

              <Image
                src={data?.productImage || NoImageS}
                width={360}
                height={360}
                loading="lazy"
                onLoadingComplete={() => setImageLoading(false)}
                className={`rounded-xl transition-opacity duration-300 ${
                  imageLoading ? "opacity-50" : "opacity-100"
                }`}
                alt="image"
              />
            </Box>

            <Flex direction="column" gap={10} w="100%">
              <SummaryItem
                label="Item"
                value={data?.productName || "N/A"}
                fz={14}
              />

              <SummaryItem
                label="Price"
                value={`₦ ${formatStringAmount(
                  convertToNaira(data?.orderAmount) || "0.00",
                )}`}
                fz={14}
              />

              <SummaryItem
                label="Status"
                value={
                  <Menu position="bottom-start" disabled={isConvertedToCash}>
                    <Menu.Target>
                      <Flex
                        onClick={(e) => e.stopPropagation()}
                        align="center"
                        gap={2}
                        className="cursor-pointer"
                      >
                        <StatusBadge
                          status={badgeStatus}
                          px={18}
                          bg="var(--fj-surface-card)"
                          size="lg"
                          style={{ border: "1px solid #2D2D2D" }}
                          useAltColor
                          hasDropdown
                        />
                      </Flex>
                    </Menu.Target>

                    <Menu.Dropdown
                      bg="var(--fj-surface-elevated)"
                      style={{
                        border: "1px solid #1C1C1C",
                        borderRadius: "12px",
                      }}
                    >
                      {orderStatuses.map((status, index) => (
                        <React.Fragment key={status}>
                          <Menu.Item
                            ta="left"
                            py={4}
                            px={0}
                            pr={20}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStatusModal(status);
                            }}
                          >
                            <StatusBadge status={status} useAltColor hasDot />
                          </Menu.Item>

                          {index !== orderStatuses.length - 1 && (
                            <Divider color="#1C1C1C" my={4} />
                          )}
                        </React.Fragment>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                }
              />
            </Flex>
          </Flex>

          {/* Order details */}
          <Flex direction="column" gap={10}>
            <Text fz={13} c="#D9D9D9B2">
              Order Details:
            </Text>

            <Flex
              direction="column"
              bg="var(--fj-surface-elevated)"
              className="rounded-xl long-dash-border"
              p={20}
              gap={30}
            >
              <Flex direction="column" align="center" justify="center" gap={2}>
                <Text fz={13} c="#D9D9D9B2">
                  Amount
                </Text>

                <Text fz={30} fw={500} c="#fff">
                  ₦
                  {formatStringAmount(
                    convertToNaira(data?.orderAmount) || "0.00",
                  )}
                </Text>

                <StatusBadge
                  status={data?.paymentStatus || ""}
                  isTransparent={false}
                  isTransaction
                  useAltColor
                  size="lg"
                  px={20}
                />
              </Flex>

              <Divider color="#414141" variant="dashed" />

              {/* Details */}
              <Flex direction="column" gap={18}>
                {/* Receiver’s Name */}
                <GridItem
                  label="Receiver's Name"
                  value={data?.receiver?.name || "N/A"}
                />

                {/* Email */}
                <GridItem
                  label="Email"
                  value={data?.receiver?.email || "N/A"}
                />

                {/* Phone Number */}
                <GridItem
                  label="Phone Number"
                  value={data?.receiver?.phone || "N/A"}
                />

                {/* Order Created */}
                <GridItem
                  label="Order Created"
                  value={
                    <FormatDate
                      data={data?.createdAt || ""}
                      formatType="dateTime"
                    />
                  }
                />

                {/* Order Delivered */}
                <GridItem
                  label="Order Delivered"
                  value={
                    <FormatDate
                      data={data?.completedAt || ""}
                      formatType="dateTime"
                    />
                  }
                />

                {/* Address */}
                <GridItem
                  label="Address"
                  value={data?.deliveryAddress || "N/A"}
                />
              </Flex>
            </Flex>
          </Flex>

          {/* Notes */}
          {/* <Flex direction="column" gap={10}>
            <Text fz={13} c="#D9D9D9B2">
              Notes
            </Text>

            <Card radius={16} p={20} bg="var(--fj-surface-elevated)">
              <Text fz={14} c="#fff">
                {data?.notes || "N/A"}
              </Text>
            </Card>
          </Flex> */}
        </Flex>
      </Drawer>

      <OrderStatusModal
        order={data}
        selectedStatus={selectedStatus}
        opened={openedStatusModal}
        close={closeStatusModal}
        refetch={refetch}
      />
    </>
  );
};

export default OrderDetailsModal;

interface GridItemProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

const GridItem = ({ label, value, className }: GridItemProps) => {
  return (
    <Flex justify="space-between" gap={14} className={className}>
      <Text fz={13} c="#969696">
        {label}
      </Text>
      <Flex fz={14} c="#fff" className="text-right breakable" wrap="wrap">
        {value}
      </Flex>
    </Flex>
  );
};
