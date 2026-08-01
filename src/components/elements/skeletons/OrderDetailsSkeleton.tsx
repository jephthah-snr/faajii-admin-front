import { Box, Flex, Skeleton } from "@mantine/core";

const OrderDetailsSkeleton = () => {
  return (
    <Flex direction="column" gap={40}>
      <Flex justify="space-between" align="center" gap={20}>
        <Skeleton w={120} h={14} radius="xl" />
        <Skeleton w={80} h={14} radius="xl" />
      </Flex>

      {/* Details */}
      <Flex direction="column" gap={18}>
        <Box className="grid grid-cols-2 gap-10">
          {[...Array(4)].map((_, rowIndex) => (
            <Flex key={rowIndex} direction="column" gap={14}>
              <Skeleton width={"60%"} height={16} radius="xl" />
              <Skeleton width={"100%"} height={20} radius="lg" />
            </Flex>
          ))}
        </Box>
      </Flex>

      <Flex justify="center">
        <Skeleton width={80} height={16} radius="xl" />
      </Flex>

      <Skeleton height={100} radius="md" />

      <Flex direction="column" gap={14} align="center">
        <Skeleton width={80} height={16} radius="xl" />
        <Skeleton width={100} height={16} radius="xl" />
      </Flex>
    </Flex>
  );
};

export default OrderDetailsSkeleton;
