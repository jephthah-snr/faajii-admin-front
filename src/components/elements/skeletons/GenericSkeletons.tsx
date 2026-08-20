import { Card, Flex, Paper, Skeleton, SimpleGrid, Stack } from "@mantine/core";

/** A row of metric tiles, matching `StatTile`'s proportions. */
export const StatRowSkeleton = ({ count = 4 }: { count?: number }) => (
  <SimpleGrid cols={{ base: 2, md: count > 3 ? 4 : count }}>
    {[...Array(count)].map((_, index) => (
      <Paper
        key={index}
        p="md"
        radius="md"
        bg="var(--fj-surface-elevated)"
        style={{ border: "1px solid var(--fj-border-subtle)" }}
      >
        <Skeleton height={10} width="55%" radius="xl" />
        <Skeleton height={24} width="70%" radius="md" mt={12} />
      </Paper>
    ))}
  </SimpleGrid>
);

/** Grid of content cards — vibes, host profiles, sponsors. */
export const CardGridSkeleton = ({
  count = 6,
  mediaHeight = 0,
  cols = { base: 1, md: 2, xl: 3 },
}: {
  count?: number;
  /** Set for cards that lead with an image. */
  mediaHeight?: number;
  cols?: Record<string, number>;
}) => (
  <SimpleGrid cols={cols}>
    {[...Array(count)].map((_, index) => (
      <Card key={index} radius="lg">
        {mediaHeight > 0 && (
          <Skeleton height={mediaHeight} radius="md" mb="md" />
        )}
        <Flex gap={10} align="center">
          <Skeleton height={38} circle />
          <Stack gap={6} style={{ flex: 1 }}>
            <Skeleton height={12} width="60%" radius="xl" />
            <Skeleton height={10} width="40%" radius="xl" />
          </Stack>
        </Flex>
        <Skeleton height={10} width="90%" radius="xl" mt="md" />
        <Skeleton height={10} width="70%" radius="xl" mt={8} />
      </Card>
    ))}
  </SimpleGrid>
);

/** Avatar + two lines, repeated — planner/vendor/contributor lists. */
export const ListSkeleton = ({ count = 4 }: { count?: number }) => (
  <Stack gap={14}>
    {[...Array(count)].map((_, index) => (
      <Flex key={index} gap={10} align="center">
        <Skeleton height={36} circle />
        <Stack gap={6} style={{ flex: 1 }}>
          <Skeleton height={11} width="45%" radius="xl" />
          <Skeleton height={9} width="30%" radius="xl" />
        </Stack>
      </Flex>
    ))}
  </Stack>
);

/** Label/value pairs inside a details panel. */
export const DetailPanelSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <Card radius="lg">
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" verticalSpacing="xl">
      {[...Array(rows)].map((_, index) => (
        <Stack key={index} gap={8}>
          <Skeleton height={9} width="40%" radius="xl" />
          <Skeleton height={14} width="75%" radius="xl" />
        </Stack>
      ))}
    </SimpleGrid>
  </Card>
);
