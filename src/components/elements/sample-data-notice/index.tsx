"use client";

import { Alert, Anchor, Box, BoxProps, Flex, Text } from "@mantine/core";
import Link from "next/link";
import { getPendingIntegration } from "@/config/pending-integrations";
import { IconInfo } from "@/config/icons";

interface SampleDataNoticeProps extends BoxProps {
  /** Key from `pendingIntegrations` — supplies the feature name and routes. */
  integration: string;
  /** Tightens the bar for use inside an event tab or a stacked section. */
  compact?: boolean;
}

/**
 * Shown above a screen whose endpoints answer 404. The screen still renders —
 * with sample rows, so the UI can be reviewed and signed off — and this says
 * plainly that the figures are illustrative and points at the handover page.
 *
 * It replaced the older full-page "awaiting backend" block: a bare notice told
 * an operator nothing about the design it was standing in for.
 */
const SampleDataNotice = ({
  integration,
  compact = false,
  ...props
}: SampleDataNoticeProps) => {
  const entry = getPendingIntegration(integration);
  const feature = entry?.feature || "This screen";

  return (
    <Box {...props}>
      <Alert
        variant="light"
        color="yellow"
        radius="lg"
        p={compact ? "sm" : "md"}
        icon={<IconInfo size={18} color="currentColor" variant="Bulk" />}
      >
        <Flex
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
          direction={{ base: "column", md: "row" }}
          gap={8}
        >
          <Text fz={compact ? 12 : 13} c="var(--fj-text-secondary)">
            <Text span fw={700} c="var(--fj-text-primary)">
              Sample data.
            </Text>{" "}
            {feature} is not wired to the API yet, so everything below is
            illustrative — nothing here reflects live activity.
          </Text>

          <Anchor
            component={Link}
            href="/pending-backend"
            fz={compact ? 12 : 13}
            fw={600}
            style={{ whiteSpace: "nowrap" }}
          >
            Pending integrations →
          </Anchor>
        </Flex>
      </Alert>
    </Box>
  );
};

export default SampleDataNotice;
