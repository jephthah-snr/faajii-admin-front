"use client";

import { useState } from "react";
import { ActionIcon, Flex, Text, Loader } from "@mantine/core";
import Image from "next/image";
import { IconCheck, IconHighlight } from "@/icons";
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
  fz = 18,
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
      <Text c="#D9D9D9B2" fz={13}>
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
              <Image src={IconCheck} width={20} height={20} alt="check-icon" />
            </ActionIcon>
          )}
        </Flex>
      ) : (
        <Flex align="center" gap={8}>
          {typeof value === "string" ? (
            <Text fw={500} fz={fz} c="#e1e1e1" tt={tt}>
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
              <Image
                src={IconHighlight}
                width={20}
                height={20}
                alt="check-icon"
              />
            </ActionIcon>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default SummaryItem;
