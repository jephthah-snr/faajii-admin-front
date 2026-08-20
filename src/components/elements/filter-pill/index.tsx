"use client";

import { Button, Divider, Flex, Menu, Stack, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IconCalendar, IconChevronDown } from "@/config/icons";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";

export type FilterPillValue = string | [Date | null, Date | null] | null;

interface FilterPillProps {
  /** Dimension being filtered, e.g. "Status". */
  label: string;
  value: FilterPillValue;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Option list for a list filter. Omit and pass `isDate` for a range picker. */
  items?: string[];
  isDate?: boolean;
  onChange: (value: FilterPillValue) => void;
}

const presets: { label: string; range: () => [Date, Date] }[] = [
  {
    label: "Today",
    range: () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return [start, end];
    },
  },
  {
    label: "Last 7 days",
    range: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return [start, end];
    },
  },
  {
    label: "Last 30 days",
    range: () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return [start, end];
    },
  },
];

const formatValue = (value: FilterPillValue, placeholder: string): string => {
  if (!value) return placeholder;

  if (Array.isArray(value)) {
    const [from, to] = value;
    if (!from) return placeholder;
    if (!to || from.getTime() === to.getTime()) return from.toLocaleDateString();
    return `${from.toLocaleDateString()} – ${to.toLocaleDateString()}`;
  }

  return value;
};

/**
 * The one filter control used across the admin — the pattern established on
 * Vendor Management. Everything that filters a table renders this, so the
 * dropdowns can't drift in colour, size or behaviour from page to page.
 */
const FilterPill = ({
  label,
  value,
  placeholder = "All",
  items,
  isDate = false,
  onChange,
}: FilterPillProps) => {
  const display = formatValue(value, placeholder);
  const isActive = Boolean(value) && display !== placeholder;

  return (
    <Menu shadow="md" position="bottom-start" width={isDate ? 320 : 200}>
      <Menu.Target>
        <Button
          variant="default"
          className={`${classes.filterPill} ${isActive ? classes.filterPillActive : ""}`}
          styles={{ root: { minWidth: "fit-content" }, label: { fontWeight: 400 } }}
          rightSection={
            <IconChevronDown size={16} color="currentColor" variant="Linear" />
          }
          leftSection={
            isDate ? (
              <IconCalendar size={16} color="currentColor" variant="Linear" />
            ) : undefined
          }
        >
          <Flex align="center" gap={6}>
            <Text fz={14} c="var(--fj-text-muted)">
              {label}:
            </Text>
            <Text fz={14} c={isActive ? "var(--fj-accent)" : "var(--fj-text-primary)"}>
              {display}
            </Text>
          </Flex>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {isDate ? (
          <Stack gap={10} p={8}>
            <Text fz={11} fw={700} tt="uppercase" c="var(--fj-text-muted)">
              Quick select
            </Text>
            <Flex gap={6} wrap="wrap">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  size="compact-xs"
                  variant="light"
                  color="gray"
                  radius="xl"
                  styles={{ root: { minWidth: "auto" } }}
                  onClick={() => onChange(preset.range())}
                >
                  {preset.label}
                </Button>
              ))}
            </Flex>

            <Divider color="var(--fj-border)" />

            <Text fz={11} fw={700} tt="uppercase" c="var(--fj-text-muted)">
              Custom range
            </Text>
            <Flex justify="center">
              <DatePicker
                type="range"
                allowSingleDateInRange
                classNames={{ day: inputClasses.day }}
                value={(value as [Date | null, Date | null]) || [null, null]}
                onChange={(range) =>
                  onChange(range as [Date | null, Date | null])
                }
              />
            </Flex>

            {isActive && (
              <Button
                size="compact-sm"
                variant="subtle"
                color="gray"
                onClick={() => onChange(null)}
              >
                Clear
              </Button>
            )}
          </Stack>
        ) : (
          items?.map((item) => (
            <Menu.Item
              key={item}
              onClick={() => onChange(item)}
              styles={{
                item: {
                  color:
                    item === value
                      ? "var(--fj-accent)"
                      : "var(--fj-text-primary)",
                },
              }}
            >
              {item}
            </Menu.Item>
          ))
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default FilterPill;
