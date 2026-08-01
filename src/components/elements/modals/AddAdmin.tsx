"use client";

import { Button, Flex, NumberInput, Select, TextInput } from "@mantine/core";
import CustomModal from "./CustomModal";
import Image from "next/image";
import { IconCaretDown } from "@/icons";
import classes from "@/styles/General.module.css";
import { useForm } from "@mantine/form";
import { createAdmin } from "@/utils";
import { yupResolver } from "mantine-form-yup-resolver";
import { useState } from "react";
import { CreateAdmin } from "@/services/api";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";

interface AddAdminProps {
  opened: boolean;
  close: () => void;
  refetch: () => void;
  triggerConfirmation: () => void;
  setConfirmationMessage: (message: string) => void;
  setConfirmationType: (type: ConfirmationModalTypes) => void;
}

const AddAdmin = ({
  opened,
  close,
  refetch,
  triggerConfirmation,
  setConfirmationMessage,
  setConfirmationType,
}: AddAdminProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      adminRole: "",
      phoneNumber: "",
      email: "",
    },
    validate: yupResolver(createAdmin),
    validateInputOnChange: ["email"],
    transformValues: (values) => ({
      ...values,
      phoneNumber: values.phoneNumber.toString(),
      adminRole: values.adminRole.toLowerCase(),
    }),
  });

  const handleAddAdmin = async (values: any) => {
    setIsSubmitting(true);
    console.log("payload", values);

    try {
      const res = await CreateAdmin(values);
      console.log("API response", res);

      setConfirmationMessage(
        "Admin has been created successfully. Registration details have been sent to their email address."
      );
      setConfirmationType("success");
      triggerConfirmation();
      refetch();
      close();
    } catch (error: any) {
      console.log(error);
      setConfirmationMessage(
        error.response.data.message ||
          "Failed to create admin. Please try again."
      );
      setConfirmationType("error");
      triggerConfirmation();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal opened={opened} close={close} title="Add an Admin">
      <form onSubmit={form.onSubmit(handleAddAdmin)}>
        <Flex direction="column" gap={10} mt={20}>
          <TextInput
            label="First Name"
            placeholder="e.g John & sons"
            {...form.getInputProps("firstName")}
          />
          <TextInput
            label="Last Name"
            placeholder="e.g John & sons"
            {...form.getInputProps("lastName")}
          />
          <Select
            label="Admin Role"
            placeholder="Tap to select"
            rightSection={
              <Image src={IconCaretDown} width={20} height={20} alt="icon" />
            }
            data={["Super", "Support", "Finance"]}
            {...form.getInputProps("adminRole")}
          />
          <NumberInput
            label="Phone Number"
            allowNegative={false}
            {...form.getInputProps("phoneNumber")}
            hideControls
          />
          <TextInput
            type="email"
            label="E-mail Address"
            placeholder="e.g. johndoe@email.com"
            {...form.getInputProps("email")}
          />

          {/* Button */}
          <Button
            type="submit"
            radius="xl"
            className={classes.btnWhite}
            disabled={!form.isValid() || isSubmitting}
            loading={isSubmitting}
            mt={20}
            fw={500}
            fullWidth
          >
            Create Admin
          </Button>
        </Flex>
      </form>
    </CustomModal>
  );
};

export default AddAdmin;
