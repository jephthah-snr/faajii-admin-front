"use client";

import { FormatDate, PpTable, TransactionModal } from "@/components";
import { IconCredit, IconDebit } from "@/icons";
import { AppLayout } from "@/layout";
import { GetTransactions } from "@/services/api";
import {
  buildDefaultFilters,
  formatStringAmount,
  initialsColors,
  rowsPerPage,
  transactionEmptyState,
  transactionFilters,
} from "@/utils";
import { Avatar, Box, Flex, Table, Text } from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

const tableHeaders = [
  "Transaction ID",
  "Transaction",
  "User",
  "Amount",
  "Date",
  "Time",
  //"Status",
];

const Transactions = () => {
  const [activePage, setActivePage] = useState(1);
  const [selectedTransactionRef, setSelectedTransactionRef] =
    useState<string>("");
  const [opened, { open, close }] = useDisclosure(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [filters, setFilters] = useState(
    buildDefaultFilters(transactionFilters)
  );

  //Fetching transactions data
  const { data: transactions, isFetching: isFetchingTransactions } = useQuery({
    queryKey: [
      "transactions",
      activePage,
      rowsPerPage,
      debouncedQuery,
      filters,
    ],
    queryFn: () =>
      GetTransactions(
        String(activePage),
        String(rowsPerPage),
        debouncedQuery,
        filters.status,
        filters.type,
        filters.range,
        filters.startDate,
        filters.endDate
      ),
  });
  const transactionsData = transactions?.data?.data || [];
  const totalItems = transactions?.data?.pagination?.total || 0;

  const handleOpenModal = (ref: string) => {
    setSelectedTransactionRef(ref);
    open();
  };

  const rows = transactionsData?.map((data) => {
    const isCompleted = data?.transactionStatus === "completed";
    const isDebit = data?.direction === "DEBIT";

    return (
      <Table.Tr
        key={data?.transactionId}
        onClick={() => handleOpenModal(String(data?.transactionId))}
        className={`cursor-pointer`}
      >
        <Table.Td>#{data?.transactionRef || "-"}</Table.Td>
        <Table.Td>
          <Flex gap={8}>
            <Box
              style={{
                filter:
                  isDebit && isCompleted
                    ? "hue-rotate(75deg) saturate(1.5) brightness(1.2)"
                    : "none",
              }}
            >
              <Image
                src={data?.direction === "CREDIT" ? IconCredit : IconDebit}
                alt="icon"
              />
            </Box>
            <Box w={300} pr={10}>
              <Text truncate="end" fz={14}>
                {data?.narration || "N/A"}
              </Text>
            </Box>
          </Flex>
        </Table.Td>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              size="sm"
              name={data?.user?.name || "-"}
              color="initials"
              allowedInitialsColors={initialsColors}
              src={data?.user?.avatar}
              alt="avatar"
            />
            <Text fz={14} tt="capitalize">
              {data?.user?.name || "-"}
            </Text>
          </Flex>
        </Table.Td>
        <Table.Td>₦{formatStringAmount(data?.transactionAmount || "0.00")}</Table.Td>
        <Table.Td>
          <FormatDate data={data?.created_at} formatType="fullDate" />
        </Table.Td>
        <Table.Td>
          <FormatDate data={data?.created_at} formatType="time" />
        </Table.Td>
        {/* <Table.Td miw={120} px={0}>
          <StatusBadge status={data?.transactionStatus} />
        </Table.Td> */}
      </Table.Tr>
    );
  });

  return (
    <AppLayout title="Wallet Transactions">
      <Box>
        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={activePage}
          setActivePage={setActivePage}
          rowsPerPage={rowsPerPage}
          hasActions
          isLoading={isFetchingTransactions}
          emptyState={transactionEmptyState}
          filters={transactionFilters}
          query={query}
          handleQuery={setQuery}
          onFilterChange={setFilters}
          hasVerifyBtn
        />
      </Box>

      <TransactionModal
        opened={opened}
        close={close}
        transactionRef={selectedTransactionRef}
      />
    </AppLayout>
  );
};

export default Transactions;
