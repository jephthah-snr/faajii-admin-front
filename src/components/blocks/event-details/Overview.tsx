"use client";

import {
  EventDetailsSkeleton,
  FormatDate,
  SummaryItem,
} from "@/components/elements";
import EmptyState from "../empty-state";
import EventSponsors from "./Sponsors";
import { IconChevronDown, IconLink, IconVendors } from "@/config/icons";
import { NoImage } from "@/images";
import { EventDetails } from "@/services/api/event/event.types";
import { formatStringAmount, getStatusColor, initialsColors } from "@/utils";
import {
  Avatar,
  BackgroundImage,
  Badge,
  Box,
  Card,
  Flex,
  Group,
  Loader,
  Menu,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import { useState } from "react";

interface EventOverviewProps {
  eventData: EventDetails;
  isFetching: boolean;
  eventId: string;
}

/** Small titled panel used for the supporting cards under the hero. */
const Panel = ({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) => (
  <Card radius="lg" h="100%">
    <Group justify="space-between" mb={14}>
      <Text
        fw={600}
        fz={11}
        tt="uppercase"
        c="var(--fj-text-muted)"
        style={{ letterSpacing: "0.05em" }}
      >
        {title}
      </Text>
      {count !== undefined && count > 0 && (
        <Badge variant="light" color="gray" radius="sm" size="sm">
          {count}
        </Badge>
      )}
    </Group>
    {children}
  </Card>
);

const EventOverview = ({
  eventData,
  isFetching,
  eventId,
}: EventOverviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState(eventData?.visibility);

  const handleVisibilityChange = async (next: string) => {
    setVisibility(next);
    setIsLoading(true);
    try {
      console.log("Visibility changed to:", next);
    } catch (error) {
      console.error("Error updating visibility:", error);
      setVisibility(eventData?.visibility);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <EventDetailsSkeleton />;

  const vendors = eventData?.vendors || [];

  return (
    <Stack gap={20}>
      {/* ------------------------------------------------------------- Hero */}
      <Flex direction={{ base: "column", lg: "row" }} gap={20} align="stretch">
        <Box w={{ base: "100%", lg: 260 }} style={{ flexShrink: 0 }}>
          <BackgroundImage
            src={eventData?.eventImageUrl || NoImage.src}
            h={{ base: 220, lg: "100%" }}
            mih={280}
            radius="var(--fj-radius-card)"
            bgsz="cover"
            style={{ border: "1px solid var(--fj-border)" }}
          />
        </Box>

        <Card radius="lg" flex={1}>
          <Stack gap={24}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={6} style={{ minWidth: 0 }}>
                <Text fz={24} fw={700} lh={1.2}>
                  {eventData?.name || "Untitled event"}
                </Text>
                <Group gap={8}>
                  <Badge
                    variant="light"
                    radius="sm"
                    tt="capitalize"
                    styles={{
                      root: {
                        color: getStatusColor(
                          eventData?.status?.toLowerCase() || "",
                        ),
                      },
                    }}
                  >
                    {eventData?.status || "Unknown"}
                  </Badge>
                  <Text fz={12} c="var(--fj-text-muted)" ff="monospace">
                    #{eventData?.eventId}
                  </Text>
                </Group>
              </Stack>

              {/* Visibility is the one thing an admin changes from here, so it
                  sits in the hero rather than buried in the fact grid. */}
              <Menu position="bottom-end">
                <Menu.Target>
                  <Badge
                    variant="light"
                    color="gray"
                    radius="sm"
                    size="lg"
                    className="cursor-pointer"
                    rightSection={
                      isLoading ? (
                        <Loader size={12} color="gray" />
                      ) : (
                        <IconChevronDown
                          size={14}
                          color="currentColor"
                          variant="Linear"
                        />
                      )
                    }
                  >
                    <Text fz={12} tt="capitalize">
                      {visibility || "N/A"}
                    </Text>
                  </Badge>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={() => handleVisibilityChange("public")}>
                    Public
                  </Menu.Item>
                  <Menu.Item onClick={() => handleVisibilityChange("private")}>
                    Private
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <SimpleGrid
              cols={{ base: 2, md: 3 }}
              spacing="lg"
              verticalSpacing="lg"
            >
              <SummaryItem
                label="Date"
                value={
                  <Text fw={600} fz={15}>
                    <FormatDate
                      data={eventData?.startDate || ""}
                      formatType="withoutYear"
                    />
                    {" – "}
                    <FormatDate
                      data={eventData?.endDate || ""}
                      formatType="fullDate"
                    />
                  </Text>
                }
              />
              <SummaryItem
                label="Time"
                value={
                  <Text fw={600} fz={15}>
                    <FormatDate
                      data={eventData?.startDate || ""}
                      formatType="time"
                    />
                    {" – "}
                    <FormatDate
                      data={eventData?.endDate || ""}
                      formatType="time"
                    />
                  </Text>
                }
              />
              <SummaryItem
                label="Estimated budget"
                value={`₦${formatStringAmount(eventData?.eventBudget || 0.0)}`}
              />
              <SummaryItem
                label="Creator"
                value={
                  <Flex align="center" gap={8}>
                    <Avatar
                      size={24}
                      name={eventData?.owner?.name || "U"}
                      color="initials"
                      allowedInitialsColors={initialsColors}
                      alt="avatar"
                    />
                    <Text fw={600} fz={14} tt="capitalize">
                      {eventData?.owner?.name || "N/A"}
                    </Text>
                  </Flex>
                }
              />
              <SummaryItem
                label="Event type"
                value={eventData?.eventType?.name || "N/A"}
                tt="capitalize"
              />
              <SummaryItem
                label="Public page"
                value={
                  eventData?.eventSlug ? (
                    <Link
                      href={`https://faajii.rsvp/${eventData.eventSlug}`}
                      target="_blank"
                    >
                      <Flex align="center" gap={6}>
                        <IconLink
                          size={14}
                          color="var(--fj-accent)"
                          variant="Linear"
                        />
                        <Text fw={600} fz={14} c="var(--fj-accent)">
                          faajii.rsvp/{eventData.eventSlug}
                        </Text>
                      </Flex>
                    </Link>
                  ) : (
                    "N/A"
                  )
                }
              />
            </SimpleGrid>
          </Stack>
        </Card>
      </Flex>

      {/* ------------------------------------------------------ About + cast */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={20}>
        <Panel title="About this event">
          <ScrollArea.Autosize mah={200} scrollbarSize={4}>
            <Text fz={14} lh={1.6} c="var(--fj-text-secondary)">
              {eventData?.description || "No description was provided."}
            </Text>
          </ScrollArea.Autosize>
        </Panel>

        <Panel title="Vendors" count={vendors.length}>
          {vendors.length > 0 ? (
            <ScrollArea.Autosize mah={200} scrollbarSize={4}>
              <Stack gap={12}>
                {vendors.map((vendor) => (
                  <Flex key={vendor?.id} align="center" gap={10}>
                    <Avatar
                      size={34}
                      name={vendor?.businessName || "U"}
                      color="initials"
                      allowedInitialsColors={initialsColors}
                      alt="avatar"
                    />
                    <Text fw={500} fz={14} tt="capitalize" lineClamp={1}>
                      {vendor?.businessName || "N/A"}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          ) : (
            <EmptyState
              compact
              icon={IconVendors}
              title="No vendors"
              description="This host hasn't attached any vendors."
            />
          )}
        </Panel>

        {/* Sponsors live here rather than in their own tab — they're context
            about the event, not a workflow of their own. */}
        <Panel title="Sponsors">
          <EventSponsors eventId={eventId} variant="compact" />
        </Panel>
      </SimpleGrid>
    </Stack>
  );
};

export default EventOverview;
