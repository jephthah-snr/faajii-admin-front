"use client";

import {
  Accordion,
  Button,
  Drawer,
  Flex,
  Loader,
  Popover,
  ScrollArea,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import { createRoleSchema } from "@/utils";
import { IconCaretDown, IconCheck2, IconUpgrade } from "@/icons";
import Image from "next/image";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateRole, GetPermissions } from "@/services/api/admin";
import { notifications } from "@mantine/notifications";

interface CreateRoleModalProps {
  opened: boolean;
  onClose: () => void;
}

type FormValues = yup.InferType<typeof createRoleSchema>;

const CreateRoleModal = ({ opened, onClose }: CreateRoleModalProps) => {
  const queryClient = useQueryClient();

  // Fetch permissions grouped by category
  const { data: permissionsData, isFetching: isFetchingPermissions } = useQuery(
    {
      queryKey: ["permissions"],
      queryFn: GetPermissions,
    },
  );

  const permissionGroups = useMemo(
    () => permissionsData?.data || [],
    [permissionsData],
  );

  const form = useForm<FormValues>({
    initialValues: {
      name: "",
      description: "",
      permissions: [],
    },
    validate: yupResolver(createRoleSchema),
    transformValues: (values) => ({
      ...values,
    }),
  });

  const createRoleMutation = useMutation({
    mutationFn: (values: FormValues) =>
      CreateRole({
        name: values.name,
        description: values.description || undefined,
        permissions: values.permissions as string[],
      }),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Role created successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      handleClose();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to create role",
        color: "red",
      });
    },
  });

  const handleSubmit = async (values: FormValues) => {
    createRoleMutation.mutate(values);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const togglePermission = (permissionKey: string) => {
    const current = form.values.permissions || [];
    const exists = current.includes(permissionKey);

    const updated = exists
      ? current.filter((p) => p !== permissionKey)
      : [...current, permissionKey];

    form.setFieldValue("permissions", updated);
  };

  const selectedCategories = permissionGroups
    .filter((category) =>
      category.permissions.some((p) =>
        form.values.permissions?.includes(p.key),
      ),
    )
    .map((c) => c.category);

  const permissionItems = permissionGroups.map((item) => (
    <Accordion.Item key={item.category} value={item.category}>
      <Accordion.Control fz={13} c="#868686" p={0}>
        {item.category}
      </Accordion.Control>

      <Accordion.Panel>
        <Flex direction="column">
          {item.permissions.map((permission) => {
            const isSelected = form.values.permissions?.includes(
              permission.key,
            );

            return (
              <Flex
                key={permission.key}
                align="center"
                justify="space-between"
                className="cursor-pointer"
                gap={8}
                py={10}
                onClick={() => togglePermission(permission.key)}
              >
                <Text fz={14} c="#CECECF">
                  {permission.label}
                </Text>

                {isSelected && (
                  <Image src={IconCheck2} alt="icon" width={12} height={12} />
                )}
              </Flex>
            );
          })}
        </Flex>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Drawer
      title="Create New Role"
      size="md"
      opened={opened}
      onClose={handleClose}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Flex mih="100vh" direction="column" justify="space-between">
          <ScrollArea.Autosize mah="100%" scrollbarSize={0}>
            <Flex direction="column" gap={14}>
              <TextInput
                label="Enter Role Name"
                {...form.getInputProps("name")}
              />
              <Textarea
                label="Description (optional)"
                {...form.getInputProps("description")}
              />

              <Popover
                position="bottom-end"
                width={240}
                classNames={{
                  dropdown: classes.menuDropdownAlt,
                }}
              >
                <Popover.Target>
                  <Flex direction="column" gap={6}>
                    <Text fz={14} fw={500} c="#969696">
                      Permissions
                    </Text>

                    <Flex
                      className={`${inputClasses.textInput} cursor-pointer`}
                      px="sm"
                      align="center"
                      justify="space-between"
                    >
                      <Text fz={14} c="#c4c4c4">
                        {selectedCategories.length > 0
                          ? selectedCategories.join(", ")
                          : "Click here to select"}
                      </Text>

                      <Image src={IconCaretDown} alt="icon" />
                    </Flex>
                  </Flex>
                </Popover.Target>

                <Popover.Dropdown p={10}>
                  {isFetchingPermissions ? (
                    <Flex justify="center" py={20}>
                      <Loader size="xs" />
                    </Flex>
                  ) : (
                    <ScrollArea.Autosize mah={240} scrollbarSize={0}>
                      <Accordion
                        defaultValue="Transactions"
                        classNames={{
                          control: classes.roleAccordionControl,
                          item: classes.roleAccordionItem,
                          content: classes.roleAccordionContent,
                          chevron: classes.roleAccordionChevron,
                        }}
                        chevron={
                          <Image
                            src={IconUpgrade}
                            width={14}
                            height={14}
                            alt="icon"
                          />
                        }
                      >
                        {permissionItems}
                      </Accordion>
                    </ScrollArea.Autosize>
                  )}
                </Popover.Dropdown>
              </Popover>
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
              disabled={createRoleMutation.isPending || !form.isValid()}
              loading={createRoleMutation.isPending}
            >
              Save Role
            </Button>
          </Flex>
        </Flex>
      </form>
    </Drawer>
  );
};

export default CreateRoleModal;
