"use client";

import { IconCalendar, IconCaretDown, IconCloseBlue } from "@/icons";
import {
  Button,
  Flex,
  Menu,
  Stack,
  Text,
  Divider,
  ScrollArea,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import Image from "next/image";
import { useState } from "react";
import classes from "@/styles/Input.module.css";
import { buildDefaultFilters, computeApiFilters, FilterItem } from "@/utils";

interface FilterButtonProps {
  data: FilterItem[];
  close: () => void;
  onFilterChange: (filters: Record<string, string>) => void;
}

type FilterValue = string | [Date | null, Date | null] | null;

// Helper functions for date presets
const getToday = (): [Date, Date] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  return [today, endOfDay];
};

const getYesterday = (): [Date, Date] => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);
  return [yesterday, endOfYesterday];
};

const getLast7Days = (): [Date, Date] => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  return [sevenDaysAgo, today];
};

const getLast30Days = (): [Date, Date] => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  return [thirtyDaysAgo, today];
};

const btnStyle = {
  root: {
    minWidth: "auto",
  },
};

const FilterButton = ({ data, close, onFilterChange }: FilterButtonProps) => {
  const [selected, setSelected] = useState<Record<string, FilterValue>>({});
  const hasSelectedFilters = Object.keys(selected).length > 0;

  return (
    <Flex gap={10} wrap="wrap" align="center">
      {data.map((menu) => (
        <Menu shadow="md" key={menu.title}>
          <Menu.Target>
            <Button
              size="sm"
              style={{ border: "1px solid #444444" }}
              color="#0D0D0D"
              radius={8}
              miw={"fit-content"}
              rightSection={
                <Image
                  src={menu.isDate ? IconCalendar : IconCaretDown}
                  width={20}
                  height={20}
                  alt="icon"
                />
              }
            >
              {menu.title}
              {(selected[menu.title] || menu.default) &&
                selected[menu.title] !== null &&
                ": "}
              {Array.isArray(selected[menu.title]) &&
              (selected[menu.title]?.[0] instanceof Date ||
                selected[menu.title]?.[1] instanceof Date)
                ? selected[menu.title]?.[1] instanceof Date &&
                  selected[menu.title]?.[0] instanceof Date &&
                  (selected[menu.title]?.[0] as Date)?.getTime() !==
                    (selected[menu.title]?.[1] as Date)?.getTime()
                  ? `${(
                      selected[menu.title]?.[0] as Date
                    ).toLocaleDateString()} - ${(
                      selected[menu.title]?.[1] as Date
                    ).toLocaleDateString()}`
                  : (selected[menu.title]?.[0] as Date).toLocaleDateString()
                : selected[menu.title]?.toString() || menu.default || ""}
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {menu.isDate ? (
              <Stack gap={12} p={12}>
                {/* Quick Presets */}
                <Text size="xs" fw={600} c="#888" tt="uppercase">
                  Quick Select
                </Text>
                <ScrollArea.Autosize w={300}>
                  <Flex gap={8}>
                    <Button
                      size="xs"
                      variant="light"
                      color="gray"
                      radius="xl"
                      styles={btnStyle}
                      onClick={() => {
                        const dateRange = getToday();
                        const updated = {
                          ...selected,
                          [menu.title]: dateRange,
                        };
                        setSelected(updated);
                        const apiFilters = computeApiFilters(updated, data);
                        onFilterChange(apiFilters);
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="gray"
                      radius="xl"
                      styles={btnStyle}
                      onClick={() => {
                        const dateRange = getYesterday();
                        const updated = {
                          ...selected,
                          [menu.title]: dateRange,
                        };
                        setSelected(updated);
                        const apiFilters = computeApiFilters(updated, data);
                        onFilterChange(apiFilters);
                      }}
                    >
                      Yesterday
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="gray"
                      radius="xl"
                      styles={btnStyle}
                      onClick={() => {
                        const dateRange = getLast7Days();
                        const updated = {
                          ...selected,
                          [menu.title]: dateRange,
                        };
                        setSelected(updated);
                        const apiFilters = computeApiFilters(updated, data);
                        onFilterChange(apiFilters);
                      }}
                    >
                      Last 7 Days
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="gray"
                      radius="xl"
                      styles={btnStyle}
                      onClick={() => {
                        const dateRange = getLast30Days();
                        const updated = {
                          ...selected,
                          [menu.title]: dateRange,
                        };
                        setSelected(updated);
                        const apiFilters = computeApiFilters(updated, data);
                        onFilterChange(apiFilters);
                      }}
                    >
                      Last 30 Days
                    </Button>
                  </Flex>
                </ScrollArea.Autosize>

                <Divider color="#333" />

                {/* Calendar */}
                <Text size="xs" fw={600} c="#888" tt="uppercase">
                  Custom Range
                </Text>
                <Flex justify="center">
                  <DatePicker
                    type="range"
                    allowSingleDateInRange
                    classNames={{ day: classes.day }}
                    value={
                      (selected[menu.title] as [Date | null, Date | null]) || [
                        null,
                        null,
                      ]
                    }
                    onChange={(date) => {
                      const updated = { ...selected, [menu.title]: date };
                      setSelected(updated);
                      const apiFilters = computeApiFilters(updated, data);
                      onFilterChange(apiFilters);
                    }}
                  />
                </Flex>
              </Stack>
            ) : (
              menu.items?.map((item) => (
                <Menu.Item
                  key={item}
                  onClick={() => {
                    const updated = { ...selected, [menu.title]: item };
                    setSelected(updated);
                    const apiFilters = computeApiFilters(updated, data);
                    onFilterChange(apiFilters);
                  }}
                >
                  {item}
                </Menu.Item>
              ))
            )}
          </Menu.Dropdown>
        </Menu>
      ))}

      <Button
        size="sm"
        miw="fit-content"
        style={{ border: "1px solid #444444" }}
        color="#0D0D0D"
        c="#5769E9"
        radius={8}
        rightSection={
          <Image src={IconCloseBlue} width={10} height={10} alt="icon" />
        }
        onClick={() => {
          if (hasSelectedFilters) {
            setSelected({});
            const defaults = buildDefaultFilters(data);
            onFilterChange(defaults);
          } else {
            close();
          }
        }}
      >
        {hasSelectedFilters ? "Clear filters" : "Close filters"}
      </Button>
    </Flex>
  );
};

export default FilterButton;
