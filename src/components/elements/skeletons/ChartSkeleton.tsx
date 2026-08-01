import { Flex, Skeleton } from "@mantine/core";
import React from "react";

const ChartSkeleton = () => {
  return (
    <Flex direction="column" gap={40}>
      <Flex align="center" justify="center" gap={20}>
        {[...Array(3)].map((_, rowIndex) => (
          <Skeleton key={rowIndex} width={100} height={25} radius="lg" />
        ))}
      </Flex>

      <Flex direction="column" gap={30}>
        {[...Array(5)].map((_, rowIndex) => (
          <Skeleton key={rowIndex} height={10} radius="xl" />
        ))}
      </Flex>
    </Flex>
  );
};

export default ChartSkeleton;
