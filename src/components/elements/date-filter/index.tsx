"use client";

import { Box, Button, Flex, Menu } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import Image from "next/image";
import { IconCalendarAlt } from "@/icons";
import classes from "@/styles/Input.module.css";
import { useEffect, useState } from "react";

interface DateFilterProps {
  title?: string;
  value?: [Date | null, Date | null];
  minDate?: Date;
  onChange?: (range: [Date | null, Date | null]) => void;
  hasControl?: boolean;
}

const DateFilter = ({
  title,
  value,
  minDate = new Date(2025, 1, 1),
  onChange,
  hasControl = false,
}: DateFilterProps) => {
  const [internalValue, setInternalValue] = useState<
    [Date | null, Date | null]
  >(value ?? [null, null]);

  // Keep local state in sync with parent value
  useEffect(() => {
    setInternalValue(value ?? [null, null]);
  }, [value]);

  const handleChange = (newRange: [Date | null, Date | null]) => {
    setInternalValue(newRange);

    // Only notify parent when both dates are selected
    if (!hasControl && newRange[0] && newRange[1]) {
      onChange?.(newRange);
    }
  };

  const handleApply = () => {
    if (internalValue[0] && internalValue[1]) {
      onChange?.(internalValue);
    }
  };

  const handleClear = () => {
    const cleared: [Date | null, Date | null] = [null, null];
    setInternalValue(cleared);
    onChange?.(cleared);
  };

  const isActive = internalValue[1];

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateLabel = (range: [Date | null, Date | null]) => {
    const [start, end] = range;
    if (!start && !end) return "";
    const startLabel = formatDisplayDate(start);
    const endLabel = formatDisplayDate(end);
    if (start && end && start.getTime() !== end.getTime()) {
      return `${startLabel} - ${endLabel}`;
    }
    return start ? startLabel : "";
  };

  return (
    <Flex align="center" gap={8}>
      <Menu shadow="md">
        <Menu.Target>
          <Button
            size="sm"
            h={40}
            style={{ border: "1px solid #181818" }}
            color="#0D0D0D"
            c="#CFCFCF"
            radius={8}
            miw="fit-content"
            leftSection={
              <Image
                src={IconCalendarAlt}
                width={20}
                height={20}
                alt="calendar"
              />
            }
          >
            {title && title}
            {formatDateLabel(internalValue!) || "Date"}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <DatePicker
            type="range"
            allowSingleDateInRange
            value={internalValue}
            onChange={handleChange}
            minDate={minDate}
            maxDate={new Date()}
            classNames={{ day: classes.day }}
          />

          {hasControl && (
            <Flex
              p="sm"
              justify="flex-end"
              gap={10}
              className="border-t border-t-gray-800"
            >
              <Button
                size="sm"
                miw="fit-content"
                h={34}
                variant="default"
                radius={8}
                onClick={handleClear}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                miw="fit-content"
                h={34}
                color="#5769E9"
                radius={8}
                onClick={handleApply}
                style={{ border: "1px solid #3C4CBD" }}
              >
                Apply
              </Button>
            </Flex>
          )}
        </Menu.Dropdown>
      </Menu>

      {isActive && !hasControl && (
        <Box w="fit-content">
          <Button
            size="sm"
            miw="fit-content"
            h={40}
            variant="outline"
            color="red"
            radius={8}
            onClick={handleClear}
            style={{ border: "1px solid #181818" }}
          >
            Clear date
          </Button>
        </Box>
      )}
    </Flex>
  );
};

export default DateFilter;
