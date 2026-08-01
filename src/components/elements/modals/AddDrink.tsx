"use client";

import CustomModal from "./CustomModal";
import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Group,
  NumberInput,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import Image from "next/image";
import classes from "@/styles/General.module.css";
import StatusBadge from "../status-badge";
import { IconCaretDown } from "@/icons";
import {
  CharacterCounterTextarea,
  ConfirmationModal,
  CustomDropzone,
  CustomStepper,
} from "@/components";
import { ProductImage } from "@/images";
import { useForm } from "@mantine/form";

interface AddDrinkProps {
  opened: boolean;
  close: () => void;
  triggerConfirmation: () => void;
  setSuccessMessage: (message: string) => void;
}

interface DrinkFormValues {
  drinkName: string;
  drinkBrand: string;
  price: number | string;
  stock: number | string;
  description: string;
}

const AddDrink = ({
  opened,
  close,
  triggerConfirmation,
  setSuccessMessage,
}: AddDrinkProps) => {
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<DrinkFormValues>({
    initialValues: {
      drinkName: "",
      drinkBrand: "",
      price: "",
      stock: "",
      description: "",
    },
  });

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const resetForm = () => {
    form.reset();
    setPreviewImage(null);
    setStep(1);
  };

  const handleClose = () => {
    if (form.isDirty() || previewImage !== null) {
      setShowConfirmClose(true);
    } else {
      close();
    }
  };

  const handleCancel = () => {
    setShowConfirmClose(false);
    close();
    resetForm();
  };

  const handleAddDrink = () => {
    close();
    resetForm();
    triggerConfirmation();
    setSuccessMessage("Drink successfully added!");
  };
  return (
    <CustomModal
      opened={opened}
      close={handleClose}
      title={step === 3 ? "Preview" : "Add a Drink"}
      stepper={
        step !== 3 && <CustomStepper step={step} totalSteps={totalSteps - 1} />
      }
    >
      {/* Form & Preview */}
      {step === 1 && (
        <Flex direction="column" gap={10}>
          <TextInput
            label="Drink Name"
            placeholder="e.g land"
            {...form.getInputProps("drinkName")}
          />

          <Select
            label="Drink Brand"
            placeholder="Tap to select"
            rightSection={
              <Image src={IconCaretDown} width={20} height={20} alt="icon" />
            }
            data={["Coca Cola", "Moet"]}
            {...form.getInputProps("drinkBrand")}
          />

          <NumberInput
            label="Price"
            leftSection={<>₦</>}
            allowNegative={false}
            thousandSeparator=","
            hideControls
            {...form.getInputProps("price")}
          />

          <NumberInput
            label="Amount in Stock"
            allowNegative={false}
            {...form.getInputProps("stock")}
          />

          <CharacterCounterTextarea
            label="Description"
            placeholder="Briefly describe the product"
            {...form.getInputProps("description")}
          />

          {/* Buttons */}
          <Flex gap="sm" mt={20}>
            <Button
              radius="xl"
              onClick={handleClose}
              className={classes.btnNeutral}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              radius="xl"
              className={classes.btnWhite}
              onClick={handleNext}
              fullWidth
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}

      {step === 2 && (
        <Flex direction="column" gap={30}>
          <CustomDropzone
            title=" drink "
            onFileUpload={(file) => setPreviewImage(file)}
          />

          {/* Buttons */}
          <Flex gap={10}>
            <Button
              onClick={handleBack}
              radius="xl"
              className={classes.btnNeutral}
              fullWidth
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              radius="xl"
              className={classes.btnWhite}
              fullWidth
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}

      {step === 3 && (
        <Flex direction="column" gap={30}>
          <Flex gap={20}>
            <Text c="#D9D9D9B2">
              Drink ID: <span className="text-white">#CM9801</span>
            </Text>
            <StatusBadge status="Available" />
          </Flex>

          {/* Gift Details */}
          <Flex direction={{ base: "column", md: "row" }} gap={20}>
            <Box className="relative w-[45%] h-[120px] md:h-[200px] border-4 border-[#363636] rounded-3xl bg-white overflow-hidden">
              <Image
                src={
                  previewImage
                    ? URL.createObjectURL(previewImage)
                    : ProductImage
                }
                alt="image"
                fill
              />
            </Box>
            <Flex direction="column" gap={20}>
              <Flex direction="column" gap={4}>
                <Text fz={14} c="#D9D9D9B2">
                  Drink Name
                </Text>
                <Text c="white">{form.values.drinkName || "Drink name"}</Text>
              </Flex>
              <Flex direction="column" gap={4}>
                <Text fz={14} c="#D9D9D9B2">
                  Price
                </Text>
                <Text c="white">
                  ₦{Number(form.values.price).toLocaleString()}.00
                </Text>
              </Flex>
              <Group gap={20}>
                <Flex direction="column" gap={4}>
                  <Text fz={14} c="#D9D9D9B2">
                    In stock
                  </Text>
                  <Text c="white">{form.values.stock || 0}</Text>
                </Flex>
                <Flex direction="column" gap={4}>
                  <Text fz={14} c="#D9D9D9B2">
                    Processed
                  </Text>
                  <Text c="white">0</Text>
                </Flex>
                <Flex direction="column" gap={4}>
                  <Text fz={14} c="#D9D9D9B2">
                    Total
                  </Text>
                  <Text c="white">{form.values.stock || 0}</Text>
                </Flex>
              </Group>
            </Flex>
          </Flex>

          {/* Description */}
          <Flex direction="column" gap={4}>
            <Text fz={14} c="#D9D9D9B2">
              Description
            </Text>
            <Text c="white">{form.values.description}</Text>
          </Flex>

          {/* Buttons */}
          <Flex gap="sm">
            <Button
              radius="xl"
              onClick={handleBack}
              className={classes.btnNeutral}
              fullWidth
            >
              Go Back
            </Button>
            <Button
              radius="xl"
              onClick={handleAddDrink}
              className={classes.btnWhite}
              fullWidth
            >
              Add Drink
            </Button>
          </Flex>
        </Flex>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        type="warning"
        opened={showConfirmClose}
        close={() => setShowConfirmClose(false)}
        title="Cancel"
        message="Are you sure you want to cancel?  Your changes won't be saved"
        actions={
          <Flex justify="center" gap={14}>
            <Button
              radius="xl"
              miw="50%"
              className={classes.btnNeutral}
              onClick={() => setShowConfirmClose(false)}
            >
              Keep Editing
            </Button>
            <Button
              radius="xl"
              miw="50%"
              className={classes.btnWhite}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Flex>
        }
      />
    </CustomModal>
  );
};

export default AddDrink;
