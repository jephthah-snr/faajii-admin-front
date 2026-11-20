"use client";

import { Anchor, Card, Group, Text } from "@mantine/core";
import Link from "next/link";
import { IconInfo } from "@/config/icons";

interface EarningsNoticeProps {
  /** What this screen can and cannot show until the endpoint is live. */
  children?: React.ReactNode;
}

/**
 * Shown while a finance screen is reading gross payments from the live
 * endpoints because `/admin/finance/*` is not deployed. It says what is
 * missing, so a dash on the screen is understood as "not reported" and not
 * "zero".
 */
const EarningsNotice = ({ children }: EarningsNoticeProps) => (
  <Card
    radius="md"
    p="md"
    bg="var(--fj-surface-elevated)"
    style={{ border: "1px solid var(--fj-border-subtle)" }}
  >
    <Group gap={12} wrap="nowrap" align="flex-start">
      <IconInfo size={18} color="var(--fj-text-muted)" variant="Linear" />
      <Text fz="sm" c="var(--fj-text-secondary)">
        {children ?? (
          <>
            Faajii&rsquo;s own earnings aren&rsquo;t reported by the backend
            yet, so this shows what customers paid with a ticket-fee estimate.
            Exact revenue, costs and date filtering switch on when{" "}
            <code>/admin/finance</code> is deployed.{" "}
          </>
        )}
        <Anchor
          component={Link}
          href="/pending-backend"
          fz="sm"
          c="var(--fj-text-primary)"
          underline="always"
        >
          See pending integrations
        </Anchor>
      </Text>
    </Group>
  </Card>
);

export default EarningsNotice;
