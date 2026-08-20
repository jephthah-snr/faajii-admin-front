import { Skeleton, Table } from "@mantine/core";
import classes from "@/styles/General.module.css";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Mirrors the real table's row rhythm and column count so the layout doesn't
 * jump when data arrives. Widths vary per column to read as content rather
 * than a block of identical bars.
 */
const TableSkeleton = ({ rows = 8, columns = 6 }: TableSkeletonProps) => {
  const widths = ["60%", "85%", "70%", "50%", "75%", "45%", "65%", "55%"];

  return (
    <Table
      verticalSpacing="md"
      horizontalSpacing="lg"
      classNames={{ thead: classes.tableHeader, th: classes.thItem }}
    >
      <Table.Thead>
        <Table.Tr>
          {[...Array(columns)].map((_, index) => (
            <Table.Th key={index}>
              <Skeleton height={10} width="55%" radius="xl" />
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {[...Array(rows)].map((_, rowIndex) => (
          <Table.Tr key={rowIndex} className={classes.tableRow}>
            {[...Array(columns)].map((_, colIndex) => (
              <Table.Td key={colIndex}>
                <Skeleton
                  height={12}
                  width={widths[(rowIndex + colIndex) % widths.length]}
                  radius="xl"
                />
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export default TableSkeleton;
