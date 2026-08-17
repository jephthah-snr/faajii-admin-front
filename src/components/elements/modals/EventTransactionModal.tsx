"use client";

import {
  ActionIcon,
  Button,
  CopyButton,
  Divider,
  Drawer,
  Flex,
  Text,
  Tooltip,
} from "@mantine/core";
import StatusBadge from "../status-badge";
import classes from "@/styles/General.module.css";
import { convertToNaira, formatStringAmount, generateReceipt2 } from "@/utils";
import FormatDate from "../format-date";
import { useState } from "react";
import { IconCopy } from "@/config/icons";
import { Edges } from "@/services/api/event/event.types";

interface EventTransactionModalProps {
  opened: boolean;
  close: () => void;
  transactionData: Edges;
}

const EventTransactionModal = ({
  opened,
  close,
  transactionData,
}: EventTransactionModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generateReceipt2(transactionData!);
    } catch (error) {
      console.error("Failed to generate receipt:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const transactionAmount = convertToNaira(transactionData?.amount);

  return (
    <Drawer
      opened={opened}
      onClose={close}
      size="md"
      title="Transaction Receipt"
    >
      <>
        <Flex
          direction="column"
          bg="var(--fj-surface-elevated)"
          className="rounded-xl long-dash-border"
          mt={20}
          p={20}
          gap={40}
        >
          <Flex direction="column" align="center" justify="center" gap={10}>
            <Text fz={24} fw={500} c="#fff">
              ₦{formatStringAmount(transactionAmount || 0)}
            </Text>

            <StatusBadge
              status={transactionData?.status || ""}
              isTransparent={false}
              isTransaction
              useAltColor
              size="xl"
              px={20}
              fz={13}
            />
          </Flex>

          {/* Details */}
          <Flex direction="column" gap={18}>
            {/* Date */}
            <GridItem
              label="Date"
              value={
                <FormatDate
                  data={transactionData?.created_at || ""}
                  formatType="dateTime"
                />
              }
            />

            {/* Sender */}
            <GridItem
              label="Sender"
              value={transactionData?.meta?.source_name || "N/A"}
            />

            {/* Sender Bank */}
            <GridItem
              label="Sender bank"
              value={transactionData?.meta?.source_bank_name || "N/A"}
            />

            {/* Recipient */}
            <GridItem
              label="Recipient"
              value={
                transactionData?.meta?.destination_name
                  ? transactionData?.meta?.destination_name
                  : "N/A"
              }
            />

            {/* Description */}
            <GridItem
              label="Description"
              value={transactionData?.description || "N/A"}
            />

            {/* Transaction Type */}
            <GridItem
              label="Transaction Type"
              value={transactionData?.category || "N/A"}
            />

            {/* Reference */}
            <GridItem
              label="Reference"
              value={
                <Flex gap={4} align="center">
                  <Text className="breakable">
                    {transactionData?.id || "N/A"}
                  </Text>
                  <CopyButton
                    value={transactionData?.id || "N/A"}
                    timeout={2000}
                  >
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied && "Copied"}
                        opened={copied}
                        color="#24A181"
                        withArrow
                        position="top"
                      >
                        <ActionIcon variant="transparent" onClick={copy}>
                          <IconCopy size={20} color="currentColor" variant="Linear" />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Flex>
              }
            />

            {/* Session ID */}
            <GridItem
              label="Session ID"
              value={
                transactionData?.session_id ? (
                  <Flex gap={4} align="center">
                    <Text className="breakable">
                      {transactionData?.session_id || "N/A"}
                    </Text>
                    <CopyButton
                      value={transactionData?.session_id || "N/A"}
                      timeout={2000}
                    >
                      {({ copied, copy }) => (
                        <Tooltip
                          label={copied && "Copied"}
                          opened={copied}
                          color="#24A181"
                          withArrow
                          position="top"
                        >
                          <ActionIcon variant="transparent" onClick={copy}>
                            <IconCopy size={20} color="currentColor" variant="Linear" />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Flex>
                ) : (
                  "N/A"
                )
              }
            />
          </Flex>
        </Flex>

        <Divider color="#111111" my={20} />

        {/* Buttons */}
        <Flex gap="sm">
          <Button radius="xl" className={classes.btnNeutral} fullWidth>
            Refund
          </Button>
          <Button
            radius="xl"
            onClick={handleDownload}
            className={classes.btnWhite}
            loading={isGenerating}
            disabled={isGenerating}
            fullWidth
          >
            <Flex align="center" justify="center" gap={4}>
              <span>Download</span>
              <span className="hidden md:block">Receipt</span>
            </Flex>
          </Button>
        </Flex>
      </>
    </Drawer>
  );
};

export default EventTransactionModal;

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
