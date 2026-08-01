"use client";

import {
  EventDetailsSkeleton,
  FormatDate,
  SummaryItem,
} from "@/components/elements";
import { IconCaretDown } from "@/icons";
import { NoImage, NoVendor } from "@/images";
import { EventDetails } from "@/services/api/event/event.types";
import {
  formatStringAmount,
  getPhoneCountryFlag,
  getStatusColor,
  initialsColors,
} from "@/utils";
import {
  Avatar,
  BackgroundImage,
  Box,
  Card,
  Flex,
  Loader,
  Menu,
  ScrollArea,
  Text,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface EventOverviewProps {
  eventData: EventDetails;
  isFetching: boolean;
}

const EventOverview = ({ eventData, isFetching }: EventOverviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState(eventData?.visibility);

  const plannersWithFlags = useMemo(() => {
    return eventData?.planners?.map((planner: any) => ({
      ...planner,
      flag: getPhoneCountryFlag(planner?.phone || ""),
    }));
  }, [eventData?.planners]);

  const handleVisibilityChange = async (visibility: string) => {
    setVisibility(visibility);
    setIsLoading(true);
    try {
      console.log("Visibility changed to:", visibility);
    } catch (error: any) {
      console.error("Error updating visibility:", error);
      setVisibility(eventData?.visibility);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isFetching ? (
        <EventDetailsSkeleton />
      ) : (
        <Flex direction="column" gap={30} mt={10}>
          <Flex direction={{ base: "column", lg: "row" }} gap={20}>
            <Box
              className="border-2 border-white rounded-[18px] bg-white"
              w={{ base: "100%", md: "fit-content" }}
              h={304}
            >
              <BackgroundImage
                flex={{ base: 1, md: "0 0 30%" }}
                src={eventData?.eventImageUrl || NoImage.src}
                w={{ base: "100%", md: 250 }}
                h={300}
                radius={16}
                bgsz="cover"
                className="border-2 border-white"
              />
            </Box>

            <Card bg="#171717E5" radius={16} p={26} w="100%" flex={1}>
              <Flex direction="column" gap={30}>
                {/* Name & type */}
                <Box className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
                  <SummaryItem label="Event Name:" value={eventData?.name} />
                  <Box />
                  <SummaryItem
                    label="Event Type:"
                    value={
                      <Menu>
                        <Menu.Target>
                          <Flex
                            align="center"
                            gap={isLoading ? 10 : 2}
                            className="cursor-pointer"
                          >
                            <Text fw={500} fz={14} c="#e1e1e1" tt="capitalize">
                              {visibility || "N/A"}
                            </Text>

                            {isLoading ? (
                              <Loader size="xs" color="#e1e1e1" />
                            ) : (
                              <Image
                                src={IconCaretDown}
                                width={20}
                                height={20}
                                alt="icon"
                              />
                            )}
                          </Flex>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            onClick={() => handleVisibilityChange("public")}
                          >
                            Public
                          </Menu.Item>
                          <Menu.Item
                            onClick={() => handleVisibilityChange("private")}
                          >
                            Private
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    }
                  />
                </Box>

                {/* Dates & budget */}
                <Box className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
                  <SummaryItem
                    label="Date:"
                    value={
                      <Text fw={500} fz={18} c="#fff">
                        <FormatDate
                          data={eventData?.startDate || ""}
                          formatType="withoutYear"
                        />{" "}
                        {"-"}{" "}
                        <FormatDate
                          data={eventData?.endDate || ""}
                          formatType="fullDate"
                        />
                      </Text>
                    }
                  />
                  <SummaryItem
                    label="Time:"
                    value={
                      <Text fw={500} fz={18} c="#fff">
                        <FormatDate
                          data={eventData?.startDate || ""}
                          formatType="time"
                        />{" "}
                        {"-"}{" "}
                        <FormatDate
                          data={eventData?.endDate || ""}
                          formatType="time"
                        />
                      </Text>
                    }
                  />
                  <SummaryItem
                    label="Estimated Budget:"
                    value={`₦${formatStringAmount(
                      eventData?.eventBudget || 0.0
                    )}`}
                  />
                </Box>

                {/* Owner & others */}
                <Box className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
                  <SummaryItem
                    label="Creator:"
                    value={
                      <Flex align="center" gap={8}>
                        <Avatar
                          size="sm"
                          name={eventData?.owner?.name || "U"}
                          color="initials"
                          allowedInitialsColors={initialsColors}
                          alt="avatar"
                        />
                        <Text c="#fff" fw={500} fz={14} tt="capitalize">
                          {eventData?.owner?.name || "N/A"}
                        </Text>
                      </Flex>
                    }
                  />
                  <SummaryItem
                    label="Event URL:"
                    value={
                      <Link
                        href={`https://pv.rsvp/${eventData?.eventSlug}`}
                        target="_blank"
                      >
                        <Text fw={500} fz={14} c="#fff">
                          pv.rsvp/{eventData?.eventSlug}
                        </Text>
                      </Link>
                    }
                  />
                  <SummaryItem
                    label="Status:"
                    value={
                      <Text
                        c={getStatusColor(
                          eventData?.status?.toLocaleLowerCase() || ""
                        )}
                        fw={600}
                        fz={14}
                        tt="capitalize"
                      >
                        {eventData?.status || "N/A"}
                      </Text>
                    }
                  />
                </Box>
              </Flex>
            </Card>
          </Flex>

          <Box className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            <Flex direction="column" gap={20}>
              {/* Event description */}
              <Card radius={16} p={26} bg="transparent" withBorder>
                <Flex direction="column" gap={16}>
                  <Text fw={500} fz={14} c="#5E5E5E">
                    Event details:
                  </Text>
                  <Text fz={14} c="#fff">
                    {eventData?.description || "N/A"}
                  </Text>
                </Flex>
              </Card>

              {/* Event id */}
              <Card radius={16} p={26} bg="transparent" withBorder>
                <Flex align="center" gap={{ base: 4, md: 8 }}>
                  <Text fw={500} fz={14} c="#5E5E5E">
                    Event ID:
                  </Text>
                  <Text fz={14} c="#fff">
                    #{eventData?.eventId}
                  </Text>
                </Flex>
              </Card>
            </Flex>

            {/* Planner */}
            <Card radius={16} p={26} bg="transparent" withBorder>
              <Flex direction="column" gap={16}>
                <Text fw={700} fz={14} c="#fff">
                  Planners
                </Text>

                {/* List */}
                <ScrollArea.Autosize mah={240} scrollbarSize={0}>
                  <Flex direction="column" gap={14}>
                    {plannersWithFlags?.map((planner) => {
                      return (
                        <Flex key={planner?.id} align="center" gap={8}>
                          <Avatar
                            size="md"
                            src={planner?.userById?.avatar || ""}
                            name={planner?.userById?.name || "U"}
                            color="initials"
                            allowedInitialsColors={initialsColors}
                            alt="avatar"
                          />
                          <Flex direction="column" gap={2}>
                            <Text c="#fff" fw={500} fz={14} tt="capitalize">
                              {planner?.userById?.name || "N/A"} {planner?.flag}
                            </Text>
                            <Text c="#D9D9D9B2" fz={13}>
                              {planner?.phone || "N/A"}
                            </Text>
                          </Flex>
                        </Flex>
                      );
                    })}
                  </Flex>
                </ScrollArea.Autosize>
              </Flex>
            </Card>

            {/* Vendors */}
            <Card radius={16} p={26} bg="transparent" withBorder>
              <Flex direction="column" gap={16} h="100%">
                <Text fw={700} fz={14} c="#fff">
                  Vendors
                </Text>

                {/* List */}
                {eventData?.vendors?.length > 0 ? (
                  <ScrollArea.Autosize mah={240} scrollbarSize={0}>
                    <Flex direction="column" gap={14}>
                      {eventData?.vendors?.map((vendor) => (
                        <Flex key={vendor?.id} align="center" gap={8}>
                          <Avatar
                            size="md"
                            name={vendor?.businessName || "U"}
                            color="initials"
                            allowedInitialsColors={initialsColors}
                            alt="avatar"
                          />
                          <Flex direction="column" gap={2}>
                            <Text c="#fff" fw={500} fz={14} tt="capitalize">
                              {vendor?.businessName || "N/A"}
                            </Text>
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  </ScrollArea.Autosize>
                ) : (
                  <Flex
                    direction="column"
                    h="100%"
                    align="center"
                    justify="center"
                    gap={10}
                  >
                    <Image src={NoVendor} width={120} height={120} alt="icon" />
                    <Text fz={18} lh={1.3} ta="center" c="#fff" w="60%">
                      No vendors added for this event
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Card>
          </Box>
        </Flex>
      )}
    </>
  );
};

export default EventOverview;
