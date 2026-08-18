"use client";

import {
  Accordion,
  ActionIcon,
  BackgroundImage,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Drawer,
  Flex,
  NumberInput,
  Skeleton,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { yupResolver } from "mantine-form-yup-resolver";
import React, { useState } from "react";
import classes from "@/styles/General.module.css";
import ConfirmationModal from "./ConfirmationModal";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";
import { createGuest, formatStringAmount } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NoImageS } from "@/images";
import { AddEventGuest, GetEventDetails } from "@/services/api";
import { Store } from "@/services/api/event/event.types";

interface AddGuestModalProps {
  opened: boolean;
  close: () => void;
  eventId: string;
}

interface ISelectedTicket {
  ticketId: number;
  quantity: number;
}

const AddGuestModal = ({ opened, close, eventId }: AddGuestModalProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationType, setConfirmationType] =
    useState<ConfirmationModalTypes>("success");
  const [selectedTickets, setSelectedTickets] = useState<ISelectedTicket[]>([]);

  const [ticketCounts, setTicketCounts] = useState<Record<number, number>>({});
  const [
    openedConfirmation,
    { open: openConfirmation, close: closeConfirmation },
  ] = useDisclosure(false);

  const { data, isFetching } = useQuery({
    queryKey: ["event-details", eventId],
    queryFn: () => {
      return GetEventDetails(eventId, "partystore", undefined, undefined);
    },
    enabled: !!eventId,
  });

  const ticketItems = (data?.data as Store[]) || [];

  const form = useForm<{
    guestName: string;
    email: string;
    phoneNumber: string | number;
    tickets: ISelectedTicket[];
    generateMultipleRsvpCodes: boolean;
  }>({
    initialValues: {
      guestName: "",
      email: "",
      phoneNumber: "",
      tickets: [],
      generateMultipleRsvpCodes: false,
    },
    validate: yupResolver(createGuest),
    validateInputOnChange: ["email"],
    transformValues: (values) => ({
      ...values,
      phoneNumber: values.phoneNumber.toString(),
      tickets: values.tickets,
      generateMultipleRsvpCodes: values.generateMultipleRsvpCodes,
    }),
  });

  const getCount = (id: number) => ticketCounts[id] || 0;

  const increment = (id: number) => {
    setTicketCounts((prev) => {
      const newCount = (prev[id] || 0) + 1;
      const updatedCounts = { ...prev, [id]: newCount };

      setSelectedTickets((sel) => {
        const exists = sel.find((t) => t.ticketId === id);

        if (exists) {
          const updated = sel.map((t) =>
            t.ticketId === id ? { ...t, quantity: newCount } : t,
          );
          form.setFieldValue("tickets", updated);
          return updated;
        }

        const updated = [...sel, { ticketId: id, quantity: newCount }];
        form.setFieldValue("tickets", updated);
        return updated;
      });

      return updatedCounts;
    });
  };

  const decrement = (id: number) => {
    setTicketCounts((prev) => {
      const current = prev[id] || 0;
      const newCount = Math.max(current - 1, 0);
      const updatedCounts = { ...prev, [id]: newCount };

      setSelectedTickets((sel) => {
        const exists = sel.find((t) => t?.ticketId === id);
        if (!exists) return sel;

        if (newCount === 0) {
          const updated = sel.filter((t) => t?.ticketId !== id);
          form.setFieldValue("tickets", updated);
          return updated;
        }

        const updated = sel.map((t) =>
          t?.ticketId === id ? { ...t, quantity: newCount } : t,
        );

        form.setFieldValue("tickets", updated);
        return updated;
      });

      return updatedCounts;
    });
  };

  const setCount = (id: number, value: number) => {
    const safeValue = Math.max(0, Math.floor(value));

    setTicketCounts((prev) => {
      const updatedCounts = { ...prev, [id]: safeValue };

      setSelectedTickets((sel) => {
        const exists = sel.find((t) => t.ticketId === id);

        if (safeValue === 0) {
          const updated = sel.filter((t) => t.ticketId !== id);
          form.setFieldValue("tickets", updated);
          return updated;
        }

        if (exists) {
          const updated = sel.map((t) =>
            t.ticketId === id ? { ...t, quantity: safeValue } : t,
          );
          form.setFieldValue("tickets", updated);
          return updated;
        }

        const updated = [...sel, { ticketId: id, quantity: safeValue }];
        form.setFieldValue("tickets", updated);
        return updated;
      });

      return updatedCounts;
    });
  };

  const toggleSelect = (id: number) => {
    const count = getCount(id);

    setSelectedTickets((sel) => {
      const exists = sel.find((t) => t?.ticketId === id);

      if (exists) {
        const updated = sel.filter((t) => t?.ticketId !== id);
        form.setFieldValue("tickets", updated);

        // Reset count to 0
        setTicketCounts((prev) => ({ ...prev, [id]: 0 }));

        return updated;
      }

      const finalCount = count === 0 ? 1 : count;

      setTicketCounts((prev) => ({ ...prev, [id]: finalCount }));

      const updated = [...sel, { ticketId: id, quantity: finalCount }];
      form.setFieldValue("tickets", updated);
      return updated;
    });
  };

  const handleAddGuest = async (values: any) => {
    setIsSubmitting(true);

    try {
      await AddEventGuest(values);

      setConfirmationMessage("Guest has been added.");
      setConfirmationType("success");
      openConfirmation();

      resetTicketState();
      form.reset();
      form.setFieldValue("generateMultipleRsvpCodes", false);

      queryClient.invalidateQueries({
        queryKey: ["event-details"],
      });
    } catch (error: any) {
      console.log(error);
      setConfirmationMessage(
        error.response.data.message || "Failed to add guest. Please try again.",
      );
      setConfirmationType("error");
      openConfirmation();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    close();
    form.reset();
    resetTicketState();
  };

  const resetTicketState = () => {
    setTicketCounts({});
    setSelectedTickets([]);
    form.setFieldValue("tickets", []);
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={handleClose}
        size="md"
        title="Add New Guest"
      >
        <form onSubmit={form.onSubmit(handleAddGuest)}>
          <Flex direction="column" gap={20} mt={20}>
            <Flex direction="column" gap={14}>
              <TextInput
                label="Guest Name"
                {...form.getInputProps("guestName")}
              />
              <TextInput
                type="email"
                label="Email Address"
                {...form.getInputProps("email")}
              />
              <NumberInput
                label="Phone Number"
                allowNegative={false}
                {...form.getInputProps("phoneNumber")}
                hideControls
              />
            </Flex>

            <Accordion
              classNames={{
                control: classes.accordionControl,
                item: classes.accordionItem,
                content: classes.accordionContent,
              }}
            >
              <Accordion.Item value="Assign Ticket to this Guest">
                <Accordion.Control>
                  Assign Ticket to this Guest
                </Accordion.Control>
                <Accordion.Panel>
                  <Card
                    bg="var(--fj-surface-elevated)"
                    className="border border-[#1E1E1E]"
                    radius={8}
                  >
                    <Flex direction="column">
                      {/* Items */}
                      {isFetching ? (
                        <>
                          <Flex direction="column" gap={14}>
                            {[...Array(2)].map((_, rowIndex) => (
                              <Skeleton
                                key={rowIndex}
                                height={60}
                                radius="lg"
                              />
                            ))}
                          </Flex>
                        </>
                      ) : (
                        ticketItems?.map((item, index) => {
                          const count = getCount(item?.id);
                          const isSelected = selectedTickets.some(
                            (t) => t?.ticketId === item?.id,
                          );
                          const isSoldOut = item?.itemsLeft < 1;

                          const buttonColor = isSoldOut
                            ? "#C22B2B"
                            : isSelected
                              ? "#10B982"
                              : "#000000";

                          const buttonLabel = isSoldOut
                            ? "Sold Out"
                            : isSelected
                              ? "Selected"
                              : "Select";

                          const handleSelectClick = () => {
                            if (!isSoldOut) toggleSelect(item.id);
                          };

                          return (
                            <React.Fragment key={index}>
                              <Flex
                                align="center"
                                justify="space-between"
                                wrap="wrap"
                                gap={10}
                                opacity={isSoldOut ? 0.4 : 1}
                              >
                                {/* Ticket */}
                                <Flex align="center" gap={10}>
                                  <BackgroundImage
                                    w={40}
                                    h={40}
                                    src={item?.images?.[0] || NoImageS.src}
                                    radius={4}
                                  />

                                  <Flex direction="column">
                                    <Text fz={13} c="#F8F8F8E5">
                                      {item?.name}
                                    </Text>
                                    <Text fz={13} c="#D9D9D9B2">
                                      ₦ {formatStringAmount(item?.price)}
                                    </Text>
                                  </Flex>
                                </Flex>

                                <Flex align="center" gap={20}>
                                  {/* Counter */}
                                  <Flex align="center" gap="10">
                                    <ActionIcon
                                      w={32}
                                      h={32}
                                      color="#262626"
                                      radius={50}
                                      onClick={() =>
                                        !isSoldOut && decrement(item.id)
                                      }
                                      disabled={isSoldOut}
                                    >
                                      -
                                    </ActionIcon>
                                    <NumberInput
                                      value={count}
                                      onChange={(value) =>
                                        !isSoldOut &&
                                        setCount(item.id, Number(value) || 0)
                                      }
                                      hideControls
                                      min={0}
                                      max={item.itemsLeft}
                                      w={40}
                                      styles={{
                                        input: {
                                          background: "transparent",
                                          border: "none",
                                          color: "#fff",
                                          fontSize: "20px",
                                          fontWeight: 700,
                                          textAlign: "center",
                                          padding: 0,
                                        },
                                      }}
                                      disabled={isSoldOut}
                                    />

                                    <ActionIcon
                                      w={32}
                                      h={32}
                                      color="#262626"
                                      radius={50}
                                      onClick={() =>
                                        !isSoldOut && increment(item.id)
                                      }
                                      disabled={isSoldOut}
                                    >
                                      +
                                    </ActionIcon>
                                  </Flex>

                                  {/* Button */}
                                  <Button
                                    color={buttonColor}
                                    size="compact-md"
                                    tt="uppercase"
                                    fz={12}
                                    styles={{ root: { minWidth: "auto" } }}
                                    style={{ border: "1px solid #242529" }}
                                    onClick={handleSelectClick}
                                    disabled={isSoldOut}
                                  >
                                    {buttonLabel}
                                  </Button>
                                </Flex>
                              </Flex>

                              {index !== ticketItems?.length - 1 && (
                                <Divider color="#1F1F1F" my={20} />
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </Flex>
                  </Card>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>

            <Checkbox
              color="#5769e9"
              label="Send as Multiple RSVP Codes (based on the quantity selected)"
              {...form.getInputProps("generateMultipleRsvpCodes")}
            />

            {/* Button */}
            <Box pos="sticky" bottom={0} w="100%" py={10} bg="var(--fj-bg)">
              <Button
                type="submit"
                radius="xl"
                className={classes.btnWhite}
                disabled={!form.isValid() || isSubmitting}
                loading={isSubmitting}
                fw={500}
                fullWidth
              >
                Add Guest
              </Button>
            </Box>
          </Flex>
        </form>
      </Drawer>

      <ConfirmationModal
        title={confirmationType === "success" ? "Successful" : "Error"}
        opened={openedConfirmation}
        close={closeConfirmation}
        message={confirmationMessage}
        type={confirmationType}
      />
    </>
  );
};

export default AddGuestModal;
