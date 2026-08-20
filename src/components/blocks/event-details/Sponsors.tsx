"use client";

import {
  ActionIcon,
  Anchor,
  Avatar,
  Flex,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { GetEventSponsors, RemoveEventSponsor } from "@/services/api";
import { ListSkeleton, PendingBackend } from "@/components/elements";
import EmptyState from "../empty-state";
import { IconNoSponsors, IconTrash, IconWebsite } from "@/config/icons";
import {
  asList,
  getApiErrorMessage,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";

interface SponsorsProps {
  eventId: string;
  /** `compact` fits the Overview panel; `full` is a standalone listing. */
  variant?: "compact" | "full";
}

/** Sponsor logos the host attached, reviewable for content policy. */
const Sponsors = ({ eventId, variant = "full" }: SponsorsProps) => {
  const queryClient = useQueryClient();
  const compact = variant === "compact";

  const { data, isFetching, error } = useQuery({
    queryKey: ["admin-event-sponsors", eventId],
    queryFn: () => GetEventSponsors(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  const remove = useMutation({
    mutationFn: (sponsorId: number) => RemoveEventSponsor(eventId, sponsorId),
    onSuccess: () => {
      notifications.show({ color: "teal", message: "Sponsor removed" });
      queryClient.invalidateQueries({
        queryKey: ["admin-event-sponsors", eventId],
      });
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  if (isEndpointUnavailable(error)) {
    return (
      <PendingBackend
        feature="Sponsors"
        mt={0}
        endpoints={[
          "GET /admin/events/:id/sponsors",
          "DELETE /admin/events/:id/sponsors/:sponsorId",
        ]}
      />
    );
  }

  if (isFetching) return <ListSkeleton count={compact ? 3 : 5} />;

  const sponsors = asList(data?.data);

  if (sponsors.length === 0) {
    return (
      <EmptyState
        compact
        icon={IconNoSponsors}
        title="No sponsors"
        description="Sponsors the host adds will appear here."
      />
    );
  }

  return (
    <ScrollArea.Autosize mah={compact ? 200 : undefined} scrollbarSize={4}>
      <Stack gap={12}>
        {sponsors.map((sponsor) => (
          <Flex key={sponsor.id} align="center" gap={10} wrap="nowrap">
            <Avatar
              size={34}
              src={sponsor.logoUrl}
              name={sponsor.name}
              radius="md"
            />
            <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
              <Text fw={500} fz={14} lineClamp={1}>
                {sponsor.name}
              </Text>
              {sponsor.websiteUrl && (
                <Anchor
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  fz={12}
                  c="var(--fj-text-muted)"
                  lineClamp={1}
                >
                  <Flex align="center" gap={4}>
                    <IconWebsite
                      size={12}
                      color="currentColor"
                      variant="Linear"
                    />
                    {sponsor.websiteUrl.replace(/^https?:\/\//, "")}
                  </Flex>
                </Anchor>
              )}
            </Stack>

            <Tooltip label="Remove sponsor">
              <ActionIcon
                size={30}
                color="red"
                aria-label="Remove sponsor"
                loading={remove.isPending && remove.variables === sponsor.id}
                onClick={() => remove.mutate(sponsor.id)}
              >
                <IconTrash size={15} color="var(--fj-danger)" variant="Linear" />
              </ActionIcon>
            </Tooltip>
          </Flex>
        ))}
      </Stack>
    </ScrollArea.Autosize>
  );
};

export default Sponsors;
