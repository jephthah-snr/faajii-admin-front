"use client";

import { Box, Flex, Paper, PaperProps, Text } from "@mantine/core";
import type { Icon } from "@/config/icons";
import { formatCount } from "@/utils";

export interface StatTileProps extends Omit<PaperProps, "children"> {
  label: string;
  value: string | number;
  hint?: string;
  icon?: Icon;
  children?: React.ReactNode;
}

/**
 * The small metric tile used in stat rows above a table. Deliberately quieter
 * than `SummaryCard`: it sits *inside* a page rather than heading it, so it
 * recedes to `surface-elevated` instead of lifting.
 *
 * Figures are not colour-coded. A row of tiles in five different colours reads
 * as five unrelated things and implies a good/bad judgement the numbers do not
 * carry; the label says what it is, and the eye can compare the values.
 * Anything that genuinely needs attention says so in words, in `hint`.
 *
 * Rows cap at three tiles — past that use `StatBar`, which keeps a long set of
 * metrics on one line instead of a wall of boxes.
 */
const StatTile = ({
  label,
  value,
  hint,
  icon: IconComponent,
  children,
  ...props
}: StatTileProps) => {
  return (
    <Paper
      p="md"
      radius="md"
      bg="var(--fj-surface-elevated)"
      style={{ border: "1px solid var(--fj-border-subtle)" }}
      {...props}
    >
      <Flex align="center" justify="space-between" gap={8}>
        <Text c="var(--fj-text-muted)" fz={12} fw={500} lineClamp={1}>
          {label}
        </Text>
        {IconComponent && (
          <IconComponent
            size={16}
            color="var(--fj-text-muted)"
            variant="Bulk"
          />
        )}
      </Flex>

      <Text c="var(--fj-text-primary)" fz={24} fw={800} mt={6} lh={1.2}>
        {typeof value === "number" ? formatCount(value) : value}
      </Text>

      {hint && (
        <Text c="var(--fj-text-muted)" fz={11} mt={4} lineClamp={1}>
          {hint}
        </Text>
      )}

      {children && <Box mt={8}>{children}</Box>}
    </Paper>
  );
};

export default StatTile;
