import { Button, NumberInput, Flex, TextInput } from "@mantine/core";
import { useState } from "react";
import CustomModal from "./CustomModal";
import classes from "@/styles/General.module.css";
import {
  CharacterCounterTextarea,
  ConfirmationModal,
  CustomDropzone,
  CustomStepper,
} from "@/components";
import { useForm, yupResolver } from "@mantine/form";
import { addGiftSchema } from "@/utils";
import { AddProduct } from "@/services/api";

interface AddGiftProps {
  opened: boolean;
  close: () => void;
  refetch: () => void;
  triggerConfirmation: () => void;
  setConfirmationType: (type: "success" | "error") => void;
  setConfirmationMessage: (message: string) => void;
}

const AddGift = ({
  opened,
  close,
  refetch,
  triggerConfirmation,
  setConfirmationType,
  setConfirmationMessage,
}: AddGiftProps) => {
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      amount: "",
      images: "",
      quantity: "",
      productType: "gift",
    },
    validate: yupResolver(addGiftSchema),
    transformValues: (values) => ({
      ...values,
    }),
  });

  const handleNext = () => {
    const validation = form.validate();

    if (!validation.hasErrors) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFileUpload = (file: File) => {
    setProductImage(file);
  };

  const resetForm = () => {
    form.reset();
    setStep(1);
    setProductImage(null);
  };

  const handleClose = () => {
    if (form.isDirty()) {
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

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("amount", values.amount.toString());
      formData.append("quantity", values.quantity.toString());
      formData.append("productType", values.productType);
      if (productImage) {
        formData.append("images", productImage);
      }

      const res = await AddProduct(formData);
      console.log(res);

      triggerConfirmation();
      setConfirmationType("success");
      setConfirmationMessage("Gift successfully added!");
    } catch (error: any) {
      triggerConfirmation();
      setConfirmationType("error");
      setConfirmationMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again"
      );
    } finally {
      refetch();
      setIsSubmitting(false);
      close();
      resetForm();
    }
  };

  return (
    <CustomModal
      opened={opened}
      close={handleClose}
      title="Add a Gift"
      stepper={<CustomStepper step={step} totalSteps={totalSteps} />}
    >
      {/* Form */}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {step === 1 ? (
          <>
            <Flex direction="column" gap={10}>
              <TextInput
                label="Product Name"
                placeholder="e.g land"
                {...form.getInputProps("name")}
              />
              <NumberInput
                label="Price"
                leftSection={<>₦</>}
                allowNegative={false}
                thousandSeparator=","
                hideControls
                {...form.getInputProps("amount")}
              />
              <NumberInput
                label="Amount in Stock"
                allowNegative={false}
                {...form.getInputProps("quantity")}
              />
              <CharacterCounterTextarea
                label="Description"
                placeholder="Briefly describe the product"
                {...form.getInputProps("description")}
              />

              <Button
                radius="xl"
                className={classes.btnWhite}
                mt={20}
                onClick={handleNext}
                fullWidth
              >
                Proceed
              </Button>
            </Flex>
          </>
        ) : (
          <Flex direction="column" gap={30}>
            <CustomDropzone title="gift" onFileUpload={handleFileUpload} />

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
                type="submit"
                radius="xl"
                className={classes.btnWhite}
                loading={isSubmitting}
                disabled={isSubmitting}
                fullWidth
              >
                Add gift
              </Button>
            </Flex>
          </Flex>
        )}
      </form>

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

export default AddGift;
