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
import { formatStringAmount, generateReceipt } from "@/utils";
import { GetTransactionDetails } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import FormatDate from "../format-date";
import { TransactionDetailsSkeleton } from "../skeletons";
import { useState } from "react";
import Image from "next/image";
import { IconCopy } from "@/icons";

interface TransactionModalProps {
  opened: boolean;
  close: () => void;
  transactionRef: string;
}

const TransactionModal = ({
  opened,
  close,
  transactionRef,
}: TransactionModalProps) => {
  //Fetching transaction details
  const { data: transactionDetails, isFetching } = useQuery({
    queryKey: ["transactionDetails", transactionRef],
    queryFn: () => GetTransactionDetails(transactionRef),
    enabled: opened,
  });
  const transactionData = transactionDetails?.data;

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generateReceipt(transactionData!);
    } catch (error) {
      console.error("Failed to generate receipt:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Amount is already converted to NAIRA by the backend
  const formattedAmount = transactionData?.transactionAmount || 0;

  return (
    <Drawer
      opened={opened}
      onClose={close}
      size="md"
      title="Transaction Receipt"
    >
      {isFetching ? (
        <TransactionDetailsSkeleton />
      ) : (
        <>
          <Flex
            direction="column"
            bg="#121212"
            className="rounded-xl long-dash-border"
            mt={20}
            p={20}
            gap={40}
          >
            <Flex direction="column" align="center" justify="center" gap={10}>
              <Text fz={24} fw={500} c="#fff">
                ₦{formatStringAmount(formattedAmount || 0)}
              </Text>

              <StatusBadge
                status={transactionData?.transactionStatus || ""}
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
              <GridItem label="Sender" value="N/A" />

              {/* Sender Bank */}
              <GridItem label="Sender bank" value={"N/A"} />

              {/* Recipient */}
              <GridItem
                label="Recipient"
                value={
                  transactionData?.destination?.accountName
                    ? transactionData?.destination?.accountName
                    : "N/A"
                }
              />

              {/* Description */}
              <GridItem
                label="Description"
                value={transactionData?.narration || "N/A"}
              />

              {/* Transaction Type */}
              <GridItem
                label="Transaction Type"
                value={transactionData?.transactionType || "N/A"}
              />

              {/* Reference */}
              <GridItem
                label="Reference"
                value={
                  <Flex gap={4} align="center">
                    <Text className="breakable">
                      {transactionData?.reference || "N/A"}
                    </Text>
                    <CopyButton
                      value={transactionData?.reference || "N/A"}
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
                            <Image
                              src={IconCopy}
                              width={20}
                              height={20}
                              alt="icon"
                            />
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
                  transactionData?.metaData?.session_id ? (
                    <Flex gap={4} align="center">
                      <Text className="breakable">
                        {transactionData?.metaData?.session_id || "N/A"}
                      </Text>
                      <CopyButton
                        value={transactionData?.metaData?.session_id || "N/A"}
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
                              <Image
                                src={IconCopy}
                                width={20}
                                height={20}
                                alt="icon"
                              />
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
            {/* <Button radius="xl" className={classes.btnNeutral} fullWidth>
              Refund
            </Button> */}
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
      )}
    </Drawer>
  );
};

export default TransactionModal;

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
