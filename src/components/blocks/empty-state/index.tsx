"use client";

import { Box, BoxProps, Flex, Text } from "@mantine/core";
import { IconInbox, type Icon } from "@/config/icons";

export interface EmptyStateProps extends BoxProps {
  title?: string;
  description?: string;
  /** Iconsax glyph naming what's missing. Defaults to a generic inbox. */
  icon?: Icon;
  action?: React.ReactNode;
  /** Tightens the block for use inside a card or tab panel. */
  compact?: boolean;
}

/**
 * Icon + title + description, in that order — the one empty state used
 * everywhere. The icon is a subject-specific iconsax glyph rather than a
 * generic illustration, so a reader can tell at a glance *what* is empty.
 */
const EmptyState = ({
  title = "Nothing here yet",
  description = "When data is available, you'll see it here.",
  icon: IconComponent = IconInbox,
  action,
  compact = false,
  ...props
}: EmptyStateProps) => {
  return (
    <Box py={compact ? 28 : 56} {...props}>
      <Flex direction="column" gap={12} align="center" justify="center">
        <Flex
          align="center"
          justify="center"
          w={compact ? 52 : 64}
          h={compact ? 52 : 64}
          style={{
            borderRadius: "50%",
            background: "var(--fj-surface-elevated)",
            border: "1px solid var(--fj-border-subtle)",
          }}
        >
          <IconComponent
            size={compact ? 24 : 28}
            color="var(--fj-text-muted)"
            variant="Bulk"
          />
        </Flex>

        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={4}
          maw={380}
        >
          <Text c="var(--fj-text-primary)" ta="center" fw={600} fz={15}>
            {title}
          </Text>
          <Text c="var(--fj-text-muted)" ta="center" fz={13} lh={1.5}>
            {description}
          </Text>
        </Flex>

        {action && <Box mt={4}>{action}</Box>}
      </Flex>
    </Box>
  );
};

export default EmptyState;
