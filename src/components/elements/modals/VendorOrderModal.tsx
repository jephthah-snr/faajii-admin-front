"use client";

import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  CopyButton,
  Drawer,
  Flex,
  Menu,
  Progress,
  ScrollArea,
  Text,
  Tooltip,
} from "@mantine/core";
import SummaryItem from "../summary-item";
import StatusBadge from "../status-badge";
import { IconChevronDown, IconCopy } from "@/config/icons";
import {
  formatStatusLabel,
  getProgressColor,
  initialsColors,
  normalizeAddress,
} from "@/utils";
import { IVendorOrder } from "@/services/api/vendor-management/vendor.types";
import FormatDate from "../format-date";

interface VendorOrderModalProps {
  opened: boolean;
  onClose: () => void;
  data: IVendorOrder;
  loadingRemove?: boolean;
  onRemove: (id: string) => void;
}

const VendorOrderModal = ({
  opened,
  onClose,
  data,
  loadingRemove,
  onRemove,
}: VendorOrderModalProps) => {
  if (!data) return;

  const progressColor = getProgressColor(
    data?.payment?.progressPercentage || 0,
    "#F66A00",
  );

  const address = normalizeAddress(data?.event?.address);

  return (
    <Drawer title={`Event Booking Details`} opened={opened} onClose={onClose}>
      <Flex mih="100vh" direction="column" justify="space-between" pt={20}>
        <ScrollArea.Autosize mah="100%" scrollbarSize={0}>
          <Flex direction="column" gap={30} pb={30}>
            {/* Event details */}
            <SummaryItem
              label="Event Name:"
              value={data?.event?.name || "N/A"}
            />
            <SummaryItem
              label="Date & Time:"
              value={
                <Text fw={500} fz={18} c="#e1e1e1">
                  <FormatDate
                    data={data?.event?.startDate}
                    formatType="orderStart"
                  />
                  {", "}
                  <FormatDate
                    data={data?.event?.startDate}
                    formatType="orderTime"
                  />
                  {" - "}
                  <FormatDate
                    data={data?.event?.endDate}
                    formatType="orderTime"
                  />
                </Text>
              }
            />
            <SummaryItem
              label="Address"
              value={
                <Flex gap={4}>
                  <Text>{address}</Text>
                  <CopyButton value={address} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied && "Copied"}
                        opened={copied}
                        color="#24A181"
                        withArrow
                        position="right"
                      >
                        <ActionIcon variant="transparent" onClick={copy}>
                          <IconCopy size={20} color="currentColor" variant="Linear" />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Flex>
              }
              fz={14}
            />
            <SummaryItem
              label="Booking Status"
              value={
                <Menu position="bottom-start">
                  <Menu.Target>
                    <Flex align="center" gap={2} className="cursor-pointer">
                      <StatusBadge
                        status={formatStatusLabel(data?.status)}
                        px={0}
                        useAltColor
                      />
                      <IconChevronDown size={20} color="currentColor" variant="Linear" />
                    </Flex>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {[
                      "Confirmed",
                      "In Progress",
                      "Completed",
                      "Cancelled",
                      "No Show",
                    ].map((status) => (
                      <Menu.Item key={status}>{status}</Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              }
            />

            {/* Host details */}
            <Card radius={16} p={20} bg="transparent">
              <Flex direction="column" gap={20}>
                <Text fw={700} c="#fff">
                  Creator Details
                </Text>

                <Flex direction="column" gap={10}>
                  <ProfileDetail
                    title="Creator:"
                    value={
                      <Flex align="center" gap={8}>
                        <Avatar
                          size="sm"
                          src={data?.host?.avatar || undefined}
                          name={data?.host?.name || "U"}
                          color="initials"
                          allowedInitialsColors={initialsColors}
                          alt="avatar"
                        />
                        <Text c="#E1E1E1" fw={500} fz={14} tt="capitalize">
                          {data?.host?.name || "N/A"}
                        </Text>
                      </Flex>
                    }
                  />
                  <ProfileDetail
                    title="Phone:"
                    value={data?.host?.phone || "N/A"}
                  />
                  <ProfileDetail
                    title="Email:"
                    value={data?.host?.email || "N/A"}
                  />
                </Flex>
              </Flex>
            </Card>

            {/* Payment details */}
            <Card radius={16} p={26} bg="transparent">
              <Flex direction="column" gap={16}>
                <Flex align="center" gap={10}>
                  <Flex align="center" gap={4}>
                    <Box w={8} h={8} bg="var(--fj-accent)" className="rounded-full" />
                    <Text fz={13} c="#F66A00">
                      Payment so far:
                    </Text>
                  </Flex>
                  <Text fz={13} c="#fff">
                    {data?.payment?.formattedPaid || "₦0.00"}
                  </Text>
                </Flex>

                <Box>
                  <Progress
                    value={data?.payment?.progressPercentage || 0}
                    w="100%"
                    color={progressColor}
                  />
                </Box>

                <Flex align="center" gap={4}>
                  <Text fz={13} c="#fff">
                    {data?.payment?.formattedPaid || "₦0.00"} sent
                  </Text>
                  <Text fz={13} c="#D9D9D9B2">
                    out of {data?.payment?.formattedRemaining || "₦0.00"}
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </ScrollArea.Autosize>

        {/* Remove button */}
        <Flex
          justify="flex-end"
          py="md"
          bg="var(--fj-bg)"
          pos="sticky"
          bottom={0}
          left={0}
          w="100%"
          gap={10}
        >
          <Button
            size="sm"
            radius="xl"
            color="#FF6464"
            c="#000000"
            onClick={() => onRemove(String(data?.id))}
            loading={loadingRemove}
            disabled={loadingRemove}
            styles={{ root: { minWidth: "auto" } }}
          >
            Revoke Order
          </Button>
        </Flex>
      </Flex>
    </Drawer>
  );
};

export default VendorOrderModal;

const ProfileDetail = ({
  title,
  value,
}: {
  title: string;
  value: string | React.ReactNode;
}) => {
  return (
    <Flex align="center" gap={16}>
      <Text fz={14} fw={500} c="#5E5E5E" flex="25% 0">
        {title}
      </Text>
      <Box flex="75% 0">
        {typeof value === "string" ? (
          <Text c="#fff">{value || "N/A"}</Text>
        ) : (
          value
        )}
      </Box>
    </Flex>
  );
};
