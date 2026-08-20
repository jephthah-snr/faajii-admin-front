import { Card, Flex, Skeleton } from "@mantine/core";
import React from "react";

const SubStatSkeleton = () => {
  return (
    <Card flex={1} radius={"lg"} bg="var(--fj-surface)">
      <Flex direction="column" gap={18}>
        <Skeleton width={"30%"} height={15} radius="xl" />
        {[...Array(3)].map((_, rowIndex) => (
          <Flex
            key={rowIndex}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={16}
          >
            <Skeleton width={"70%"} height={15} radius="xl" />
            <Skeleton width={"30%"} height={15} radius="xl" />
          </Flex>
        ))}
      </Flex>
    </Card>
  );
};

export default SubStatSkeleton;
