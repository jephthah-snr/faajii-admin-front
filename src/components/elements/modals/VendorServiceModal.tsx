"use client";

import {
  Avatar,
  Button,
  Card,
  Center,
  Drawer,
  Flex,
  rem,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import { EventSubDetailsSkeleton } from "../skeletons";
import Image from "next/image";
import StatusBadge from "../status-badge";
import { IconSearch } from "@/icons";
import inputClasses from "@/styles/Input.module.css";
import { useState } from "react";
import { DrinkImage1, ProductImage } from "@/images";
import FormatDate from "../format-date";

interface VendorServiceModalProps {
  id: string;
  opened: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  loadingRemove?: boolean;
}

const serviceDetails = [
  {
    id: 1,
    eventName: "Annual Tech Conference",
    date: "2024-03-15",
    status: "Confirmed",
  },
  {
    id: 2,
    eventName: "Art & Design Expo",
    date: "2024-04-22",
    status: "In Progress",
  },
  {
    id: 3,
    eventName: "Health & Wellness Fair",
    date: "2024-05-10",
    status: "Completed",
  },
  {
    id: 4,
    eventName: "Summer Music Festival",
    date: "2024-06-30",
    status: "Completed",
  },
  {
    id: 5,
    eventName: "Fall Book Fair",
    date: "2024-10-05",
    status: "Confirmed",
  },
  {
    id: 6,
    eventName: "Winter Art Showcase",
    date: "2024-12-12",
    status: "Confirmed",
  },
  {
    id: 7,
    eventName: "Spring Science Expo",
    date: "2025-03-15",
    status: "Confirmed",
  },
];

const VendorServiceModal = ({
  id,
  opened,
  onClose,
  onRemoveItem,
  loadingRemove,
}: VendorServiceModalProps) => {
  const isFetching = false;
  const [query, setQuery] = useState("");
  //const [debouncedQuery] = useDebouncedValue(query, 500);

  return (
    <Drawer
      title={`Product & Service Details`}
      opened={opened}
      onClose={onClose}
    >
      {isFetching ? (
        <EventSubDetailsSkeleton />
      ) : (
        <Flex mih="100vh" direction="column" justify="space-between">
          <ScrollArea.Autosize mah="100%" scrollbarSize={0}>
            <Flex direction="column" gap={40} pb={50}>
              {/* Item Details */}
              <Flex
                direction={{ base: "column", md: "row" }}
                align="flex-start"
                gap={16}
              >
                <Image
                  src={ProductImage}
                  width={170}
                  height={170}
                  className="rounded-lg"
                  alt="qr-code"
                />
                <Flex direction="column" gap={10} w="100%">
                  <Flex direction="column" gap={6}>
                    <Text c="#FFFFFF">Event Consultation</Text>
                    <Text fz={14} c="#5E5E5E" fw={500}>
                      Our in-depth planning sessions cover every detail. We
                      provide tailored advice on themes, logistics, and vendor
                      selection, ensuring your unique vision comes to life. Let
                      us handle the complexities while you enjoy a seamless
                      event planning experience.
                    </Text>
                  </Flex>
                  <Text c="#F5C912" fw={500}>
                    ₦ 50,000
                  </Text>
                </Flex>
              </Flex>

              {/* Guest orders */}
              <Flex direction="column" gap={10}>
                {serviceDetails && serviceDetails?.length > 0 ? (
                  <Flex direction="column" gap={30}>
                    <Flex direction="column" gap={16}>
                      <Text fz={13} c="#D9D9D9B2">
                        Past & Present Orders
                      </Text>

                      {/* Search */}
                      <TextInput
                        placeholder="Search"
                        variant="default"
                        leftSectionPointerEvents="none"
                        classNames={{ input: inputClasses.searchInput }}
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        size="md"
                        styles={{ input: { borderRadius: "50px" } }}
                        leftSection={
                          <Image
                            src={IconSearch}
                            alt="icon"
                            style={{ width: rem(16), height: rem(16) }}
                          />
                        }
                      />
                    </Flex>

                    <Flex direction="column" gap={14}>
                      {serviceDetails?.map((item) => (
                        <Card key={item?.id} bg="#181818" radius={10}>
                          <Flex align="center" justify="space-between" gap={16}>
                            <Flex align="center" gap={14}>
                              <Avatar
                                src={DrinkImage1.src}
                                name={item?.eventName || "U"}
                                w={40}
                                h={40}
                                radius="md"
                              />

                              <Flex direction="column" gap={4}>
                                <Text c="#E1E1E1" fw={700}>
                                  {item?.eventName || "N/A"}
                                </Text>
                                <Text c="#D9D9D9B2" fz={13}>
                                  <FormatDate
                                    data={item?.date}
                                    formatType="fullDate"
                                  />
                                </Text>
                              </Flex>
                            </Flex>

                            <Flex align="center" gap={6}>
                              <StatusBadge
                                status={item?.status}
                                fullWidth
                                useAltColor
                              />
                            </Flex>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  </Flex>
                ) : (
                  <Card bg="#181818" radius={10} h={100}>
                    <Center h="100%">
                      <Text fz={13} c="#D9D9D9B2" ta="center">
                        No order has been received for this item yet
                      </Text>
                    </Center>
                  </Card>
                )}
              </Flex>
            </Flex>
          </ScrollArea.Autosize>

          {/* Action buttons */}
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
              styles={{ root: { minWidth: "auto" } }}
              onClick={() => onRemoveItem(id)}
              disabled={loadingRemove}
              loading={loadingRemove}
            >
              Remove Item
            </Button>
          </Flex>
        </Flex>
      )}
    </Drawer>
  );
};

export default VendorServiceModal;
