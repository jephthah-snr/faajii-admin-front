"use client";

import { GetEventTransactions } from "@/services/api";
import {
  convertToNaira,
  formatStringAmount,
  initialsColors,
  rowsPerPage,
} from "@/utils";
import { useQuery } from "@tanstack/react-query";
import PpTable from "../table";
import { Avatar, Box, Flex, Table, Text } from "@mantine/core";
import { EventTransactionModal, FormatDate } from "@/components/elements";
import { IconCredit, IconDebit } from "@/config/icons";
import { Edges } from "@/services/api/event/event.types";
import { useEffect, useMemo, useState } from "react";
import { useCursorPagination } from "@/hooks";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";

const tableHeaders = [
  "Transaction ID",
  "Transaction",
  "User",
  "Amount",
  "Date",
  "Time",
];

interface EventTransactionsProps {
  id: string;
}

const EventTransactions = ({ id }: EventTransactionsProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [selectedTransaction, setSelectedTransaction] = useState<Edges | null>(
    null
  );
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const { activePage, setActivePage, cursor, updatePagination, totalItems } =
    useCursorPagination<Edges>({
      rowsPerPage,
      extractCursor: (trx) => trx.created_at,
    });

  const { data: transactions, isFetching } = useQuery({
    queryKey: ["event-transactions", id, cursor, debouncedQuery],
    queryFn: () =>
      GetEventTransactions(id, String(rowsPerPage), cursor, debouncedQuery),
  });

  const eventTransactions = useMemo(() => {
    return transactions?.data?.edges || [];
  }, [transactions]);

  const pageInfo = transactions?.data?.pageInfo;

  useEffect(() => {
    updatePagination(eventTransactions, pageInfo);
  }, [eventTransactions, pageInfo, updatePagination]);

  const handleOpenModal = (data: Edges) => {
    setSelectedTransaction(data);
    open();
  };

  const rows = eventTransactions.map((data) => {
    const nairaAmount = convertToNaira(data?.amount);

    return (
      <Table.Tr
        key={data.id}
        className="cursor-pointer"
        onClick={() => handleOpenModal(data)}
      >
        <Table.Td>#{data.id}</Table.Td>

        <Table.Td>
          <Flex gap={8}>
            {data.type === "credit" ? (
              <IconCredit size={18} color="var(--fj-success)" variant="Bulk" />
            ) : (
              <IconDebit size={18} color="var(--fj-danger)" variant="Bulk" />
            )}
            <Box w={300} pr={10}>
              <Text truncate="end" fz={14}>
                {data.description || "N/A"}
              </Text>
            </Box>
          </Flex>
        </Table.Td>

        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              size="sm"
              name={data.user?.name || "U"}
              color="initials"
              allowedInitialsColors={initialsColors}
              src={data.user?.avatar}
            />
            <Text fz={14} tt="capitalize">
              {data.user?.name || "--"}
            </Text>
          </Flex>
        </Table.Td>

        <Table.Td>₦{formatStringAmount(nairaAmount || "0.00")}</Table.Td>

        <Table.Td>
          <FormatDate data={data.created_at} formatType="fullDate" />
        </Table.Td>

        <Table.Td>
          <FormatDate data={data.created_at} formatType="time" />
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <PpTable
        headers={tableHeaders}
        rowData={rows}
        totalItems={totalItems}
        activePage={activePage}
        setActivePage={setActivePage}
        rowsPerPage={rowsPerPage}
        isLoading={isFetching}
        query={query}
        handleQuery={setQuery}
        hasActions
      />

      <EventTransactionModal
        opened={opened}
        close={close}
        transactionData={selectedTransaction!}
      />
    </>
  );
};

export default EventTransactions;
