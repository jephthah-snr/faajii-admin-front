"use client";

import { GetEventStoreDetails } from "@/services/api";
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
import { useQuery } from "@tanstack/react-query";
import { EventSubDetailsSkeleton } from "../skeletons";
import Image from "next/image";
import SummaryItem from "../summary-item";
import StatusBadge from "../status-badge";
import { IconSearch } from "@/icons";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import { useDebouncedValue } from "@mantine/hooks";
import { useState } from "react";
import { NoImage } from "@/images";

interface PartyStoreDetailsModalProps {
  id: string;
  opened: boolean;
  onClose: () => void;
  onArchiveItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  loadingArchive?: boolean;
  loadingRemove?: boolean;
}

const PartyStoreDetailsModal = ({
  id,
  opened,
  onClose,
  onArchiveItem,
  onRemoveItem,
  loadingArchive,
  loadingRemove,
}: PartyStoreDetailsModalProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);

  // Fetch store details
  const { data, isFetching } = useQuery({
    queryKey: ["store-details", id, debouncedQuery],
    queryFn: () => GetEventStoreDetails(id, debouncedQuery),
    enabled: !!id,
  });
  const storeDetails = data?.data;

  return (
    <Drawer title={`Item ID: #${id}`} opened={opened} onClose={onClose}>
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
                  src={storeDetails?.item?.images?.[0] || NoImage}
                  width={170}
                  height={170}
                  className="rounded-lg"
                  alt="qr-code"
                />
                <Flex direction="column" gap={20} w="100%">
                  <Flex justify="space-between">
                    <SummaryItem
                      label="Item Name:"
                      value={storeDetails?.item?.name || "N/A"}
                      fz={16}
                    />
                    <StatusBadge
                      status={
                        storeDetails?.item?.isActive === 1
                          ? "Active"
                          : "Inactive"
                      }
                    />
                  </Flex>
                  <SummaryItem
                    label="Price"
                    value={`${
                      Number(storeDetails?.item?.price)?.toLocaleString() || 0
                    } NGN`}
                    fz={16}
                  />

                  <Flex align="center" justify="space-between" gap={10}>
                    <SummaryItem
                      label="Quantity"
                      value={storeDetails?.item?.quantityAvailable || 0}
                      fz={16}
                    />
                    <SummaryItem
                      label="Purchased"
                      value={storeDetails?.item?.quantityPurchased || 0}
                      fz={16}
                    />
                    <SummaryItem
                      label="Total"
                      value={storeDetails?.item?.totalQuantity || 0}
                      fz={16}
                    />
                  </Flex>
                </Flex>
              </Flex>

              {/* Description */}
              <SummaryItem
                label="Description"
                value={storeDetails?.item?.description || "N/A"}
                fz={16}
              />

              {/* Guest orders */}
              <Flex direction="column" gap={10}>
                {storeDetails?.guestOrders &&
                storeDetails?.guestOrders?.length > 0 ? (
                  <Flex direction="column" gap={30}>
                    <Flex direction="column" gap={16}>
                      <Text fz={13} c="#D9D9D9B2">
                        {storeDetails?.guestOrders?.length} Guest Orders Total
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
                      {storeDetails?.guestOrders?.map((item) => (
                        <Card key={item?.guestId} bg="#181818" radius={10}>
                          <Flex align="center" justify="space-between" gap={16}>
                            <Flex align="center" gap={14}>
                              <Avatar
                                src={item?.avatar}
                                name={item?.guestName || "U"}
                                w={40}
                                h={40}
                                radius="md"
                              />

                              <Flex direction="column" gap={4}>
                                <Text c="#E1E1E1" fw={700}>
                                  {item?.guestName || "N/A"}
                                </Text>
                                <Text c="#D9D9D9B2" fz={13}>
                                  {item?.guestEmail || "N/A"}
                                </Text>
                              </Flex>
                            </Flex>

                            <Flex align="center" gap={6}>
                              <Text c="#fff">
                                {item?.numberOfItemsPurchased}
                              </Text>
                              <Text>🛍️</Text>
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
                        No guests have ordered for this item yet
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
              className={classes.btnWhite}
              styles={{ root: { minWidth: "auto" } }}
              onClick={() => onArchiveItem(id)}
              disabled={loadingArchive}
              loading={loadingArchive}
            >
              Archive Item
            </Button>
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
              Delete Item
            </Button>
          </Flex>
        </Flex>
      )}
    </Drawer>
  );
};

export default PartyStoreDetailsModal;
