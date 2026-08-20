import { Card, Flex, Skeleton } from "@mantine/core";

export const SummaryCardSkeleton = () => {
  return (
    <>
      {[...Array(4)].map((_, rowIndex) => (
        <Card key={rowIndex} p={20} miw={190} flex={1} bg="var(--fj-surface)" radius={16}>
          <Flex direction="column" gap={30}>
            <Skeleton width={80} height={16} radius="xl" />
            <Flex direction="column" gap={14}>
              <Skeleton width={140} height={26} radius="lg" />
            </Flex>
          </Flex>
        </Card>
      ))}
    </>
  );
};

export const SummaryCardSkeletonAlt = () => {
  return (
    <>
      {[...Array(4)].map((_, rowIndex) => (
        <Card
          key={rowIndex}
          p={20}
          miw={170}
          flex={1}
          bg="transparent"
          style={{ borderRight: "1px solid #363636" }}
        >
          <Flex direction="column" gap={30}>
            <Skeleton width={80} height={16} radius="xl" />
            <Flex direction="column" gap={14}>
              <Skeleton width={140} height={26} radius="lg" />
            </Flex>
          </Flex>
        </Card>
      ))}
    </>
  );
};
