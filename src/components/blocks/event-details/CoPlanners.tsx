"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Card,
  Divider,
  Flex,
  Group,
  Menu,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { GetAdminEventPlanners, RevokeEventCoPlanner } from "@/services/api";
import { CardGridSkeleton, PendingBackend } from "@/components/elements";
import EmptyState from "../empty-state";
import {
  IconMore,
  IconNoUsers,
  IconPhone,
  IconSuccess,
  IconTrash,
} from "@/config/icons";
import {
  asList,
  formatDateTime,
  formatStatusLabel,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";

const statusColor: Record<string, string> = {
  accepted: "teal",
  pending: "yellow",
  declined: "gray",
  revoked: "red",
};

/**
 * One card per co-planner: who they are, what they can do, and the single
 * action an admin has over them.
 *
 * The permission set is the point of this screen, so it gets its own labelled
 * block with granted capabilities as ticked rows. The previous version dumped
 * raw permission keys into a wall of identical badges, which read as noise
 * rather than as "here is what this person can do".
 */
const CoPlanners = ({ eventId }: { eventId: string }) => {
  const queryClient = useQueryClient();

  const { data, isFetching, error } = useQuery({
    queryKey: ["admin-event-planners", eventId],
    queryFn: () => GetAdminEventPlanners(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  const revoke = useMutation({
    mutationFn: (coPlannerId: number) =>
      RevokeEventCoPlanner(eventId, coPlannerId),
    onSuccess: () => {
      notifications.show({
        color: "teal",
        message: "Co-planner access revoked",
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-event-planners", eventId],
      });
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  if (isEndpointUnavailable(error)) {
    return (
      <PendingBackend
        feature="Co-planners"
        endpoints={["GET /admin/events/:id/planners"]}
      />
    );
  }

  if (isFetching) return <CardGridSkeleton count={3} />;

  const planners = asList(data?.data);

  if (planners.length === 0) {
    return (
      <EmptyState
        icon={IconNoUsers}
        title="No co-planners"
        description="This host is planning the event on their own."
      />
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing={16}>
      {planners.map((planner) => {
        const granted = planner.permissions.filter(
          (permission) => permission.access,
        );
        const isRevoked = planner.status === "revoked";

        return (
          <Card key={planner.id} radius="lg" p={0}>
            {/* Identity */}
            <Flex align="flex-start" justify="space-between" gap={10} p="lg">
              <Flex gap={12} style={{ minWidth: 0 }}>
                <Avatar size={44} name={planner.name} radius="xl" />
                <Stack gap={4} style={{ minWidth: 0 }}>
                  <Text fw={650} fz={15} lineClamp={1}>
                    {planner.name}
                  </Text>
                  <Flex align="center" gap={5}>
                    <IconPhone
                      size={12}
                      color="var(--fj-text-muted)"
                      variant="Linear"
                    />
                    <Text fz={12} c="var(--fj-text-muted)">
                      {planner.phone}
                    </Text>
                  </Flex>
                  <Badge
                    variant="light"
                    size="sm"
                    radius="sm"
                    w="fit-content"
                    color={statusColor[planner.status] || "gray"}
                  >
                    {formatStatusLabel(planner.status)}
                  </Badge>
                </Stack>
              </Flex>

              {!isRevoked && (
                <Menu position="bottom-end">
                  <Menu.Target>
                    <ActionIcon size={30} aria-label="Co-planner actions">
                      <IconMore
                        size={16}
                        color="var(--fj-text-muted)"
                        variant="Linear"
                      />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      color="red"
                      leftSection={
                        <IconTrash
                          size={14}
                          color="currentColor"
                          variant="Linear"
                        />
                      }
                      onClick={() => revoke.mutate(planner.id)}
                    >
                      Revoke access
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Flex>

            <Divider color="var(--fj-border)" />

            {/* Capabilities */}
            <Stack gap={10} p="lg" style={{ flex: 1 }}>
              <Group justify="space-between">
                <Text
                  fw={600}
                  fz={11}
                  tt="uppercase"
                  c="var(--fj-text-muted)"
                  style={{ letterSpacing: "0.05em" }}
                >
                  Can do
                </Text>
                <Text fz={11} c="var(--fj-text-muted)">
                  {granted.length} of {planner.permissions.length}
                </Text>
              </Group>

              {granted.length === 0 ? (
                <Text fz={13} c="var(--fj-text-muted)">
                  View-only — no capabilities granted.
                </Text>
              ) : (
                <Stack gap={7}>
                  {granted.slice(0, 4).map((permission) => (
                    <Flex key={permission.id} align="center" gap={7}>
                      <IconSuccess
                        size={14}
                        color="var(--fj-success)"
                        variant="Bulk"
                      />
                      <Text fz={13} c="var(--fj-text-secondary)">
                        {formatStatusLabel(permission.id)}
                      </Text>
                    </Flex>
                  ))}
                  {granted.length > 4 && (
                    <Tooltip
                      multiline
                      w={220}
                      label={granted
                        .slice(4)
                        .map((permission) => formatStatusLabel(permission.id))
                        .join(", ")}
                    >
                      <Text fz={12} c="var(--fj-accent)" w="fit-content">
                        +{granted.length - 4} more
                      </Text>
                    </Tooltip>
                  )}
                </Stack>
              )}
            </Stack>

            <Divider color="var(--fj-border)" />

            <Text fz={11} c="var(--fj-text-muted)" px="lg" py={12}>
              Invited {formatDateTime(planner.createdAt)}
              {planner.invitedBy ? ` by ${planner.invitedBy.name}` : ""}
            </Text>
          </Card>
        );
      })}
    </SimpleGrid>
  );
};

export default CoPlanners;
