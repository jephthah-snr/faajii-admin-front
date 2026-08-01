"use client";

import {
  ActionIcon,
  Box,
  BoxProps,
  Button,
  Flex,
  Pagination,
  Table,
  TextInput,
  rem,
} from "@mantine/core";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import Image from "next/image";
import {
  IconAdd,
  IconDocumentDownload,
  IconFilter,
  IconSearch,
  IconSort,
} from "@/icons";
import { FilterItem } from "@/utils";
import { useState } from "react";
import {
  FilterButton,
  TableSkeleton,
  VerifyTransactionModal,
} from "@/components";
import EmptyState from "../empty-state";
import { useSticky } from "@/hooks";
import { useDisclosure } from "@mantine/hooks";

interface PpTableProps extends BoxProps {
  headers?: string[];
  rowData?: any[];
  activePage?: number;
  setActivePage?: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage?: number;
  totalItems?: number;
  isLoading?: boolean;
  query?: string;
  handleQuery?: (query: string) => void;
  addItem?: () => void;
  handleDownloadCSV?: () => void;
  isDownloadingCSV?: boolean;
  filters?: FilterItem[];
  onFilterChange?: (filters: any) => void;
  hasActions?: boolean;
  addOnStyle?: string;
  showPagination?: boolean;
  stickyOffset?: number;
  hasVerifyBtn?: boolean;
  hasDownloadCSVBtn?: boolean;
  searchPlaceholder?: string;
  emptyState?: {
    title: string;
    description: string;
  };
}

const PpTable = ({
  headers = [],
  rowData = [],
  activePage,
  setActivePage,
  rowsPerPage = 10,
  totalItems,
  isLoading,
  query,
  handleQuery,
  addItem,
  handleDownloadCSV,
  isDownloadingCSV = false,
  filters = [],
  onFilterChange,
  hasActions = false,
  addOnStyle,
  showPagination = true,
  hasVerifyBtn = false,
  hasDownloadCSVBtn = false,
  stickyOffset = 60,
  searchPlaceholder = "Search",
  emptyState,
  ...props
}: PpTableProps) => {
  const icon = (
    <Image
      src={IconSearch}
      alt="icon"
      style={{ width: rem(16), height: rem(16) }}
    />
  );

  const [opened, { open, close }] = useDisclosure(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { stickyRef, sentinelRef, isStuck } = useSticky(stickyOffset);

  const currentRows = rowData;

  return (
    <Box p={0} {...props}>
      {/* Table description */}
      <div ref={sentinelRef} style={{ height: 1 }}></div>
      {hasActions && (
        <Flex
          ref={stickyRef}
          align={isFilterOpen ? "flex-start" : "center"}
          justify={"space-between"}
          bg={isStuck ? "#0A0A0A" : "#FFFFFF0D"}
          wrap={"wrap"}
          p={8}
          mb={10}
          gap={isFilterOpen ? 10 : 20}
          className={`${
            isStuck ? "rounded-none" : "rounded-lg"
          } sticky z-10 transition-all duration-300 ease-in-out`}
          style={{ top: stickyOffset }}
        >
          {isFilterOpen ? (
            <FilterButton
              data={filters}
              close={() => setIsFilterOpen(false)}
              onFilterChange={onFilterChange!}
            />
          ) : (
            <Flex gap={10} align={"center"}>
              {addItem && (
                <ActionIcon
                  variant="transparent"
                  onClick={() => addItem()}
                  aria-label="Add"
                >
                  <Image
                    src={IconAdd}
                    alt="icon"
                    style={{ width: "70%", height: "70%" }}
                  />
                </ActionIcon>
              )}
              <ActionIcon
                variant="transparent"
                onClick={() => setIsFilterOpen(true)}
                aria-label="Filter"
              >
                <Image
                  src={IconFilter}
                  alt="icon"
                  style={{ width: "70%", height: "70%" }}
                />
              </ActionIcon>
              <ActionIcon variant="transparent" aria-label="Sort">
                <Image
                  src={IconSort}
                  alt="icon"
                  style={{ width: "70%", height: "70%" }}
                />
              </ActionIcon>
            </Flex>
          )}

          <Flex align="center" gap={10} wrap="wrap">
            <TextInput
              placeholder={searchPlaceholder}
              w={{ base: `${hasVerifyBtn ? "100%" : "auto"}`, md: "auto" }}
              variant="default"
              leftSection={icon}
              leftSectionPointerEvents="none"
              classNames={{ input: inputClasses.searchInput }}
              value={query}
              onChange={(e) => handleQuery?.(e.target.value)}
              size="sm"
              radius="md"
            />

            {hasVerifyBtn && (
              <Button
                h={38}
                px={14}
                radius="md"
                className={classes.btnNeutral}
                styles={{ root: { minWidth: 160 } }}
                onClick={open}
              >
                Verify Transaction
              </Button>
            )}

            {hasDownloadCSVBtn && (
              <Button
                color="#5769E9"
                radius={8}
                h={40}
                className="border border-[#3C4CBD]"
                onClick={handleDownloadCSV}
                loading={isDownloadingCSV}
                disabled={isDownloadingCSV}
                styles={{ root: { minWidth: "auto" } }}
                leftSection={
                  !isDownloadingCSV ? (
                    <Image
                      src={IconDocumentDownload}
                      alt="icon"
                      style={{ width: rem(20), height: rem(20) }}
                    />
                  ) : undefined
                }
              >
                {isDownloadingCSV ? "Exporting..." : "Download as CSV"}
              </Button>
            )}
          </Flex>
        </Flex>
      )}

      {isLoading ? (
        <>
          <TableSkeleton />
        </>
      ) : (
        <>
          {/* Table Rows */}
          <>
            {rowData.length < 1 ? (
              <EmptyState
                title={emptyState?.title}
                description={emptyState?.description}
              />
            ) : (
              <>
                {/* Table */}
                <Table.ScrollContainer minWidth={700}>
                  <Table
                    stickyHeader
                    mb={20}
                    classNames={{
                      thead: classes.tableHeader,
                      tr: `${classes.tableRow} ${
                        addOnStyle?.includes("noRowBorder")
                          ? classes.noRowBorder
                          : ""
                      }`,
                      th: `${classes.thItem} ${
                        addOnStyle?.includes("noHeaderBorder")
                          ? classes.noHeaderBorder
                          : addOnStyle?.includes("lightHeaderBorder")
                            ? classes.lightHeaderBorder
                            : ""
                      }`,
                    }}
                  >
                    <Table.Thead>
                      <Table.Tr>
                        {headers?.map((header, index) => (
                          <Table.Th key={index}>{header}</Table.Th>
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{currentRows}</Table.Tbody>
                  </Table>
                </Table.ScrollContainer>

                {/* Pagination */}
                {showPagination &&
                  rowData &&
                  totalItems &&
                  totalItems > rowsPerPage && (
                    <Box
                      className="fixed bottom-0 left-0 w-full flex flex-col md:flex-row md:items-center justify-between gap-5"
                      bg="#0A0A0A"
                      py={10}
                    >
                      <Pagination
                        size={"md"}
                        w={"100%"}
                        className="flex justify-end"
                        classNames={{
                          control: classes.paginationControl,
                          dots: classes.paginationDots,
                        }}
                        total={Math.ceil(totalItems / rowsPerPage)}
                        siblings={1}
                        value={activePage}
                        onChange={setActivePage}
                      />
                    </Box>
                  )}
              </>
            )}
          </>
        </>
      )}

      <VerifyTransactionModal opened={opened} close={close} />
    </Box>
  );
};

export default PpTable;
