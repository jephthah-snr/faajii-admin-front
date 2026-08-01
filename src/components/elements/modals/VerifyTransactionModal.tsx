"use client";

import {
  ActionIcon,
  Box,
  Button,
  CopyButton,
  Divider,
  Drawer,
  Flex,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import StatusBadge from "../status-badge";
import classes from "@/styles/General.module.css";
import {
  convertToNaira,
  formatStringAmount,
  verifyTransactionSchema,
} from "@/utils";
import FormatDate from "../format-date";
import { TransactionDetailsSkeleton } from "../skeletons";
import Image from "next/image";
import { IconCopy } from "@/icons";
import { useState } from "react";
import { yupResolver } from "mantine-form-yup-resolver";
import { useForm } from "@mantine/form";
import { CompleteTransaction, VerifyTransaction } from "@/services/api";
import { VerifiedTransaction } from "@/services/api/transaction/transaction.types";
import ConfirmationModal from "./ConfirmationModal";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";

interface VerifyTransactionModalProps {
  opened: boolean;
  close: () => void;
}

const VerifyTransactionModal = ({
  opened,
  close,
}: VerifyTransactionModalProps) => {
  const isFetching = false;

  const [showTransaction, setShowTransaction] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionError, setTransactionError] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<
    VerifiedTransaction | undefined
  >(undefined);

  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationType, setConfirmationType] =
    useState<ConfirmationModalTypes>("success");
  const [
    openedConfirmation,
    { open: openConfirmation, close: closeConfirmation },
  ] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      session_id: "",
    },
    validate: yupResolver(verifyTransactionSchema),
    transformValues: (values) => ({
      ...values,
    }),
  });

  const lookupSessionId = async () => {
    setIsLookingUp(true);
    try {
      const sessionId = form.values.session_id;
      const res = await VerifyTransaction(sessionId);

      if (!res?.data) {
        setTransactionError(true);
        setTimeout(() => setTransactionError(false), 3000);
        return;
      }

      setTransactionDetails(res?.data);
      setShowTransaction(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLookingUp(false);
    }
  };

  const completeTransaction = async () => {
    if (!transactionDetails?.session_id) return;

    try {
      const res = await CompleteTransaction(transactionDetails?.session_id);

      setConfirmationMessage(res.message);
      setConfirmationType("success");
      openConfirmation();
    } catch (err: any) {
      console.error("Error completing transaction:", err);
      setConfirmationMessage(
        err.response?.data?.message ||
          "Failed to complete transaction. Please try again."
      );
      setConfirmationType("error");
      openConfirmation();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    close();
    form.reset();
    setShowTransaction(false);
    setTransactionDetails(undefined);
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={handleClose}
        size="md"
        title="Verify Transaction"
      >
        {isFetching ? (
          <TransactionDetailsSkeleton />
        ) : (
          <>
            {!showTransaction ? (
              <form onSubmit={form.onSubmit(lookupSessionId)}>
                <Flex direction="column" gap={14} mt={20}>
                  {/* Transaction Not found error*/}
                  {transactionError && (
                    <Flex
                      align="center"
                      justify="center"
                      bg="#FFEBE9"
                      className="rounded-full"
                      p={10}
                    >
                      <Text c="#E15748" fz={13} fw={500}>
                        Transaction Not Found!
                      </Text>
                    </Flex>
                  )}

                  <TextInput
                    placeholder="Enter Session ID"
                    {...form.getInputProps("session_id")}
                  />
                </Flex>

                <Divider color="#111111" my={20} />

                {/* Buttons */}
                <Flex gap="sm">
                  <Button
                    radius="xl"
                    type="submit"
                    className={classes.btnWhite}
                    loading={isLookingUp}
                    disabled={isLookingUp || !form.isValid()}
                    fullWidth
                  >
                    Look up Session ID
                  </Button>
                </Flex>
              </form>
            ) : (
              <>
                <Flex direction="column" mt={20} gap={40}>
                  {/* Alert */}
                  <Flex
                    align="center"
                    justify="center"
                    bg="#E9FFEE"
                    className="rounded-full"
                    p={10}
                  >
                    <Text c="#42AA4E" fz={13} fw={500}>
                      Transaction Found!
                    </Text>
                  </Flex>

                  <Flex align="center" justify="center" gap={10}>
                    <Text fz={24} fw={500} c="#fff">
                      ₦
                      {formatStringAmount(
                        convertToNaira(transactionDetails?.amount || "0.00") ||
                          "0.00"
                      )}
                    </Text>

                    <StatusBadge
                      status={transactionDetails?.status || ""}
                      isTransparent={false}
                      isTransaction
                      useAltColor
                      size="xl"
                      px={10}
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
                          data={transactionDetails?.created_at || ""}
                          formatType="dateTime"
                        />
                      }
                    />
                    <DashedDivider />
                    {/* Sender */}
                    <GridItem
                      label="Sender"
                      value={transactionDetails?.meta?.source_name || "N/A"}
                    />
                    <DashedDivider />
                    {/* Sender Bank */}
                    <GridItem
                      label="Sender bank"
                      value={
                        transactionDetails?.meta?.source_bank_name || "N/A"
                      }
                    />
                    <DashedDivider />
                    {/* Recipient */}
                    <GridItem
                      label="Recipient"
                      value={
                        transactionDetails?.meta?.destination_name || "N/A"
                      }
                    />
                    <DashedDivider />
                    {/* Description */}
                    <GridItem
                      label="Description"
                      value={transactionDetails?.narration || "N/A"}
                    />
                    <DashedDivider />
                    {/* Transaction Type */}
                    <GridItem
                      label="Transaction Type"
                      value={transactionDetails?.category || "N/A"}
                    />
                    <DashedDivider />
                    {/* Reference */}
                    <GridItem
                      label="Reference"
                      value={
                        <Flex gap={4} align="center">
                          <Text className="breakable">
                            {transactionDetails?.internal_reference || "N/A"}
                          </Text>
                          <CopyButton
                            value={
                              transactionDetails?.internal_reference || "N/A"
                            }
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
                                <ActionIcon
                                  variant="transparent"
                                  onClick={copy}
                                >
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

                    {transactionDetails?.third_party_reference && (
                      <>
                        <DashedDivider />
                        {/* Third-party reference */}
                        <GridItem
                          label="Third-party reference"
                          value={
                            <Flex gap={4} align="center">
                              <Text className="breakable">
                                {transactionDetails?.third_party_reference ||
                                  "N/A"}
                              </Text>
                              <CopyButton
                                value={
                                  transactionDetails?.third_party_reference ||
                                  "N/A"
                                }
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
                                    <ActionIcon
                                      variant="transparent"
                                      onClick={copy}
                                    >
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
                      </>
                    )}

                    <DashedDivider />
                    {/* Session ID */}
                    <GridItem
                      label="Session ID"
                      value={transactionDetails?.session_id || "N/A"}
                    />
                  </Flex>
                </Flex>

                <Divider color="#111111" my={30} />

                {/* Buttons */}
                <Flex direction="column" gap={10}>
                  <Button
                    radius="xl"
                    onClick={completeTransaction}
                    className={classes.btnWhite}
                    loading={isProcessing}
                    disabled={isProcessing}
                    fullWidth
                  >
                    Complete Transaction Process
                  </Button>
                  {/* <Button
                  variant="transparent"
                  color="#fff"
                  radius="md"
                  fz={14}
                  style={{ border: "1px solid #363636E5" }}
                  fullWidth
                >
                  RSVP Already Exists!
                </Button> */}
                </Flex>
              </>
            )}
          </>
        )}
      </Drawer>

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

export default VerifyTransactionModal;

const DashedDivider = () => <Divider color="#171717" variant="dashed" />;

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
      <Box
        fz={14}
        c="#fff"
        className="text-right"
        tt={typeof value === "string" ? "capitalize" : "inherit"}
      >
        {value}
      </Box>
    </Flex>
  );
};
