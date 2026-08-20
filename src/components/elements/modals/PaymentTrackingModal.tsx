"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  CopyButton,
  Divider,
  Drawer,
  Flex,
  ScrollArea,
  Table,
  Text,
  Tooltip,
  Modal,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import StatusBadge from "../status-badge";
import FormatDate from "../format-date";
import { IconCopy } from "@/config/icons";
import { formatStringAmount } from "@/utils";
import {
  PaymentTracking,
  SERVICE_ID_LABELS,
} from "@/services/api/payment-tracking/payment-tracking.types";
import {
  ConfirmPaymentTracking,
  ResendPaymentTrackingRsvp,
  AssignDuplicateTicket,
  EscalateToFinance,
  ResendPaymentTrackingWebhook,
} from "@/services/api/payment-tracking";
import { EventDetails } from "@/services/api/event/event.types";
import { GetEventDetails } from "@/services/api";

interface PaymentTrackingModalProps {
  opened: boolean;
  close: () => void;
  payment: PaymentTracking | null;
  onPaymentConfirmed?: () => void;
}

const PaymentTrackingModal = ({
  opened,
  close,
  payment,
  onPaymentConfirmed,
}: PaymentTrackingModalProps) => {
  const [
    confirmModalOpened,
    { open: openConfirmModal, close: closeConfirmModal },
  ] = useDisclosure(false);
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!payment) return;
      return ConfirmPaymentTracking(payment.reference);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Payment confirmed successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["paymentTrackings"] });
      closeConfirmModal();
      onPaymentConfirmed?.();
      close();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to confirm payment",
        color: "red",
      });
    },
  });

  const resendRsvpMutation = useMutation({
    mutationFn: async () => {
      if (!payment) return;
      return ResendPaymentTrackingRsvp(payment.id);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "RSVP resent successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["paymentTrackings"] });
      onPaymentConfirmed?.();
      close();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to resend RSVP",
        color: "red",
      });
    },
  });

  const assignTicketMutation = useMutation({
    mutationFn: async () => {
      if (!payment) return;
      return AssignDuplicateTicket(payment.reference);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Ticket assigned successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["paymentTrackings"] });
      onPaymentConfirmed?.();
      close();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to assign ticket",
        color: "red",
      });
    },
  });

  const escalateMutation = useMutation({
    mutationFn: async () => {
      if (!payment) return;
      return EscalateToFinance(payment.reference);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Payment escalated to finance team",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["paymentTrackings"] });
      onPaymentConfirmed?.();
      close();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to escalate payment",
        color: "red",
      });
    },
  });

  const resendWebhookMutation = useMutation({
    mutationFn: async () => {
      if (!payment) return;
      return ResendPaymentTrackingWebhook(payment.id);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Webhook resend request submitted successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["paymentTrackings"] });
      onPaymentConfirmed?.();
      close();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to resend webhook",
        color: "red",
      });
    },
  });

  const { data } = useQuery({
    queryKey: ["tracking-event-details", payment?.metadata?.eventId],
    queryFn: () => GetEventDetails(String(payment?.metadata?.eventId), "event"),
    enabled: opened,
  });
  const eventData = data?.data as EventDetails;

  if (!payment) return null;

  const formatAmount = (amount?: number) => {
    if (!amount && amount !== 0) return "N/A";
    return `₦${formatStringAmount(amount / 100)}`;
  };

  const metadata = payment.metadata;
  const processingResult = payment.processingResult;

  // Duplicate payment detection
  const isDuplicate = metadata?.isDuplicate === true;
  const hasMatchedTicket = !!metadata?.matchedTicketId;
  const isPending = payment.status === "pending";
  const isEscalated = payment.status === "escalated";

  // Check if actualAmount is N/A (webhook never received)
  const hasNoActualAmount =
    payment.actualAmount === undefined || payment.actualAmount === null;

  // Check if there's a mismatch between expected and actual amount (less or more)
  const hasAmountMismatch =
    payment.actualAmount !== undefined &&
    payment.actualAmount !== null &&
    payment.expectedAmount !== undefined &&
    payment.actualAmount !== payment.expectedAmount &&
    payment.status !== "confirmed" &&
    payment.status !== "escalated";

  // Check if amounts match
  const amountsMatch =
    payment.actualAmount !== undefined &&
    payment.actualAmount !== null &&
    payment.expectedAmount !== undefined &&
    payment.actualAmount === payment.expectedAmount;

  // Check if processingResult is null or empty
  const hasNoProcessingResult =
    !processingResult ||
    (typeof processingResult === "object" &&
      Object.keys(processingResult).length === 0);

  // Check if not processed
  const isNotProcessed = !payment.isProcessed;

  // Button visibility conditions
  // Show confirm if: amounts match AND (no processing result OR not processed)
  const canConfirm =
    amountsMatch &&
    (hasNoProcessingResult || isNotProcessed) &&
    payment.status !== "confirmed" &&
    payment.status !== "expired" &&
    payment.status !== "escalated";
  const canResendRsvp = payment.status === "confirmed" && !payment.isProcessed;
  const canAssignTicket = isDuplicate && isPending && hasMatchedTicket;
  // Show resend webhook button if actualAmount is N/A (webhook never received) and payment is pending
  const canResendWebhook = hasNoActualAmount && isPending && !isEscalated;
  // Show escalate to finance button if duplicate without matched ticket OR any amount mismatch (but only when actualAmount exists)
  const canEscalate =
    !hasNoActualAmount &&
    ((isDuplicate && isPending && !hasMatchedTicket) || hasAmountMismatch);

  const handleConfirm = () => {
    confirmMutation.mutate();
  };

  /* ======================= NORMALIZE AMOUNTS ======================== */

  // Expected amount
  const expectedAmount =
    payment?.bankName === "PAYSTACK"
      ? metadata?.paystackCharge?.amountToCharge
      : payment.expectedAmount;

  // Actual amount
  const actualAmount =
    payment?.bankName === "PAYSTACK"
      ? metadata?.paystackCharge?.originalAmount
      : metadata?.originalAmount;

  const processingMessage =
    processingResult?.message ?? processingResult?.permanentFailReason;

  return (
    <Drawer
      opened={opened}
      onClose={close}
      size="lg"
      title="Payment Tracking Details"
      position="right"
    >
      <ScrollArea h="calc(100vh - 80px)" offsetScrollbars>
        {/* Main Info Section */}
        <Flex
          direction="column"
          bg="var(--fj-surface-elevated)"
          className="rounded-xl"
          p={20}
          gap={20}
        >
          <Flex direction="column" align="center" justify="center" gap={10}>
            <Text fz={24} fw={500} c="#fff">
              {formatAmount(payment.expectedAmount)}
            </Text>
            <StatusBadge
              status={payment.status}
              isTransparent={false}
              useAltColor
              size="xl"
              px={20}
              fz={13}
            />
            {payment.serviceId && (
              <Badge variant="light" mt={4}>
                {SERVICE_ID_LABELS[payment.serviceId] || payment.serviceId}
              </Badge>
            )}
            {canConfirm && (
              <Button
                mt={16}
                color="green"
                size="md"
                fullWidth
                onClick={openConfirmModal}
              >
                Confirm Payment
              </Button>
            )}
            {canResendRsvp && (
              <Button
                mt={16}
                color="blue"
                size="md"
                fullWidth
                loading={resendRsvpMutation.isPending}
                onClick={() => resendRsvpMutation.mutate()}
              >
                Resend RSVP
              </Button>
            )}
            {canAssignTicket && (
              <Button
                mt={16}
                color="green"
                size="md"
                fullWidth
                loading={assignTicketMutation.isPending}
                onClick={() => assignTicketMutation.mutate()}
              >
                Assign Ticket ({metadata?.matchedTicketName})
              </Button>
            )}
            {canResendWebhook && (
              <Button
                mt={16}
                color="blue"
                size="md"
                fullWidth
                loading={resendWebhookMutation.isPending}
                onClick={() => resendWebhookMutation.mutate()}
              >
                Re-send Webhook
              </Button>
            )}
            {canEscalate && (
              <Button
                mt={16}
                color="pink"
                size="md"
                fullWidth
                loading={escalateMutation.isPending}
                onClick={() => escalateMutation.mutate()}
              >
                Escalate to Finance
              </Button>
            )}
            {isEscalated && (
              <Badge color="pink" size="lg" mt={16}>
                Escalated to Finance
              </Badge>
            )}
          </Flex>

          <Divider color="#333" />

          {/* Payment Details */}
          <Box>
            <Text fw={600} c="#fff" mb={12}>
              Payment Information
            </Text>
            <Flex direction="column" gap={10}>
              <GridItem
                label="Reference"
                value={<CopyableValue value={payment.reference} />}
              />
              <GridItem
                label="Expected Amount"
                value={formatAmount(expectedAmount)}
              />
              <GridItem
                label="Actual Amount"
                value={formatAmount(actualAmount)}
              />
              <GridItem
                label="Payment Type"
                value={payment.paymentType || "N/A"}
              />
              <GridItem
                label="Is Processed"
                value={payment.isProcessed ? "Yes" : "No"}
              />
              {payment.paidAt && (
                <GridItem
                  label="Paid At"
                  value={
                    <FormatDate data={payment.paidAt} formatType="dateTime" />
                  }
                />
              )}
              {payment.expiresAt && (
                <GridItem
                  label="Expires At"
                  value={
                    <FormatDate
                      data={payment.expiresAt}
                      formatType="dateTime"
                    />
                  }
                />
              )}
              <GridItem
                label="Created"
                value={
                  <FormatDate data={payment.created_at} formatType="dateTime" />
                }
              />
            </Flex>
          </Box>

          <Divider color="#333" />

          {/* Account Details */}
          <Box>
            <Text fw={600} c="#fff" mb={12}>
              Account Details
            </Text>
            <Flex direction="column" gap={10}>
              <GridItem
                label="Account Name"
                value={payment.accountName || "N/A"}
              />
              <GridItem
                label="Account Number"
                value={<CopyableValue value={payment.accountNumber} />}
              />
              <GridItem label="Bank Name" value={payment.bankName || "N/A"} />
            </Flex>
          </Box>

          {/* Sender Information */}
          {(payment.senderName || payment.senderAccountNumber) && (
            <>
              <Divider color="#333" />
              <Box>
                <Text fw={600} c="#fff" mb={12}>
                  Sender Information
                </Text>
                <Flex direction="column" gap={10}>
                  <GridItem
                    label="Sender Name"
                    value={payment.senderName || "N/A"}
                  />
                  <GridItem
                    label="Sender Account"
                    value={payment.senderAccountNumber || "N/A"}
                  />
                  <GridItem
                    label="Sender Bank"
                    value={payment.senderBankName || "N/A"}
                  />
                  {payment.transactionReference && (
                    <GridItem
                      label="Transaction Ref"
                      value={
                        <CopyableValue value={payment.transactionReference} />
                      }
                    />
                  )}
                </Flex>
              </Box>
            </>
          )}

          {payment.description && (
            <>
              <Divider color="#333" />
              <Box>
                <Text fw={600} c="#fff" mb={8}>
                  Description
                </Text>
                <Text fz={14} c="#ccc">
                  {payment.description}
                </Text>
              </Box>
            </>
          )}
        </Flex>

        {/* Metadata Section */}
        {metadata && (
          <Box mt={20}>
            <Text fw={600} fz={16} mb={12}>
              Metadata
            </Text>
            <Flex
              direction="column"
              bg="var(--fj-surface)"
              className="rounded-xl"
              p={16}
              gap={16}
            >
              {metadata.eventId && (
                <>
                  <GridItem
                    label="Event ID"
                    value={String(metadata.eventId)}
                    dark
                  />
                  <GridItem
                    label="Event Name"
                    value={eventData?.name || "N/A"}
                    dark
                  />
                </>
              )}
              {metadata.totalReceived !== undefined && (
                <GridItem
                  label="Total Received"
                  value={formatAmount(metadata.totalReceived)}
                  dark
                />
              )}

              {/* Submitter Info */}
              {metadata.submitter && (
                <Box>
                  <Text fw={500} c="#999" fz={13} mb={8}>
                    Submitter
                  </Text>
                  <Box bg="var(--fj-surface)" p={12} className="rounded-lg">
                    <GridItem
                      label="Name"
                      value={metadata.submitter.name}
                      dark
                    />
                    <GridItem
                      label="Email"
                      value={metadata.submitter.email}
                      dark
                    />
                    <GridItem
                      label="Phone"
                      value={metadata.submitter.phone}
                      dark
                    />
                  </Box>
                </Box>
              )}

              {/* Items */}
              {metadata.items && metadata.items.length > 0 && (
                <Box>
                  <Text fw={500} c="#999" fz={13} mb={8}>
                    Items ({metadata.items.length})
                  </Text>
                  <Table
                    striped
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                    bg="var(--fj-surface)"
                    className="rounded-lg overflow-hidden"
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th c="#999">Name</Table.Th>
                        <Table.Th c="#999">Quantity</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {metadata.items.map((item, idx) => (
                        <Table.Tr key={idx}>
                          <Table.Td c="#fff">{item.name}</Table.Td>
                          <Table.Td c="#fff">{item.quantity}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
              )}

              {/* Guests */}
              {metadata.guests && metadata.guests.length > 0 && (
                <Box>
                  <Text fw={500} c="#999" fz={13} mb={8}>
                    Guests ({metadata.guests.length})
                  </Text>
                  <Flex direction="column" gap={8}>
                    {metadata.guests.map((guest, idx) => (
                      <Box key={idx} bg="var(--fj-surface)" p={12} className="rounded-lg">
                        <GridItem label="Name" value={guest.name} dark />
                        <GridItem label="Email" value={guest.email} dark />
                        <GridItem label="Phone" value={guest.phone} dark />
                        {guest.selectedTickets &&
                          guest.selectedTickets.length > 0 && (
                            <Flex gap={4} mt={4}>
                              <Text fz={12} c="#666">
                                Tickets:
                              </Text>
                              {guest.selectedTickets.map((t, i) => (
                                <Badge key={i} size="xs" variant="outline">
                                  {t}
                                </Badge>
                              ))}
                            </Flex>
                          )}
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}

              {/* Payment Attempts */}
              {metadata.paymentAttempts &&
                metadata.paymentAttempts.length > 0 && (
                  <Box>
                    <Text fw={500} c="#999" fz={13} mb={8}>
                      Payment Attempts ({metadata.paymentAttempts.length})
                    </Text>
                    <Flex direction="column" gap={8}>
                      {metadata.paymentAttempts.map((attempt, idx) => (
                        <Box key={idx} bg="var(--fj-surface)" p={12} className="rounded-lg">
                          <Flex justify="space-between" mb={8}>
                            <Badge size="sm">
                              Attempt #{attempt.attemptNumber}
                            </Badge>
                            <Text fz={12} c="#666">
                              {attempt.timestamp}
                            </Text>
                          </Flex>
                          <GridItem
                            label="Amount"
                            value={formatAmount(attempt.amount)}
                            dark
                          />
                          <GridItem
                            label="Sender"
                            value={attempt.senderName}
                            dark
                          />
                          <GridItem
                            label="Bank"
                            value={attempt.senderBankName}
                            dark
                          />
                          <GridItem
                            label="Account"
                            value={attempt.senderAccountNumber}
                            dark
                          />
                          <GridItem
                            label="Narration"
                            value={attempt.narration}
                            dark
                          />
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                )}
            </Flex>
          </Box>
        )}

        {/* Processing Result Section */}
        {processingResult && (
          <Box mt={20}>
            <Text fw={600} fz={16} mb={12}>
              Processing Result
            </Text>
            <Flex
              direction="column"
              bg={processingResult.processed ? "#0a2a1a" : "#2a1a1a"}
              className="rounded-xl"
              p={16}
              gap={16}
            >
              <Flex justify="space-between" align="center">
                <Text
                  c={processingResult.processed ? "#4CAF50" : "#F44336"}
                  fw={500}
                >
                  {processingResult.processed ? "Processed" : "Not Processed"}
                </Text>
                {processingResult.reference && (
                  <CopyableValue value={processingResult.reference} />
                )}
              </Flex>

              {processingMessage && (
                <Text fz={14} c="#ccc">
                  {processingMessage}
                </Text>
              )}

              {/* Summary */}
              {processingResult.processedData?.summary && (
                <Box>
                  <Text fw={500} c="#999" fz={13} mb={8}>
                    Summary
                  </Text>
                  <Box bg="var(--fj-surface)" p={12} className="rounded-lg">
                    <GridItem
                      label="Total Amount"
                      value={formatAmount(
                        processingResult.processedData.summary.totalAmount,
                      )}
                      dark
                    />
                    <GridItem
                      label="Total Items"
                      value={String(
                        processingResult.processedData.summary.totalItems,
                      )}
                      dark
                    />
                    <GridItem
                      label="Total Quantity"
                      value={String(
                        processingResult.processedData.summary.totalQuantity,
                      )}
                      dark
                    />
                    <GridItem
                      label="Total Guests"
                      value={String(
                        processingResult.processedData.summary.totalGuests,
                      )}
                      dark
                    />
                    <GridItem
                      label="Payment Status"
                      value={
                        processingResult.processedData.summary.paymentStatus
                      }
                      dark
                    />
                    {processingResult.processedData.summary.orderReferences
                      .length > 0 && (
                      <Box mt={8}>
                        <Text fz={12} c="#666" mb={4}>
                          Order References:
                        </Text>
                        <Flex gap={4} wrap="wrap">
                          {processingResult.processedData.summary.orderReferences.map(
                            (ref, i) => (
                              <Badge key={i} size="xs" variant="light">
                                {ref}
                              </Badge>
                            ),
                          )}
                        </Flex>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Processed Guests */}
              {processingResult.processedData?.guests &&
                processingResult.processedData.guests.length > 0 && (
                  <Box>
                    <Text fw={500} c="#999" fz={13} mb={8}>
                      Processed Guests (
                      {processingResult.processedData.guests.length})
                    </Text>
                    <Flex direction="column" gap={8}>
                      {processingResult.processedData.guests.map(
                        (guest, idx) => (
                          <Box
                            key={idx}
                            bg="var(--fj-surface)"
                            p={12}
                            className="rounded-lg"
                          >
                            <Flex justify="space-between" align="center" mb={8}>
                              <Text c="#fff" fw={500}>
                                {guest.name}
                              </Text>
                              <Badge
                                size="sm"
                                color={
                                  guest.status === "confirmed"
                                    ? "green"
                                    : "yellow"
                                }
                              >
                                {guest.status}
                              </Badge>
                            </Flex>
                            <GridItem label="Email" value={guest.email} dark />
                            <GridItem label="Phone" value={guest.phone} dark />
                            <GridItem label="Ref" value={guest.ref} dark />
                          </Box>
                        ),
                      )}
                    </Flex>
                  </Box>
                )}

              {/* Guest Assignments */}
              {processingResult.processedData?.guestAssignments &&
                processingResult.processedData.guestAssignments.length > 0 && (
                  <Box>
                    <Text fw={500} c="#999" fz={13} mb={8}>
                      Guest Assignments
                    </Text>
                    <Flex direction="column" gap={8}>
                      {processingResult.processedData.guestAssignments.map(
                        (assignment, idx) => (
                          <Box
                            key={idx}
                            bg="var(--fj-surface)"
                            p={12}
                            className="rounded-lg"
                          >
                            <Text c="#fff" fw={500} mb={8}>
                              {assignment.guestName}
                            </Text>
                            {assignment.assignedTickets.length > 0 && (
                              <Box mb={4}>
                                <Text fz={12} c="#666">
                                  Tickets:
                                </Text>
                                <Flex gap={4} wrap="wrap" mt={4}>
                                  {assignment.assignedTickets.map((t, i) => (
                                    <Badge key={i} size="xs" color="blue">
                                      {t}
                                    </Badge>
                                  ))}
                                </Flex>
                              </Box>
                            )}
                            {assignment.assignedItems.length > 0 && (
                              <Box>
                                <Text fz={12} c="#666">
                                  Items:
                                </Text>
                                <Flex gap={4} wrap="wrap" mt={4}>
                                  {assignment.assignedItems.map((item, i) => (
                                    <Badge key={i} size="xs" color="grape">
                                      {item}
                                    </Badge>
                                  ))}
                                </Flex>
                              </Box>
                            )}
                          </Box>
                        ),
                      )}
                    </Flex>
                  </Box>
                )}

              {/* Orders */}
              {processingResult.processedData?.orders &&
                processingResult.processedData.orders.length > 0 && (
                  <Box>
                    <Text fw={500} c="#999" fz={13} mb={8}>
                      Orders ({processingResult.processedData.orders.length})
                    </Text>
                    <Flex direction="column" gap={8}>
                      {processingResult.processedData.orders.map(
                        (orderGroup, idx) => (
                          <Box
                            key={idx}
                            bg="var(--fj-surface)"
                            p={12}
                            className="rounded-lg"
                          >
                            <Flex justify="space-between" align="center" mb={8}>
                              <Text c="#fff" fw={500}>
                                {orderGroup.orderReference.reference}
                              </Text>
                              <Badge
                                size="sm"
                                color={
                                  orderGroup.orderReference.paymentStatus ===
                                  "paid"
                                    ? "green"
                                    : "yellow"
                                }
                              >
                                {orderGroup.orderReference.paymentStatus}
                              </Badge>
                            </Flex>
                            <GridItem
                              label="Total"
                              value={formatAmount(
                                orderGroup.orderReference.totalAmount,
                              )}
                              dark
                            />
                            <GridItem
                              label="Payment Method"
                              value={orderGroup.orderReference.paymentMethod}
                              dark
                            />
                            <Text fz={12} c="#666" mt={8} mb={4}>
                              Order Items ({orderGroup.orders.length}):
                            </Text>
                            <Table
                              striped
                              withTableBorder
                              withColumnBorders
                              bg="var(--fj-surface)"
                              className="rounded-lg overflow-hidden"
                            >
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th c="#999" fz={11}>
                                    Qty
                                  </Table.Th>
                                  <Table.Th c="#999" fz={11}>
                                    Price
                                  </Table.Th>
                                  <Table.Th c="#999" fz={11}>
                                    Status
                                  </Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {orderGroup.orders.map((order, oidx) => (
                                  <Table.Tr key={oidx}>
                                    <Table.Td c="#fff" fz={12}>
                                      {order.quantity}
                                    </Table.Td>
                                    <Table.Td c="#fff" fz={12}>
                                      {formatAmount(order.totalPrice)}
                                    </Table.Td>
                                    <Table.Td>
                                      <Badge size="xs">
                                        {order.deliveryStatus}
                                      </Badge>
                                    </Table.Td>
                                  </Table.Tr>
                                ))}
                              </Table.Tbody>
                            </Table>
                          </Box>
                        ),
                      )}
                    </Flex>
                  </Box>
                )}

              {/* RSVP Codes */}
              {processingResult.processedData?.guestRsvpCodes &&
                Object.keys(processingResult.processedData.guestRsvpCodes)
                  .length > 0 && (
                  <Box>
                    <Text fw={500} c="#999" fz={13} mb={8}>
                      RSVP Codes
                    </Text>
                    <Box bg="var(--fj-surface)" p={12} className="rounded-lg">
                      {Object.entries(
                        processingResult.processedData.guestRsvpCodes,
                      ).map(([guestId, code]) => (
                        <GridItem
                          key={guestId}
                          label={`Guest ${guestId}`}
                          value={<CopyableValue value={code} />}
                          dark
                        />
                      ))}
                    </Box>
                  </Box>
                )}
            </Flex>
          </Box>
        )}

        {/* Webhook Payload (collapsible or truncated) */}
        {payment.webhookPayload && (
          <Box mt={20}>
            <Text fw={600} fz={16} mb={12}>
              Webhook Payload
            </Text>
            <Box
              bg="var(--fj-surface)"
              p={12}
              className="rounded-lg"
              style={{ maxHeight: 200, overflow: "auto" }}
            >
              <pre
                style={{
                  color: "#ccc",
                  fontSize: 11,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {typeof payment.webhookPayload === "string"
                  ? payment.webhookPayload
                  : JSON.stringify(payment.webhookPayload, null, 2)}
              </pre>
            </Box>
          </Box>
        )}

        <Box h={40} />
      </ScrollArea>

      {/* Confirm Payment Modal */}
      <Modal
        opened={confirmModalOpened}
        onClose={closeConfirmModal}
        title="Confirm Payment"
        centered
        size="md"
      >
        <Stack gap={20}>
          {/* Payment Summary */}
          <Box bg="#f8f9fa" p={16} className="rounded-lg">
            <Flex direction="column" gap={8}>
              <Flex justify="space-between" align="center">
                <Text size="sm" c="var(--fj-text-muted)">
                  Amount
                </Text>
                <Text fw={600} size="lg">
                  {formatAmount(payment.expectedAmount)}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text size="sm" c="var(--fj-text-muted)">
                  Reference
                </Text>
                <Text fw={500} size="sm">
                  {payment.reference}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text size="sm" c="var(--fj-text-muted)">
                  Account
                </Text>
                <Text size="sm">
                  {payment.accountNumber} - {payment.bankName}
                </Text>
              </Flex>
            </Flex>
          </Box>

          <Text size="sm" c="var(--fj-text-muted)">
            This action will mark the payment as confirmed and process any
            pending actions (e.g., RSVP, tickets, orders).
          </Text>

          <Flex gap={12}>
            <Button variant="outline" flex={1} onClick={closeConfirmModal}>
              Cancel
            </Button>
            <Button
              color="green"
              flex={1}
              onClick={handleConfirm}
              loading={confirmMutation.isPending}
            >
              Confirm Payment
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </Drawer>
  );
};

export default PaymentTrackingModal;

interface GridItemProps {
  label: string;
  value: string | React.ReactNode;
  dark?: boolean;
}

const GridItem = ({ label, value, dark }: GridItemProps) => {
  return (
    <Flex justify="space-between" gap={14} py={2}>
      <Text fz={13} c={dark ? "#888" : "#969696"}>
        {label}
      </Text>
      <Flex
        fz={14}
        c={dark ? "#fff" : "#fff"}
        className="text-right breakable"
        wrap="wrap"
      >
        {value}
      </Flex>
    </Flex>
  );
};

interface CopyableValueProps {
  value: string;
}

const CopyableValue = ({ value }: CopyableValueProps) => {
  return (
    <Flex gap={4} align="center">
      <Text className="breakable" fz={14}>
        {value || "N/A"}
      </Text>
      {value && (
        <CopyButton value={value} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? "Copied" : "Copy"}
              opened={copied ? true : undefined}
              color="#24A181"
              withArrow
              position="top"
            >
              <ActionIcon variant="transparent" onClick={copy} size="sm">
                <IconCopy size={16} color="currentColor" variant="Linear" />
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      )}
    </Flex>
  );
};
