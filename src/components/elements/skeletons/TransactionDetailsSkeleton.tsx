import { Box, Flex, Skeleton } from "@mantine/core";

const TransactionDetailsSkeleton = () => {
  return (
    <Flex direction="column" px={10} pb={10} gap={40}>
      <Flex align="flex-start" justify="space-between">
        <Skeleton radius="lg" width={80} height={80} />
        <Flex direction="column" gap={8}>
          <Skeleton radius="xl" width={100} height={16} />
          <Skeleton radius="xl" width={100} height={16} />
        </Flex>
      </Flex>

      {/* Amount */}

      <Skeleton radius="lg" width={"100%"} height={80} />

      {/* Details */}
      <Flex direction="column" gap={18}>
        <Box className="grid grid-cols-2 gap-10">
          {[...Array(4)].map((_, rowIndex) => (
            <Flex key={rowIndex} direction="column" gap={8}>
              <Skeleton radius="xl" width={"40%"} height={10} />
              <Skeleton radius="xl" width={"100%"} height={16} />
            </Flex>
          ))}
        </Box>
      </Flex>

      {/* Buttons */}
      <Flex gap={20} w={"100%"} justify="center">
        <Skeleton w={"100%"} h={40} radius="xl" />
        <Skeleton w={"100%"} h={40} radius="xl" />
      </Flex>
    </Flex>
  );
};

export default TransactionDetailsSkeleton;
