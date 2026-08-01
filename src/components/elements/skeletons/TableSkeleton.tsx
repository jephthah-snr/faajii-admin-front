import { Skeleton, Table } from "@mantine/core";

const TableSkeleton = () => {
  const columns = 4; // Number of columns in the table
  const rows = 5; // Number of rows for the skeleton

  return (
    <Table verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Skeleton height={20} width="80%" radius="md" />
          </Table.Th>
          <Table.Td>
            <Skeleton height={20} width="80%" radius="md" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width="80%" radius="md" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width="80%" radius="md" />
          </Table.Td>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {[...Array(rows)].map((_, rowIndex) => (
          <Table.Tr key={rowIndex}>
            {[...Array(columns)].map((_, colIndex) => (
              <Table.Td key={colIndex}>
                <Skeleton height={15} radius="sm" />
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export default TableSkeleton;
