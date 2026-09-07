"use client";

import {
  Anchor,
  Badge,
  Card,
  Code,
  Flex,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import { AppLayout } from "@/layout";
import { StatTile } from "@/components";
import {
  pendingIntegrations,
  pendingIntegrationsByArea,
} from "@/config/pending-integrations";
import { IconArrowRight, IconInfo } from "@/config/icons";
import { formatCount } from "@/utils";

/**
 * The handover page. Every module here is built and reviewable — each runs on
 * sample data and says so — but none of them will show real activity until the
 * routes listed against them are deployed. `docs/backend-gaps.md` carries the
 * same picture in prose for the backend team.
 */
export default function PendingBackendPage() {
  const grouped = pendingIntegrationsByArea();
  const endpointCount = pendingIntegrations.reduce(
    (sum, integration) => sum + integration.endpoints.length,
    0,
  );

  return (
    <AppLayout
      title="Pending integrations"
      subTitle="Screens that are built and waiting on the API"
    >
      <Stack gap="xl">
        <Card radius="lg" p="md">
          <Flex gap={12} align="flex-start">
            <IconInfo size={20} color="var(--fj-accent)" variant="Bulk" />
            <Stack gap={4}>
              <Text fw={700}>Why these screens show sample data</Text>
              <Text c="var(--fj-text-secondary)" fz={13} lh={1.55}>
                Each module below is finished on the admin side. Where its
                endpoints answer 404, the screen renders sample rows instead of
                an empty table, so layout, states and copy can be reviewed now
                and the screen lights up the moment the route lands. Treat any
                figure on the screens listed here as illustrative — this page is
                the record of which ones are not yet live.
              </Text>
            </Stack>
          </Flex>
        </Card>

        <SimpleGrid cols={{ base: 2, md: 3 }}>
          <StatTile
            label="Modules waiting"
            value={formatCount(pendingIntegrations.length)}
          />
          <StatTile
            label="Endpoints outstanding"
            value={formatCount(endpointCount)}
          />
          <StatTile
            label="Areas affected"
            value={formatCount(grouped.length)}
          />
        </SimpleGrid>

        {grouped.map((group) => (
          <Stack key={group.area} gap="sm">
            <Group gap={8}>
              <Text
                fw={600}
                fz={12}
                tt="uppercase"
                c="var(--fj-text-muted)"
                style={{ letterSpacing: "0.06em" }}
              >
                {group.area}
              </Text>
              <Badge variant="light" size="sm">
                {group.items.length}
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              {group.items.map((integration) => (
                <Card key={integration.key} radius="lg" p="lg">
                  <Flex justify="space-between" align="flex-start" gap={10}>
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text fw={700} lineClamp={1}>
                        {integration.feature}
                      </Text>
                      <Anchor
                        component={Link}
                        href={integration.route}
                        fz={13}
                        style={{ width: "fit-content" }}
                      >
                        <Flex align="center" gap={4}>
                          {integration.routeLabel}
                          <IconArrowRight
                            size={13}
                            color="currentColor"
                            variant="Linear"
                          />
                        </Flex>
                      </Anchor>
                    </Stack>
                    <Badge variant="light" color="yellow">
                      Sample data
                    </Badge>
                  </Flex>

                  <Text c="var(--fj-text-secondary)" fz={13} lh={1.5} mt="sm">
                    {integration.note}
                  </Text>

                  <Text
                    fz={11}
                    fw={700}
                    c="var(--fj-text-muted)"
                    mt="md"
                    mb={6}
                  >
                    {integration.endpoints.length === 1
                      ? "Endpoint required"
                      : `${integration.endpoints.length} endpoints required`}
                  </Text>
                  <Stack gap={4}>
                    {integration.endpoints.map((endpoint) => (
                      <Code key={endpoint} style={{ width: "fit-content" }}>
                        {endpoint}
                      </Code>
                    ))}
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        ))}
      </Stack>
    </AppLayout>
  );
}
