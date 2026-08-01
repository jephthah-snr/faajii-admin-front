"use client";

import { Card, Flex, Skeleton } from "@mantine/core";

const VendorDetailsSkeleton = () => {
  return (
    <Flex direction={{ base: "column", md: "row" }} gap={20}>
      <Card
        flex={{ base: 1, md: "0 40%" }}
        radius={16}
        p={26}
        bg="transparent"
        withBorder
      >
        <Flex direction={{ base: "column", md: "row" }} gap={16}>
          <Skeleton w={180} h={140} radius="md" />
          <Flex direction="column" gap={10}>
            <Skeleton w={140} height={30} radius="md" />
            <Skeleton w={100} height={18} radius="md" />
            <Skeleton w={80} height={18} radius="md" />
          </Flex>
        </Flex>

        <Flex direction="column" gap={20} w="100%" mt={40}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Flex key={index} align="center" gap={10}>
              <Skeleton w={"20%"} height={28} radius="md" />
              <Skeleton w={"80%"} height={28} radius="md" />
            </Flex>
          ))}
        </Flex>
      </Card>

      <Card
        flex={{ base: 1, md: "0 60%" }}
        radius={16}
        p={26}
        bg="transparent"
        withBorder
      >
        <Flex direction="column" gap={20}>
          <Skeleton w={130} h={30} radius="xl" />
          <Flex direction="column" gap={20} w="100%">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} w={"100%"} height={80} radius="md" />
            ))}
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};

export default VendorDetailsSkeleton;
