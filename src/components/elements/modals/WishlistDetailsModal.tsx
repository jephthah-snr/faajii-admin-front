"use client";

import { GetEventWishlistDetails } from "@/services/api";
import {
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Drawer,
  Flex,
  Progress,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { EventSubDetailsSkeleton } from "../skeletons";
import Image from "next/image";
import SummaryItem from "../summary-item";
import StatusBadge from "../status-badge";
import { NoImage } from "@/images";
import { getProgressColor } from "@/utils";

interface WishlistDetailsModalProps {
  id: string;
  opened: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  loadingRemove?: boolean;
}

const WishlistDetailsModal = ({
  id,
  opened,
  onClose,
  onRemove,
  loadingRemove,
}: WishlistDetailsModalProps) => {
  // Fetch wishlist details
  const { data, isFetching } = useQuery({
    queryKey: ["wishlist-details", id],
    queryFn: () => GetEventWishlistDetails(id),
    enabled: !!id,
  });
  const wishlistDetails = data?.data;

  const progressColor = getProgressColor(
    wishlistDetails?.contribution?.progress || 0
  );

  return (
    <Drawer title="Gift Details" opened={opened} onClose={onClose}>
      {isFetching ? (
        <EventSubDetailsSkeleton />
      ) : (
        <Flex mih="100vh" direction="column" justify="space-between">
          <ScrollArea.Autosize mah="100%" scrollbarSize={0}>
            <Flex direction="column" gap={40} pb={50}>
              {/* Gift Details */}
              <Flex
                direction={{ base: "column", md: "row" }}
                align="flex-start"
                gap={16}
              >
                <Image
                  src={wishlistDetails?.item?.images?.[0] || NoImage}
                  width={170}
                  height={170}
                  className="rounded-lg"
                  alt="qr-code"
                />
                <Flex direction="column" gap={20} w="100%">
                  <SummaryItem
                    label="Gift Name:"
                    value={wishlistDetails?.item?.itemName || "N/A"}
                    fz={16}
                  />

                  <SummaryItem
                    label="Price:"
                    value={`₦ ${
                      Number(wishlistDetails?.item?.price)?.toLocaleString() ||
                      0
                    }`}
                    fz={16}
                  />

                  <StatusBadge
                    px={0}
                    status={wishlistDetails?.contribution?.status || ""}
                  />
                </Flex>
              </Flex>

              {/* Progress card */}
              <Card radius={16} p={26} bg="transparent" withBorder>
                <Flex direction="column" gap={16}>
                  <Text fz={13} c="#D9D9D9B2">
                    {wishlistDetails?.contribution?.isComplete ? (
                      <>
                        Gift fully funded by{" "}
                        {wishlistDetails?.contribution?.contributorCount} person
                        {wishlistDetails?.contribution?.contributorCount !==
                          1 && "s"}{" "}
                        <span className="text-white">🥳🛍️</span>
                      </>
                    ) : (
                      <>
                        {wishlistDetails?.contribution?.contributorCount} person
                        {wishlistDetails?.contribution?.contributorCount !==
                          1 && "s"}{" "}
                        has contributed to this gift
                      </>
                    )}
                  </Text>

                  <Box>
                    <Progress
                      value={wishlistDetails?.contribution?.progress || 0}
                      w="100%"
                      color={progressColor}
                    />
                  </Box>

                  <Flex align="center" justify="space-between" gap={10}>
                    <Flex align="center" gap={4}>
                      <Text fz={13} c="#D9D9D9B2">
                        Progress:
                      </Text>
                      <Text fz={13} c="#fff">
                        {wishlistDetails?.contribution?.progress || 0}%
                      </Text>
                    </Flex>

                    <Flex align="center" gap={4}>
                      <Text fz={13} c="#D9D9D9B2">
                        Contributed:
                      </Text>
                      <Text fz={13} c={progressColor}>
                        ₦
                        {Number(
                          wishlistDetails?.contribution?.totalContributed
                        )?.toLocaleString() || 0}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>

              {/* Breakdown */}
              <Flex direction="column" gap={10}>
                <Text fz={13} c="#D9D9D9B2">
                  Breakdown
                </Text>
                {wishlistDetails?.contributors &&
                wishlistDetails?.contributors?.length > 0 ? (
                  <Flex direction="column" gap={14}>
                    {wishlistDetails?.contributors?.map((item) => (
                      <Card key={item?.contributorId} bg="#181818" radius={10}>
                        <Flex align="center" justify="space-between" gap={16}>
                          <Flex align="center" gap={14}>
                            <Avatar
                              src={item?.avatar}
                              name={item?.name || "U"}
                              w={40}
                              h={40}
                              radius="xl"
                            />

                            <Flex direction="column" gap={4}>
                              <Text c="#E1E1E1" fw={700}>
                                {item?.name || "N/A"}
                              </Text>
                              <Text c="#D9D9D9B2" fz={13}>
                                {item?.email || "N/A"}
                              </Text>
                            </Flex>
                          </Flex>

                          <Text c="#E1E1E1" fw={700}>
                            ₦{item?.amountContributed?.toLocaleString()}
                          </Text>
                        </Flex>
                      </Card>
                    ))}
                  </Flex>
                ) : (
                  <Card bg="#181818" radius={10} h={100}>
                    <Center h="100%">
                      <Text fz={13} c="#D9D9D9B2" ta="center">
                        No contributors for this gift yet
                      </Text>
                    </Center>
                  </Card>
                )}
              </Flex>
            </Flex>
          </ScrollArea.Autosize>

          {/* Remove button */}
          <Flex
            justify="flex-end"
            py="md"
            bg="#000"
            pos="sticky"
            bottom={0}
            left={0}
            w="100%"
            gap={10}
          >
            <Button
              size="sm"
              radius="xl"
              color="#FF6464"
              c="#000000"
              onClick={() => onRemove(id)}
              loading={loadingRemove}
              disabled={loadingRemove}
              styles={{ root: { minWidth: "auto" } }}
            >
              Remove Gift
            </Button>
          </Flex>
        </Flex>
      )}
    </Drawer>
  );
};

export default WishlistDetailsModal;
