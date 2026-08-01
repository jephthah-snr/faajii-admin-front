"use client";

import { Flex, Skeleton } from "@mantine/core";

const EventSubDetailsSkeleton = () => {
  return (
    <Flex direction="column" gap={40}>
      <Flex direction={{ base: "column", md: "row" }} gap={16}>
        <Skeleton w={240} h={180} radius="md" />
        <Flex direction="column" gap={20} w="100%">
          {Array.from({ length: 3 }).map((_, index) => (
            <Flex key={index} direction="column" gap={10}>
              <Skeleton w={"20%"} height={10} radius="md" />
              <Skeleton w={"80%"} height={28} radius="md" />
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Flex direction="column" gap={16}>
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} height={60} radius="md" />
        ))}
      </Flex>
    </Flex>
  );
};

export default EventSubDetailsSkeleton;
