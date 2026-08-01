"use client";

import {
  ConfirmationModal,
  CustomModal,
  EmptyState,
  FormatDate,
  StatusBadge,
} from "@/components";
import {
  Flex,
  Text,
  Tabs,
  Group,
  Card,
  ScrollArea,
  Button,
  Skeleton,
  Box,
} from "@mantine/core";
import Image from "next/image";
import { NoImage, ProductImage } from "@/images";
import classes from "@/styles/General.module.css";
import { formatStringAmount, gifts } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { DeleteEvent, GetEventDetails } from "@/services/api";
import { useState } from "react";
import { EventDetails, Guest } from "@/services/api/event/event.types";
import { useDisclosure } from "@mantine/hooks";
import { eventTabTypes } from "@/services/api/utils/utils.types";

interface EventDetailsModalProps {
  opened: boolean;
  close: () => void;
  refetch: () => void;
  setSuccessMessage: (message: string) => void;
  openSuccessModal: () => void;
  id: string;
}

const EventDetailsModal = ({
  opened,
  close,
  refetch,
  setSuccessMessage,
  openSuccessModal,
  id,
}: EventDetailsModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<eventTabTypes>("event");
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  const { data, isFetching } = useQuery({
    queryKey: ["event-details", id, activeTab],
    queryFn: () => GetEventDetails(id, activeTab),
    enabled: opened,
  });
  const eventData = activeTab === "event" ? (data?.data as EventDetails) : null;
  const guestsData = activeTab === "guests" ? (data?.data as Guest[]) : [];
  //const giftsData = activeTab === "gifts" ? (data?.data as Gift[]) : [];

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await DeleteEvent(id);
      setSuccessMessage("Event has been deleted successfully");
      refetch();
      close();
      openSuccessModal();
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomModal title="Event Details" size={527} opened={opened} close={close}>
      <Tabs
        defaultValue="event"
        value={activeTab}
        onChange={(value) => setActiveTab(value as eventTabTypes)}
        classNames={{
          list: classes.tabListFull,
        }}
      >
        {isFetching ? (
          <Flex align="center" justify="center" gap={20}>
            <Skeleton width={100} height={20} radius={"lg"} />
            <Skeleton width={100} height={20} radius={"lg"} />
            <Skeleton width={100} height={20} radius={"lg"} />
          </Flex>
        ) : (
          <Tabs.List justify="center">
            <Tabs.Tab value="event">Overview</Tabs.Tab>
            <Tabs.Tab value="guests">Guests</Tabs.Tab>
            <Tabs.Tab value="gifts">Gifts</Tabs.Tab>
          </Tabs.List>
        )}

        <Tabs.Panel value="event">
          {isFetching ? (
            <EventSkeleton />
          ) : (
            <>
              <Flex justify="space-between">
                <Text c="#D9D9D9B2" fz={14}>
                  Event ID:{" "}
                  <span className="text-white">#{eventData?.eventId}</span>
                </Text>

                <StatusBadge status={eventData?.status || ""} />
              </Flex>

              <Flex direction={{ base: "column", lg: "row" }} mt={20} gap={20}>
                <Box className="rounded-lg border-2 border-white w-full md:w-[41%] bg-white h-full md:h-[250px] overflow-hidden">
                  <Image
                    src={eventData?.eventImageUrl || NoImage}
                    width={400}
                    height={400}
                    alt="image"
                  />
                </Box>

                <Flex direction="column" gap={20}>
                  <Flex direction="column" gap={6}>
                    <Text c="#D9D9D9B2" fz={13}>
                      Event Name
                    </Text>
                    <Text fz={14} c="#fff">
                      {eventData?.name}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap={6}>
                    <Text c="#D9D9D9B2" fz={13}>
                      Owner
                    </Text>
                    <Text fz={14} c="#fff">
                      {eventData?.owner?.name}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap={6}>
                    <Text c="#D9D9D9B2" fz={13}>
                      Budget
                    </Text>
                    <Text fz={14} c="#fff">
                      ₦{formatStringAmount(eventData?.eventBudget || 0.0)}
                    </Text>
                  </Flex>
                  <Group>
                    <Flex direction="column" gap={6}>
                      <Text c="#D9D9D9B2" fz={13}>
                        Date
                      </Text>
                      <Text fz={13} c="#fff">
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
                    </Flex>
                    <Flex direction="column" gap={6}>
                      <Text c="#D9D9D9B2" fz={13}>
                        Time
                      </Text>
                      <Text fz={13} c="#fff">
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
                    </Flex>
                  </Group>
                </Flex>
              </Flex>
            </>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="guests">
          {isFetching ? (
            <EventSkeleton />
          ) : (
            <Card c="#fff" radius="md" p={6} bg="#2B2B2B">
              <ScrollArea.Autosize
                mah={250}
                p={10}
                scrollbarSize={7}
                offsetScrollbars
              >
                <Flex direction="column" gap={14}>
                  {guestsData && guestsData?.length > 0 ? (
                    <>
                      {guestsData?.map((guest, index) => (
                        <Flex key={index} justify="space-between" gap={10}>
                          <Text fz={14}>{guest?.name || "N/A"}</Text>
                          <Text fz={12} c="#B1B1B1">
                            {guest?.email || "N/A"}
                          </Text>
                        </Flex>
                      ))}
                    </>
                  ) : (
                    <EmptyState
                      title="No Guests for this event yet"
                      description=""
                      mt={0}
                    />
                  )}
                </Flex>
              </ScrollArea.Autosize>
            </Card>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="gifts">
          {isFetching ? (
            <EventSkeleton />
          ) : (
            <Card c="#fff" radius="md" p={6} bg="#2B2B2B">
              <ScrollArea.Autosize
                mah={250}
                p={10}
                pb={0}
                scrollbarSize={7}
                offsetScrollbars
              >
                <Flex direction="column" gap={20}>
                  {gifts.map((gift, index) => (
                    <Flex key={index} align="center" gap={10}>
                      <Image
                        src={ProductImage}
                        className="rounded-lg"
                        width={50}
                        height={50}
                        alt="img"
                      />
                      <Flex direction="column" justify="space-between" gap={4}>
                        <Text>{gift.name}</Text>
                        <Text fz={14} c="#D9D9D9B2">
                          {gift.quantity} x ₦{gift.price}
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </ScrollArea.Autosize>
            </Card>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Buttons */}
      {isFetching ? (
        <Flex gap={20} mt={30} w={"100%"} justify="center">
          <Skeleton w={"100%"} h={40} radius="xl" />
          <Skeleton w={"100%"} h={40} radius="xl" />
        </Flex>
      ) : (
        <Flex gap="sm" mt={30}>
          <Button
            radius="xl"
            className={classes.btnNeutral}
            onClick={close}
            fullWidth
          >
            Back
          </Button>
          <Button
            radius="xl"
            className={classes.btnDanger}
            onClick={openDeleteModal}
            fullWidth
          >
            Delete Event
          </Button>
        </Flex>
      )}

      <ConfirmationModal
        type="error"
        opened={deleteModalOpened}
        close={closeDeleteModal}
        title="Delete Event?"
        message="Do you really want to delete this event?"
        actions={
          <Flex justify="center" gap={14}>
            <Button
              radius="xl"
              className={classes.btnNeutral}
              onClick={closeDeleteModal}
              disabled={isLoading}
              miw="50%"
            >
              Cancel
            </Button>
            <Button
              radius="xl"
              className={classes.btnDanger}
              onClick={handleDelete}
              loading={isLoading}
              miw="50%"
            >
              Delete Event
            </Button>
          </Flex>
        }
      />
    </CustomModal>
  );
};

export default EventDetailsModal;

const EventSkeleton = () => {
  return (
    <Flex direction="column" gap={30}>
      <Flex gap={20}>
        <Skeleton w={100} h={12} radius="xl" />
        <Skeleton w={80} h={12} radius="xl" />
      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={20}>
        <Skeleton w={"100%"} h={180} radius="lg" />
        <Flex direction="column" w={"100%"} gap={28}>
          {[...Array(2)].map((_, rowIndex) => (
            <Flex direction="column" gap={10} key={rowIndex}>
              <Skeleton w={"40%"} h={12} radius="xl" />
              <Skeleton w={"100%"} h={20} radius="xl" />
            </Flex>
          ))}
          <Flex gap={20}>
            {[...Array(3)].map((_, rowIndex) => (
              <Flex direction="column" w={"100%"} gap={10} key={rowIndex}>
                <Skeleton w={"40%"} h={12} radius="xl" />
                <Skeleton w={"100%"} h={16} radius="xl" />
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
