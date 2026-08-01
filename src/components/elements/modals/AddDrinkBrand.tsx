"use client";

import { BackgroundImage, Button, Flex, Text, TextInput } from "@mantine/core";
import CustomModal from "./CustomModal";
import { CustomDropzone } from "@/components/blocks";
import classes from "@/styles/General.module.css";
import { useState } from "react";
import { ProductImage } from "@/images";
import { useForm } from "@mantine/form";
import ConfirmationModal from "./ConfirmationModal";

interface AddDrinkBrandProps {
  opened: boolean;
  close: () => void;
  triggerConfirmation: () => void;
  setSuccessMessage: (message: string) => void;
}

interface FormValues {
  brandName: string;
}

const AddDrinkBrand = ({
  opened,
  close,
  triggerConfirmation,
  setSuccessMessage,
}: AddDrinkBrandProps) => {
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const form = useForm<FormValues>({
    initialValues: {
      brandName: "",
    },
  });

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

  const handleAddDrinkBrand = () => {
    close();
    resetForm();
    setSuccessMessage("Drink brand has been added successfully");
    triggerConfirmation();
  };

  return (
    <CustomModal
      opened={opened}
      close={handleClose}
      title={step === 1 ? "Add a Drink Brand" : "Preview"}
    >
      {/* Form */}
      {step === 1 ? (
        <>
          <Flex direction="column" gap={10} mt={20}>
            <TextInput
              label="Brand Name"
              placeholder="e.g Odogwu Bitters"
              {...form.getInputProps("brandName")}
            />

            <CustomDropzone
              title="brand"
              onFileUpload={(file) => setPreviewImage(file)}
            />

            <Flex gap={10} mt={20}>
              <Button
                onClick={handleClose}
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
        </>
      ) : (
        <Flex direction="column" gap={30} mt={20}>
          <BackgroundImage
            src={
              previewImage
                ? URL.createObjectURL(previewImage)
                : ProductImage.src
            }
            radius="lg"
            p={10}
            h={140}
          >
            <Flex justify="space-between" gap={10}>
              <Flex direction="column">
                <Text fw={700}>{form.values.brandName}</Text>
                <Text c="#E0E0E0">3 items</Text>
              </Flex>
            </Flex>
          </BackgroundImage>

          <Flex gap={10}>
            <Button
              onClick={handleBack}
              radius="xl"
              className={classes.btnNeutral}
              fullWidth
            >
              Go Back
            </Button>
            <Button
              onClick={handleAddDrinkBrand}
              radius="xl"
              className={classes.btnWhite}
              fullWidth
            >
              Add Brand
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

export default AddDrinkBrand;
