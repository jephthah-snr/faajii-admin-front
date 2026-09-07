"use client";

import { Box, Flex, Paper, PaperProps, Text } from "@mantine/core";
import { formatCount } from "@/utils";

export interface StatBarItem {
  label: string;
  value: string | number;
  /** Secondary line — the context the figure needs, not a second figure. */
  hint?: string;
}

interface StatBarProps extends Omit<PaperProps, "children"> {
  items: StatBarItem[];
  /** Widens each cell before it wraps; raise it for long money values. */
  minCellWidth?: number;
}

/**
 * A single strip of metrics, divided rather than boxed.
 *
 * Four or five separate tiles in a row read as five unrelated cards competing
 * for attention, and each one wastes its own border and padding on a number
 * three words long. Grouping them into one bar says "these belong to the same
 * question" and keeps the page to one heavy edge. Cells reflow on a narrow
 * screen; a cell that wraps onto a new row keeps its divider, which reads as a
 * grid rather than a stray rule.
 */
const StatBar = ({ items, minCellWidth = 150, ...props }: StatBarProps) => {
  return (
    <Paper
      p={0}
      radius="md"
      bg="var(--fj-surface-elevated)"
      style={{
        border: "1px solid var(--fj-border-subtle)",
        overflow: "hidden",
      }}
      {...props}
    >
      <Flex wrap="wrap">
        {items.map((item, index) => (
          <Box
            key={item.label}
            px="md"
            py="md"
            style={{
              flex: `1 1 ${minCellWidth}px`,
              minWidth: 0,
              // An inset shadow rather than a border, so the divider does not
              // add width and throw the cells out of equal measure.
              boxShadow:
                index === 0
                  ? undefined
                  : "inset 1px 0 0 0 var(--fj-border-subtle)",
            }}
          >
            <Text c="var(--fj-text-muted)" fz={12} fw={500} lineClamp={1}>
              {item.label}
            </Text>
            <Text c="var(--fj-text-primary)" fz={22} fw={800} mt={4} lh={1.2}>
              {typeof item.value === "number"
                ? formatCount(item.value)
                : item.value}
            </Text>
            {item.hint && (
              <Text c="var(--fj-text-muted)" fz={11} mt={4} lineClamp={1}>
                {item.hint}
              </Text>
            )}
          </Box>
        ))}
      </Flex>
    </Paper>
  );
};

export default StatBar;
