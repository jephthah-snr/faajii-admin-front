"use client";

import { Store } from "@/services/api/event/event.types";
import { Button, Flex, Modal, NumberInput, Text } from "@mantine/core";
import { UpdatePartyStoreItem } from "@/services/api";
import { useEffect, useState } from "react";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import { useForm } from "@mantine/form";
import ConfirmationModal from "./ConfirmationModal";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SummaryItem from "../summary-item";

interface UpdateInventoryModalProps {
  item: Store | null;
  opened: boolean;
  close: () => void;
}

/**
 * Lets an admin correct the stock left on a Faajii Store item. Only the
 * remaining quantity is editable — purchased units are owned by orders, and the
 * total is derived from the two by the backend.
 */
const UpdateInventoryModal = ({
  item,
  opened,
  close,
}: UpdateInventoryModalProps) => {
  const queryClient = useQueryClient();
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationType, setConfirmationType] =
    useState<ConfirmationModalTypes>("success");
  const [
    openedConfirmation,
    { open: openConfirmation, close: closeConfirmation },
  ] = useDisclosure(false);

  const form = useForm({
    initialValues: { quantityAvailable: 0 as number | string },
    validate: {
      quantityAvailable: (value) => {
        if (value === "" || value === null || value === undefined)
          return "Enter the quantity available";
        if (!Number.isInteger(Number(value))) return "Must be a whole number";
        if (Number(value) < 0) return "Cannot be negative";
        return null;
      },
    },
    validateInputOnChange: true,
  });

  useEffect(() => {
    if (opened && item) {
      form.setValues({ quantityAvailable: item.quantityAvailable ?? 0 });
      form.resetDirty({ quantityAvailable: item.quantityAvailable ?? 0 });
    }
  }, [opened, item]);

  const updateMutation = useMutation({
    mutationFn: (quantityAvailable: number) =>
      UpdatePartyStoreItem(String(item?.id), { quantityAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-party-store"] });
      queryClient.invalidateQueries({
        queryKey: ["store-details", String(item?.id)],
      });
      setConfirmationMessage("Inventory has been updated.");
      setConfirmationType("success");
      openConfirmation();
      handleClose();
    },
    onError: (error: any) => {
      setConfirmationMessage(
        error?.response?.data?.message ||
          "Failed to update inventory. Please try again.",
      );
      setConfirmationType("error");
      openConfirmation();
    },
  });

  const handleSubmit = (values: { quantityAvailable: number | string }) => {
    updateMutation.mutate(Number(values.quantityAvailable));
  };

  const handleClose = () => {
    close();
    form.reset();
  };

  const purchased = Number(
    item?.itemsPurchased ?? item?.quantityPurchased ?? 0,
  );
  const newTotal = purchased + (Number(form.values.quantityAvailable) || 0);

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        transitionProps={{ transition: "fade-up" }}
        centered
        withCloseButton={false}
        styles={{
          content: {
            backgroundColor: "#000",
            borderRadius: "24px",
          },
          header: {
            backgroundColor: "#000",
          },
          title: {
            textAlign: "left",
          },
        }}
        overlayProps={{
          bg: "#191919CC",
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        title={
          <Flex justify="space-between" px="sm">
            <Flex direction="column" align="flex-start">
              <Text fz={18} fw={700}>
                Update Inventory
              </Text>
              <Text c="#D9D9D9B2" fz={13} truncate="end" maw={320}>
                {item?.name || `Item #${item?.id ?? ""}`}
              </Text>
            </Flex>

            <Modal.CloseButton className={classes.rightDrawerClose} />
          </Flex>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Flex direction="column" gap={20} p="sm">
            {/* Current stock */}
            <Flex align="center" justify="space-between" gap={10}>
              <SummaryItem label="Purchased" value={purchased} fz={16} />
              <SummaryItem
                label="Available"
                value={item?.quantityAvailable ?? item?.itemsLeft ?? 0}
                fz={16}
              />
              <SummaryItem
                label="Total"
                value={item?.totalQuantity ?? 0}
                fz={16}
              />
            </Flex>

            {/* Quantity */}
            <NumberInput
              label="Quantity available"
              description={`Units still on sale. New total will be ${newTotal.toLocaleString()}.`}
              placeholder="0"
              min={0}
              step={1}
              allowNegative={false}
              allowDecimal={false}
              classNames={{
                input: inputClasses.dashedBorderInput,
                control: inputClasses.numberInputControl,
              }}
              {...form.getInputProps("quantityAvailable")}
            />

            {/* Buttons */}
            <Flex align="center" gap={10}>
              <Button
                h={50}
                radius="xl"
                color="#363636"
                fz={{ base: 15, md: 16 }}
                w={{ base: "45%", md: "40%" }}
                styles={{ root: { minWidth: "auto", padding: "0 18px" } }}
                onClick={handleClose}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                h={50}
                radius="xl"
                color="#5769E9"
                fz={{ base: 15, md: 16 }}
                fullWidth
                loading={updateMutation.isPending}
                disabled={
                  updateMutation.isPending || !form.isValid() || !form.isDirty()
                }
                styles={{ root: { minWidth: "auto" } }}
              >
                Update Inventory
              </Button>
            </Flex>
          </Flex>
        </form>
      </Modal>

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

export default UpdateInventoryModal;
