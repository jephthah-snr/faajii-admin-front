"use client";

import { Box, BoxProps, Flex, Pagination, Table } from "@mantine/core";
import classes from "@/styles/General.module.css";
import EmptyState from "../../blocks/empty-state";
import VerifyTransactionModal from "../../elements/modals/VerifyTransactionModal";
import { TableSkeleton } from "../../elements/skeletons";
import { FilterItem } from "@/utils";
import { useDisclosure } from "@mantine/hooks";
import TableToolbar from "../table-toolbar";
import type { EmptyStateProps } from "../empty-state";

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
  filters?: FilterItem[];
  onFilterChange?: (filters: any) => void;
  /** Renders the sticky search + filter bar. */
  hasActions?: boolean;
  /** Right-hand slot in the toolbar. */
  toolbarAction?: React.ReactNode;
  addOnStyle?: string;
  showPagination?: boolean;
  stickyOffset?: number;
  hasVerifyBtn?: boolean;
  searchPlaceholder?: string;
  emptyState?: Pick<EmptyStateProps, "title" | "description" | "icon">;
  /** Number of skeleton rows while loading. */
  skeletonRows?: number;
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
  filters = [],
  onFilterChange,
  hasActions = false,
  toolbarAction,
  addOnStyle,
  showPagination = true,
  hasVerifyBtn = false,
  stickyOffset = 72,
  searchPlaceholder = "Search",
  emptyState,
  skeletonRows = 8,
  ...props
}: PpTableProps) => {
  const [opened, { close }] = useDisclosure(false);

  return (
    <Box p={0} {...props}>
      {hasActions && (
        <TableToolbar
          filters={filters}
          onFilterChange={onFilterChange}
          query={query}
          onQueryChange={handleQuery}
          searchPlaceholder={searchPlaceholder}
          action={toolbarAction}
          stickyOffset={stickyOffset}
        />
      )}

      {isLoading ? (
        <TableSkeleton rows={skeletonRows} columns={headers.length || 6} />
      ) : rowData.length < 1 ? (
        <EmptyState
          title={emptyState?.title}
          description={emptyState?.description}
          icon={emptyState?.icon}
        />
      ) : (
        <>
          <Table.ScrollContainer minWidth={700}>
            <Table
              mb={20}
              classNames={{
                thead: classes.tableHeader,
                tr: `${classes.tableRow} ${
                  addOnStyle?.includes("noRowBorder") ? classes.noRowBorder : ""
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
              <Table.Tbody>{rowData}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {showPagination && totalItems && totalItems > rowsPerPage ? (
            <Flex justify="flex-end" pt={4} pb="md">
              <Pagination
                size="md"
                total={Math.ceil(totalItems / rowsPerPage)}
                siblings={1}
                value={activePage}
                onChange={setActivePage}
              />
            </Flex>
          ) : null}
        </>
      )}

      {hasVerifyBtn && <VerifyTransactionModal opened={opened} close={close} />}
    </Box>
  );
};

export default PpTable;
