"use client";

import {
  Button,
  Drawer,
  Flex,
  Menu,
  NumberInput,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import { addTeamMemberSchema } from "@/utils";
import { IconCaretDown, IconCheck2 } from "@/icons";
import Image from "next/image";
import StatusBadge from "../status-badge";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateAdmin, GetRoles } from "@/services/api/admin";
import { notifications } from "@mantine/notifications";

interface AddTeamMemberModalProps {
  opened: boolean;
  onClose: () => void;
}

const AddTeamMemberModal = ({ opened, onClose }: AddTeamMemberModalProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles dynamically
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: GetRoles,
  });

  const roles = useMemo(() => {
    return (rolesData?.data || []).map((r) => ({
      label: r.name,
      value: r.name.toLowerCase().replace(/\s+/g, ""),
    }));
  }, [rolesData]);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phoneNumber: "",
      role: "",
    },
    validate: yupResolver(addTeamMemberSchema),
    validateInputOnChange: ["email"],
    transformValues: (values) => ({
      ...values,
      phoneNumber: values.phoneNumber.toString(),
    }),
  });

  const selectedRole = roles.find((role) => role.value === form.values.role);

  const createAdminMutation = useMutation({
    mutationFn: (values: any) => {
      const nameParts = values.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      return CreateAdmin({
        firstName,
        lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        adminRole: values.role,
      });
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Team member invited successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["team-admins"] });
      handleClose();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to invite team member",
        color: "red",
      });
    },
  });

  const handleSubmit = async (values: any) => {
    createAdminMutation.mutate(values);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Drawer
      title="Add New Member"
      size="md"
      opened={opened}
      onClose={handleClose}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Flex mih="100vh" direction="column" justify="space-between">
          <ScrollArea.Autosize mah="100%" scrollbarSize={0}>
            <Flex direction="column" gap={14}>
              <TextInput
                label="Team member's full name"
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Email Address"
                {...form.getInputProps("email")}
              />
              <NumberInput
                label="Phone Number"
                allowNegative={false}
                hideControls
                {...form.getInputProps("phoneNumber")}
              />

              <Menu
                position="bottom-end"
                width={240}
                classNames={{
                  dropdown: classes.menuDropdownAlt,
                  item: classes.menuItemAlt,
                }}
              >
                <Menu.Target>
                  <Flex direction="column" gap={6}>
                    <Text fz={14} fw={500} c="#969696">
                      Role
                    </Text>

                    <Flex
                      className={`${inputClasses.textInput} cursor-pointer`}
                      px="sm"
                      align="center"
                      justify="space-between"
                    >
                      {selectedRole ? (
                        <StatusBadge
                          status={selectedRole.label}
                          variant="light"
                          px={10}
                          isTransparent={false}
                        />
                      ) : (
                        <Text fz={14} c="#c4c4c4">
                          Click here to select
                        </Text>
                      )}

                      <Image src={IconCaretDown} alt="icon" />
                    </Flex>
                  </Flex>
                </Menu.Target>

                <Menu.Dropdown>
                  {roles.map((role) => {
                    const isSelected = form.values.role === role.value;

                    return (
                      <Menu.Item
                        key={role.value}
                        onClick={() => form.setFieldValue("role", role.value)}
                        rightSection={
                          isSelected ? (
                            <Image src={IconCheck2} alt="icon" />
                          ) : null
                        }
                      >
                        <StatusBadge
                          status={role.label}
                          variant="light"
                          px={10}
                          isTransparent={false}
                        />
                      </Menu.Item>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            </Flex>
          </ScrollArea.Autosize>

          <Flex py="md" bg="#000" pos="sticky" bottom={0} left={0} w="100%">
            <Button
              type="submit"
              size="sm"
              radius="xl"
              w="100%"
              className={classes.btnWhite}
              styles={{ root: { minWidth: "auto" } }}
              disabled={createAdminMutation.isPending || !form.isValid()}
              loading={createAdminMutation.isPending}
            >
              Send Invite
            </Button>
          </Flex>
        </Flex>
      </form>
    </Drawer>
  );
};

export default AddTeamMemberModal;
