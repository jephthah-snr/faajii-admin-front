"use client";

import { Box, Card, Flex, Skeleton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";

const EventDetailsSkeleton = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");

  const detailsLength = isMobile ? 1 : 3;
  return (
    <Flex direction="column" gap={30} mt={10}>
      <Flex direction={{ base: "column", lg: "row" }} gap={20}>
        <Box w={{ base: "100%", md: "fit-content" }} h={304}>
          <Skeleton
            w={{ base: "100%", md: 250 }}
            h={300}
            radius={16}
            flex={{ base: 1, md: "0 0 30%" }}
          />
        </Box>

        <Card bg="#171717E5" radius={16} p={26} w="100%" flex={1}>
          <Flex direction="column" gap={40}>
            {/* Event details */}
            {Array.from({ length: detailsLength }).map((_, index) => (
              <Box
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-[20px]"
              >
                {Array.from({ length: 3 }).map((_, index) => (
                  <Flex key={index} direction="column" gap={6}>
                    <Skeleton h={10} w={80} radius="md" />
                    <Skeleton h={40} w={"100%"} radius="md" />
                  </Flex>
                ))}
              </Box>
            ))}
          </Flex>
        </Card>
      </Flex>

      <Box className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
        <Flex direction="column" gap={20}>
          {/* Event description */}
          <Card radius={16} p={26} bg="transparent" withBorder>
            <Flex direction="column" gap={16}>
              <Skeleton h={10} w={160} radius="md" />
              <Skeleton h={50} w={"100%"} radius="md" />
            </Flex>
          </Card>

          {/* Event id */}
          <Card radius={16} p={26} bg="transparent" withBorder>
            <Flex align="center" gap={{ base: 4, md: 12 }}>
              <Skeleton h={20} w={"100%"} radius="xl" />
            </Flex>
          </Card>
        </Flex>

        {/* Planner */}
        <Card radius={16} p={26} bg="transparent" withBorder>
          <Flex direction="column" gap={30}>
            <Skeleton h={20} w={120} radius="xl" />

            {/* List */}
            <Flex direction="column" gap={20}>
              {Array.from({ length: 2 }).map((_, index) => (
                <Flex key={index} align="center" gap={12}>
                  <Skeleton h={40} w={40} circle />
                  <Flex direction="column" gap={10}>
                    <Skeleton h={16} w={200} radius="xl" />
                    <Skeleton h={10} w={120} radius="xl" />
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Card>

        {/* Vendors */}
        <Card radius={16} p={26} bg="transparent" withBorder>
          <Flex direction="column" gap={30}>
            <Skeleton h={20} w={120} radius="xl" />

            {/* List */}
            <Flex direction="column" gap={20}>
              {Array.from({ length: 2 }).map((_, index) => (
                <Flex key={index} align="center" gap={12}>
                  <Skeleton h={40} w={40} circle />
                  <Flex direction="column" gap={10}>
                    <Skeleton h={16} w={200} radius="xl" />
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
};

export default EventDetailsSkeleton;
