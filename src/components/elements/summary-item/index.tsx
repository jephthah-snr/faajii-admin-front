"use client";

import { useState } from "react";
import { ActionIcon, Flex, Text, Loader } from "@mantine/core";
import { IconCheck, IconEdit } from "@/config/icons";
import inputClasses from "@/styles/Input.module.css";

interface SummaryItemProps {
  label: string;
  value: string | React.ReactNode;
  fz?: number;
  flex?: string | number;
  tt?: "capitalize" | "uppercase" | "lowercase";
  editable?: boolean;
  onSubmit?: (newValue: string) => Promise<void> | void;
  refetch?: () => void;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
}

const SummaryItem = ({
  label,
  value,
  fz = 15,
  flex,
  tt,
  editable = false,
  onSubmit,
  refetch,
  isLoading,
  setIsLoading,
}: SummaryItemProps) => {
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(
    typeof value === "string" ? value : ""
  );

  const handleEditToggle = () => {
    if (!editable) return;
    setEditMode(true);
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setIsLoading?.(true);
    try {
      await onSubmit(inputValue);
      setEditMode(false);
      refetch?.();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsLoading?.(false);
    }
  };

  return (
    <Flex direction="column" gap={6} flex={flex}>
      <Text
        c="var(--fj-text-muted)"
        fz={11}
        fw={600}
        tt="uppercase"
        style={{ letterSpacing: "0.05em" }}
      >
        {label}
      </Text>

      {/* Editable Mode */}
      {editMode ? (
        <Flex align="center" gap={8}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            className={inputClasses.editInput}
          />
          {isLoading ? (
            <Loader size="sm" color="gray" />
          ) : (
            <ActionIcon
              onClick={handleSubmit}
              disabled={isLoading}
              variant="transparent"
            >
              <IconCheck size={20} color="currentColor" variant="Linear" />
            </ActionIcon>
          )}
        </Flex>
      ) : (
        <Flex align="center" gap={8}>
          {typeof value === "string" ? (
            <Text fw={600} fz={fz} c="var(--fj-text-primary)" tt={tt}>
              {value}
            </Text>
          ) : (
            value
          )}
          {editable && (
            <ActionIcon
              variant="transparent"
              onClick={handleEditToggle}
              disabled={isLoading}
            >
              <IconEdit size={16} color="currentColor" variant="Linear" />
            </ActionIcon>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default SummaryItem;
