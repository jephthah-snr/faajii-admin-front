"use client";

import { EditEventGuestDetails, GetEventGuestDetails } from "@/services/api";
import { QRCodeSVG } from "qrcode.react";
import {
  BackgroundImage,
  Box,
  Button,
  Card,
  Center,
  Drawer,
  Flex,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import SummaryItem from "../summary-item";
import StatusBadge from "../status-badge";
import classes from "@/styles/General.module.css";
import { capitalizeString } from "@/utils";
import FormatDate from "../format-date";
import { EventSubDetailsSkeleton } from "../skeletons";
import { useState } from "react";

interface GuestDetailsModalProps {
  id: string;
  opened: boolean;
  onClose: () => void;
  onResendRSVP: (id: string) => void;
  onRemoveGuest: (id: string) => void;
  loadingResend?: boolean;
  loadingRemove?: boolean;
}

const GuestDetailsModal = ({
  id,
  opened,
  onClose,
  onResendRSVP,
  onRemoveGuest,
  loadingResend,
  loadingRemove,
}: GuestDetailsModalProps) => {
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submittingPhone, setSubmittingPhone] = useState(false);

  // Fetch guest details
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["guest-details", id],
    queryFn: () => GetEventGuestDetails(id),
    enabled: !!id,
  });
  const guestDetails = data?.data;

  return (
    <>
      <Drawer title="RSVP Details" opened={opened} onClose={onClose}>
        {isFetching ? (
          <EventSubDetailsSkeleton />
        ) : (
          <Flex mih="100vh" direction="column" justify="space-between">
            <ScrollArea.Autosize mah="100%" scrollbarSize={0}>
              <Flex direction="column" gap={40} pb={50}>
                {/* RSVP Details */}
                <Flex
                  direction={{ base: "column", md: "row" }}
                  align="flex-start"
                  gap={16}
                >
                  <QRCodeSVG
                    value={guestDetails?.qrCode?.rsvpReference || ""}
                    size={170}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                    className="rounded-lg p-2 bg-white"
                  />
                  <Flex direction="column" gap={20} w="100%">
                    <Flex justify="space-between" gap={10}>
                      <SummaryItem
                        label="Guest Name:"
                        value={capitalizeString(
                          guestDetails?.guest?.name || "N/A"
                        )}
                        fz={16}
                      />
                      <StatusBadge
                        px={0}
                        status={capitalizeString(
                          guestDetails?.guest?.status || "N/A"
                        )}
                      />
                    </Flex>
                    <SummaryItem
                      label="RSVP Code"
                      value={guestDetails?.rsvp?.reference || "N/A"}
                      fz={16}
                    />

                    <Flex
                      direction={{ base: "column", md: "row" }}
                      justify="space-between"
                      gap={10}
                    >
                      <SummaryItem
                        label="Email:"
                        value={guestDetails?.guest?.email || "N/A"}
                        fz={16}
                        editable
                        isLoading={submittingEmail}
                        setIsLoading={setSubmittingEmail}
                        refetch={refetch}
                        onSubmit={async (newValue) => {
                          await EditEventGuestDetails(
                            String(guestDetails?.guest?.id),
                            {
                              email: newValue,
                            }
                          );
                        }}
                      />
                      <SummaryItem
                        label="Phone Number:"
                        value={guestDetails?.guest?.phone || "N/A"}
                        fz={16}
                        editable
                        isLoading={submittingPhone}
                        setIsLoading={setSubmittingPhone}
                        refetch={refetch}
                        onSubmit={async (newValue) => {
                          await EditEventGuestDetails(
                            String(guestDetails?.guest?.id),
                            {
                              phone: newValue,
                            }
                          );
                        }}
                      />
                    </Flex>
                  </Flex>
                </Flex>

                {/* Resend RSVP */}
                <Button
                  size="sm"
                  radius="xl"
                  className={classes.btnWhite}
                  styles={{ root: { minWidth: "auto" } }}
                  onClick={() => onResendRSVP(id)}
                  disabled={loadingResend}
                  loading={loadingResend}
                >
                  Resend RSVP
                </Button>

                {/* Tickets & purchases */}
                <Flex direction="column" gap={10}>
                  <Text fz={13} c="#D9D9D9B2">
                    Tickets & Purchases 🎟️
                  </Text>

                  {guestDetails?.purchases?.tickets &&
                  guestDetails?.purchases?.tickets?.length > 0 ? (
                    <Flex direction="column" gap={20}>
                      {guestDetails?.purchases?.tickets?.map((item) => (
                        <Card key={item?.orderId} bg="var(--fj-surface)" radius={10}>
                          <Flex
                            direction={{ base: "column", md: "row" }}
                            align={{ base: "flex-start", md: "center" }}
                            justify="space-between"
                            gap={10}
                          >
                            <Flex align="center" gap={14}>
                              <BackgroundImage
                                src={item?.itemImage}
                                w={80}
                                h={80}
                                bgsz="cover"
                                radius="md"
                              />

                              <Flex direction="column" gap={4}>
                                <Flex align="center" gap={10}>
                                  <Text c="#E1E1E1" fw={700}>
                                    {item?.itemName || "N/A"}
                                  </Text>
                                  <Box
                                    bg="#E1E1E1"
                                    className="w-1 h-1 rounded-full"
                                  />
                                  <Text c="#E1E1E1" fw={700}>
                                    {item?.quantity}x
                                  </Text>
                                </Flex>
                                <Text c="#D9D9D9B2" fz={13}>
                                  Total:{" "}
                                  {Number(item?.totalPrice)?.toLocaleString()}{" "}
                                  NGN
                                </Text>
                                <Flex align="center" gap={10}>
                                  <Text c="#D9D9D9B2" fw={500} fz={13}>
                                    <FormatDate
                                      data={item?.purchasedAt || ""}
                                      formatType="fullDateTimeAlt"
                                    />
                                  </Text>
                                  <Box
                                    bg="#D9D9D9B2"
                                    className="w-1 h-1 rounded-full"
                                  />
                                  <Text
                                    tt="capitalize"
                                    c="#D9D9D9B2"
                                    fw={500}
                                    fz={13}
                                  >
                                    {item?.purchasedAt ? "Paid" : "Not Paid"}
                                  </Text>
                                </Flex>
                              </Flex>
                            </Flex>

                            {/* RSVP Status */}
                            <Card
                              bg="var(--fj-bg)"
                              radius={12}
                              w={80}
                              h={80}
                              p={2}
                              className="border-2 border-[#242529]"
                            >
                              <Flex direction="column" h="100%">
                                <Box py={6}>
                                  <Text ta="center" fz={12} c="#E1E1E1">
                                    Check In
                                  </Text>
                                </Box>
                                <Flex
                                  h="100%"
                                  bg="var(--fj-success)"
                                  justify="center"
                                  align="center"
                                  className="rounded-b-[8px]"
                                >
                                  <Text
                                    tt="uppercase"
                                    fw={700}
                                    fz={14}
                                    c="#fff"
                                    ta="center"
                                  >
                                    Guest
                                  </Text>
                                </Flex>
                              </Flex>
                            </Card>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  ) : (
                    <Card bg="var(--fj-surface)" radius={10} h={100}>
                      <Center h="100%">
                        <Text fz={13} c="#D9D9D9B2" ta="center">
                          No orders found for this guest
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
              bg="var(--fj-bg)"
              pos="sticky"
              bottom={0}
              left={0}
              w="100%"
            >
              <Button
                size="sm"
                radius="xl"
                color="#FF6464"
                c="#000000"
                onClick={() => onRemoveGuest(id)}
                disabled={loadingRemove}
                loading={loadingRemove}
                styles={{ root: { minWidth: "auto" } }}
              >
                Remove Guest
              </Button>
            </Flex>
          </Flex>
        )}
      </Drawer>
    </>
  );
};

export default GuestDetailsModal;
