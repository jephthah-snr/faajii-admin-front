"use client";

import {
  FormatDate,
  PpTable,
  StatusBadge,
  PaymentTrackingModal,
} from "@/components";
import { AppLayout } from "@/layout";
import { GetPaymentTrackings } from "@/services/api";
import {
  PaymentTracking,
  SERVICE_ID_LABELS,
} from "@/services/api/payment-tracking/payment-tracking.types";
import {
  buildDefaultFilters,
  formatStringAmount,
  paymentTrackingEmptyState,
  paymentTrackingFilters,
  rowsPerPage,
} from "@/utils";
import { Badge, Box, Flex, Table, Text } from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

const tableHeaders = [
  "Reference",
  "Account",
  "Processor",
  "Service",
  "Expected Amount",
  "Fee",
  "Actual Amount",
  "Status",
  "Date",
];

const PaymentTrackingPage = () => {
  const [activePage, setActivePage] = useState(1);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentTracking | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [filters, setFilters] = useState(
    buildDefaultFilters(paymentTrackingFilters),
  );

  const { data: paymentTrackings, isFetching } = useQuery({
    queryKey: [
      "paymentTrackings",
      activePage,
      rowsPerPage,
      debouncedQuery,
      filters,
    ],
    queryFn: () =>
      GetPaymentTrackings(
        String(activePage),
        String(rowsPerPage),
        debouncedQuery,
        filters.status,
        filters.serviceId,
        filters.startDate,
        filters.endDate,
      ),
  });

  const paymentData = paymentTrackings?.data?.data || [];
  const totalItems = paymentTrackings?.data?.pagination?.total || 0;

  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  const handleOpenModal = (payment: PaymentTracking) => {
    setSelectedPayment(payment);
    open();
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return "N/A";
    return `₦${formatStringAmount(amount / 100)}`;
  };

  const handleDownloadCSV = async () => {
    if (!totalItems) return;
    setIsDownloadingCSV(true);
    try {
      const allData = await GetPaymentTrackings(
        "1",
        String(totalItems),
        debouncedQuery,
        filters.status,
        filters.serviceId,
        filters.startDate,
        filters.endDate,
      );

      const records = allData?.data?.data || [];

      const headers = [
        "Reference",
        "Account Name",
        "Account Number",
        "Bank / Processor",
        "Service",
        "Expected Amount",
        "Fee",
        "Actual Amount",
        "Status",
        "Date",
      ];

      const rows = records.map((data) => {
        const expectedAmount =
          data?.bankName === "PAYSTACK"
            ? data?.metadata?.paystackCharge?.amountToCharge
            : data.expectedAmount;

        const feeAmount =
          data?.bankName === "PAYSTACK"
            ? data?.metadata?.paystackCharge?.chargeAmount
            : data.metadata?.feeAmount;

        const actualAmount =
          data?.bankName === "PAYSTACK"
            ? data?.metadata?.paystackCharge?.originalAmount
            : data.metadata?.originalAmount;

        return [
          data.reference || "N/A",
          data.accountName || "N/A",
          `${data.accountNumber} - ${data.bankName}`,
          data.bankName || "N/A",
          SERVICE_ID_LABELS[data.serviceId || ""] || data.serviceId || "N/A",
          formatStringAmount(expectedAmount),
          formatStringAmount(feeAmount),
          formatStringAmount(actualAmount),
          data.status || "N/A",
          data.created_at || "N/A",
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payment Tracking.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      notifications.show({
        title: "Export failed",
        message: "Could not export CSV. Please try again.",
        color: "red",
      });
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  const rows = paymentData?.map((data) => {
    // Expected amount
    const expectedAmount =
      data?.bankName === "PAYSTACK"
        ? data?.metadata?.paystackCharge?.amountToCharge
        : data.expectedAmount;

    // Fee amount
    const feeAmount =
      data?.bankName === "PAYSTACK"
        ? data?.metadata?.paystackCharge?.chargeAmount
        : data.metadata?.feeAmount;

    // Fee percentage
    const percentageFee =
      data?.bankName === "PAYSTACK"
        ? data?.metadata?.paystackCharge?.percentage
        : data?.metadata?.percentageFee;

    // Actual amount
    const actualAmount =
      data?.bankName === "PAYSTACK"
        ? data?.metadata?.paystackCharge?.originalAmount
        : data.metadata?.originalAmount;
    return (
      <Table.Tr
        key={data.id}
        onClick={() => handleOpenModal(data)}
        className="cursor-pointer"
      >
        <Table.Td>
          <Text fz={14} fw={500}>
            {data.reference || "-"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Box>
            <Text fz={14} fw={500}>
              {data.accountName || "-"}
            </Text>
            <Text fz={12} c="dimmed">
              {data.accountNumber} - {data.bankName}
            </Text>
          </Box>
        </Table.Td>
        <Table.Td>
          <Text fz={14}>{data.bankName}</Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light" size="sm">
            {SERVICE_ID_LABELS[data.serviceId || ""] || data.serviceId || "-"}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text fz={14}>{formatAmount(expectedAmount)}</Text>
        </Table.Td>
        <Table.Td>
          <Flex align="center" gap={2}>
            <Text
              fz={14}
              c={
                data.metadata?.feeAmount ||
                data?.metadata?.paystackCharge?.chargeAmount
                  ? "green"
                  : "dimmed"
              }
            >
              {formatAmount(feeAmount) || "N/A"}
            </Text>
            {(data?.metadata?.percentageFee ||
              data?.metadata?.paystackCharge?.percentage) && (
              <Text fz={14} c="dimmed">
                ({percentageFee}%)
              </Text>
            )}
          </Flex>
        </Table.Td>
        <Table.Td>
          <Text fz={14}>{formatAmount(actualAmount)}</Text>
        </Table.Td>
        <Table.Td>
          <StatusBadge status={data.status} px={0} fullWidth />
        </Table.Td>
        <Table.Td>
          <FormatDate data={data.created_at} formatType="fullDate" />
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppLayout title="Payment Tracking">
      <Box>
        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={activePage}
          setActivePage={setActivePage}
          rowsPerPage={rowsPerPage}
          hasActions
          isLoading={isFetching}
          emptyState={paymentTrackingEmptyState}
          filters={paymentTrackingFilters}
          query={query}
          handleQuery={setQuery}
          onFilterChange={setFilters}
          handleDownloadCSV={handleDownloadCSV}
          isDownloadingCSV={isDownloadingCSV}
          hasDownloadCSVBtn
          searchPlaceholder="Search by sender name, reference, account..."
        />
      </Box>

      <PaymentTrackingModal
        opened={opened}
        close={close}
        payment={selectedPayment}
      />
    </AppLayout>
  );
};

export default PaymentTrackingPage;
