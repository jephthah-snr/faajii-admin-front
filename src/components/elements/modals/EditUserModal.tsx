"use client";

import {
  Button,
  Drawer,
  Flex,
  TextInput,
  Textarea,
} from "@mantine/core";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import { UpdateUser, UpdateUserData } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";

interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  phoneNumber: string;
  bio: string | null;
  dateOfBirth?: string | null;
}

interface EditUserModalProps {
  opened: boolean;
  close: () => void;
  userProfile: UserProfile | null | undefined;
}

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  bio: string;
  dateOfBirth: string;
}

const EditUserModal = ({ opened, close, userProfile }: EditUserModalProps) => {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phoneNumber: "",
    bio: "",
    dateOfBirth: "",
  });

  // Track original data to detect changes
  const [originalData, setOriginalData] = useState<FormData>({
    name: "",
    email: "",
    phoneNumber: "",
    bio: "",
    dateOfBirth: "",
  });

  // Initialize form when modal opens or userProfile changes
  useEffect(() => {
    if (opened && userProfile) {
      const initial: FormData = {
        name: userProfile.name || "",
        email: userProfile.email || "",
        phoneNumber: userProfile.phoneNumber || "",
        bio: userProfile.bio || "",
        dateOfBirth: userProfile.dateOfBirth
          ? userProfile.dateOfBirth.split("T")[0]
          : "",
      };
      setFormData(initial);
      setOriginalData(initial);
    }
  }, [opened, userProfile]);

  // Check if form has changes
  const hasChanges =
    formData.name !== originalData.name ||
    formData.email !== originalData.email ||
    formData.phoneNumber !== originalData.phoneNumber ||
    formData.bio !== originalData.bio ||
    formData.dateOfBirth !== originalData.dateOfBirth;

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!userProfile) return;

      // Only send changed fields
      const changedData: UpdateUserData = {};
      if (formData.name !== originalData.name) changedData.name = formData.name;
      if (formData.email !== originalData.email)
        changedData.email = formData.email;
      if (formData.phoneNumber !== originalData.phoneNumber)
        changedData.phoneNumber = formData.phoneNumber;
      if (formData.bio !== originalData.bio) changedData.bio = formData.bio;
      if (formData.dateOfBirth !== originalData.dateOfBirth) {
        changedData.dateOfBirth = formData.dateOfBirth || undefined;
      }

      return UpdateUser(String(userProfile.id), changedData);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "User profile updated successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      close();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to update user profile",
        color: "red",
      });
    },
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      bio: "",
      dateOfBirth: "",
    });
    close();
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      size="md"
      title="Edit User Profile"
      position="right"
    >
      <Flex direction="column" gap={20} mt={10}>
        <TextInput
          label="Name"
          placeholder="Enter user name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          classNames={{ input: inputClasses.searchInput }}
        />

        <TextInput
          label="Email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          classNames={{ input: inputClasses.searchInput }}
        />

        <TextInput
          label="Phone Number"
          placeholder="Enter phone number"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          classNames={{ input: inputClasses.searchInput }}
        />

        <TextInput
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          classNames={{ input: inputClasses.searchInput }}
        />

        <Textarea
          label="Bio"
          placeholder="Enter bio"
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          minRows={3}
          classNames={{ input: inputClasses.searchInput }}
        />

        <Flex gap="sm" mt={10}>
          <Button
            radius="xl"
            className={classes.btnNeutral}
            fullWidth
            onClick={handleClose}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            radius="xl"
            className={classes.btnWhite}
            fullWidth
            onClick={() => updateMutation.mutate()}
            loading={updateMutation.isPending}
            disabled={!hasChanges || updateMutation.isPending}
          >
            Save Changes
          </Button>
        </Flex>
      </Flex>
    </Drawer>
  );
};

export default EditUserModal;
