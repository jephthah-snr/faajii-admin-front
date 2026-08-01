import { Flex, Skeleton } from "@mantine/core";

const ProductDetailsSkeleton = () => {
  return (
    <Flex direction="column" gap={30}>
      <Flex gap={20}>
        <Skeleton w={100} h={12} radius="xl" />
        <Skeleton w={80} h={12} radius="xl" />
      </Flex>

      {/* Gift Details */}
      <Flex direction={{ base: "column", md: "row" }} gap={20}>
        <Skeleton w={"100%"} h={180} radius="lg" />
        <Flex direction="column" w={"100%"} gap={28}>
          {[...Array(2)].map((_, rowIndex) => (
            <Flex direction="column" gap={10} key={rowIndex}>
              <Skeleton w={"40%"} h={12} radius="xl" />
              <Skeleton w={"100%"} h={20} radius="xl" />
            </Flex>
          ))}
          <Flex gap={20}>
            {[...Array(3)].map((_, rowIndex) => (
              <Flex direction="column" w={"100%"} gap={10} key={rowIndex}>
                <Skeleton w={"40%"} h={12} radius="xl" />
                <Skeleton w={"100%"} h={16} radius="xl" />
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>

      {/* Description */}
      <Flex direction="column" gap={10}>
        <Skeleton w={"30%"} h={12} radius="xl" />
        <Skeleton w={"100%"} h={30} radius="xl" />
      </Flex>

      {/* Buttons */}
      <Flex gap={20} w={"100%"} justify="center">
        <Skeleton w={"100%"} h={40} radius="xl" />
        <Skeleton w={"100%"} h={40} radius="xl" />
      </Flex>
    </Flex>
  );
};

export default ProductDetailsSkeleton;
