"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import { GetAdminVibes, ModerateAdminVibe } from "@/services/api";
import {
  AdminVibe,
  VibeModerationStatus,
} from "@/services/api/vibes/vibe.types";
import {
  CardGridSkeleton,
  EmptyState,
  FilterPill,
  TableToolbar,
} from "@/components";
import {
  IconArrowRight,
  IconComment,
  IconDisable,
  IconEye,
  IconEyeSlash,
  IconFlag,
  IconLike,
  IconPlay,
  IconSuccess,
} from "@/config/icons";
import { formatDateTime, vibeEmptyState } from "@/utils";

const statusOptions = ["All", "Active", "Flagged", "Hidden", "Disabled"];

function statusColor(status: VibeModerationStatus) {
  if (status === "active") return "teal";
  if (status === "flagged") return "yellow";
  if (status === "hidden") return "gray";
  return "red";
}

function VibeMedia({
  vibe,
  controls = false,
}: {
  vibe: AdminVibe;
  controls?: boolean;
}) {
  if (vibe.mediaType === "video") {
    if (!controls) {
      return (
        <Box pos="relative">
          <Image
            src={vibe.posterUrl}
            alt={vibe.caption || "Faajii vibe"}
            h={300}
            fit="cover"
            radius="md"
          />
          <Flex
            pos="absolute"
            inset={0}
            align="center"
            justify="center"
            style={{ pointerEvents: "none" }}
          >
            <Flex
              w={48}
              h={48}
              align="center"
              justify="center"
              bg="rgba(0, 0, 0, 0.55)"
              style={{ borderRadius: "50%", backdropFilter: "blur(8px)" }}
            >
              <IconPlay size={22} color="#ffffff" variant="Bold" />
            </Flex>
          </Flex>
        </Box>
      );
    }

    return (
      <video
        key={vibe.playbackUrl}
        poster={vibe.posterUrl}
        controls
        autoPlay
        preload="auto"
        playsInline
        controlsList="nodownload"
        style={{
          width: "100%",
          height: "min(74vh, 780px)",
          objectFit: "contain",
          background: "#000",
        }}
      >
        <source
          src={vibe.playbackUrl}
          type={vibe.playbackContentType || "video/mp4"}
        />
        Your browser cannot play this video.
      </video>
    );
  }

  return (
    <Image
      src={vibe.playbackUrl}
      alt={vibe.caption || "Faajii vibe"}
      h={controls ? "min(74vh, 780px)" : 300}
      fit={controls ? "contain" : "cover"}
      radius={controls ? 0 : "md"}
    />
  );
}

/** Engagement figure with its glyph, used along the card footer. */
const Metric = ({
  icon: IconComponent,
  value,
  emphasis,
}: {
  icon: typeof IconLike;
  value: number;
  emphasis?: boolean;
}) => (
  <Flex align="center" gap={5}>
    <IconComponent
      size={13}
      color={emphasis ? "var(--fj-danger)" : "var(--fj-text-muted)"}
      variant="Linear"
    />
    <Text fz={12} c={emphasis ? "var(--fj-danger)" : "var(--fj-text-muted)"}>
      {value.toLocaleString()}
    </Text>
  </Flex>
);

/**
 * A moderation action, rendered as a labelled icon rather than a filled button.
 * A row of coloured buttons reads as four equally-urgent choices when in fact
 * only "Disable" is destructive — so only that one carries colour.
 */
const ModerationAction = ({
  icon: IconComponent,
  label,
  onClick,
  loading,
  danger = false,
  active = false,
}: {
  icon: typeof IconLike;
  label: string;
  onClick: () => void;
  loading: boolean;
  danger?: boolean;
  active?: boolean;
}) => {
  const color = danger
    ? "var(--fj-danger)"
    : active
      ? "var(--fj-accent)"
      : "var(--fj-text-secondary)";

  return (
    <UnstyledButton
      onClick={onClick}
      disabled={loading}
      style={{ opacity: loading ? 0.5 : 1 }}
    >
      <Flex align="center" gap={9} py={9} px={4}>
        <IconComponent size={17} color={color} variant="Linear" />
        <Text fz={14} c={color} fw={danger ? 600 : 500}>
          {label}
        </Text>
      </Flex>
    </UnstyledButton>
  );
};

export default function VibesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [status, setStatus] = useState<string>("All");
  const [selectedVibe, setSelectedVibe] = useState<AdminVibe | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const vibesQuery = useQuery({
    queryKey: ["admin-vibes", page, debouncedSearch, status],
    queryFn: () =>
      GetAdminVibes({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        status:
          status === "All"
            ? undefined
            : (status.toLowerCase() as VibeModerationStatus),
      }),
  });

  const moderate = useMutation({
    mutationFn: ({
      ref,
      nextStatus,
    }: {
      ref: string;
      nextStatus: VibeModerationStatus;
    }) => ModerateAdminVibe(ref, nextStatus),
    onSuccess: (response) => {
      setSelectedVibe(response.data);
      queryClient.invalidateQueries({ queryKey: ["admin-vibes"] });
    },
  });

  const vibes = vibesQuery.data?.data.data || [];
  const pagination = vibesQuery.data?.data.pagination;

  function openVibe(vibe: AdminVibe) {
    setSelectedVibe(vibe);
    open();
  }

  const act = (nextStatus: VibeModerationStatus) => () => {
    if (selectedVibe) moderate.mutate({ ref: selectedVibe.ref, nextStatus });
  };

  return (
    <AppLayout
      title="Vibes"
      subTitle="Review public vibes and moderate content across Faajii"
    >
      <TableToolbar
        query={search}
        onQueryChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search caption, creator, or event"
        action={
          <FilterPill
            label="Status"
            value={status}
            items={statusOptions}
            onChange={(value) => {
              setStatus((value as string) || "All");
              setPage(1);
            }}
          />
        }
      />

      {vibesQuery.isFetching ? (
        <CardGridSkeleton
          count={6}
          mediaHeight={300}
          cols={{ base: 1, md: 2, lg: 3 }}
        />
      ) : vibes.length === 0 ? (
        <EmptyState {...vibeEmptyState} />
      ) : (
        <Grid gutter={16}>
          {vibes.map((vibe) => (
            /* Three across on desktop: large enough that a poster frame is
               actually legible, which is the point of a moderation queue. */
            <Grid.Col key={vibe.ref} span={{ base: 12, md: 6, lg: 4 }}>
              <Card
                radius="lg"
                padding="sm"
                onClick={() => openVibe(vibe)}
                style={{ cursor: "pointer", height: "100%" }}
              >
                <Box pos="relative">
                  <VibeMedia vibe={vibe} />
                  <Badge
                    pos="absolute"
                    top={10}
                    right={10}
                    variant="filled"
                    radius="sm"
                    color={statusColor(vibe.moderationStatus)}
                    tt="capitalize"
                  >
                    {vibe.moderationStatus}
                  </Badge>
                </Box>

                <Stack gap={10} mt="md" px={4} pb={4}>
                  <Group gap={8} wrap="nowrap">
                    <Avatar src={vibe.author.avatar} size={28} />
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text fw={600} fz={13} lineClamp={1}>
                        {vibe.author.name}
                      </Text>
                      <Text fz={11} c="var(--fj-text-muted)" lineClamp={1}>
                        {vibe.event.name}
                      </Text>
                    </Stack>
                  </Group>

                  <Text fz={13} lineClamp={2} c="var(--fj-text-secondary)">
                    {vibe.caption || "No caption"}
                  </Text>

                  <Group gap={14}>
                    <Metric icon={IconEye} value={vibe.counts.views} />
                    <Metric icon={IconLike} value={vibe.counts.likes} />
                    <Metric icon={IconComment} value={vibe.counts.comments} />
                    <Metric
                      icon={IconFlag}
                      value={vibe.counts.reports}
                      emphasis={vibe.counts.reports > 0}
                    />
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Button
            variant="light"
            color="gray"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <Text fz={14} c="var(--fj-text-muted)">
            Page {page} of {pagination.totalPages}
          </Text>
          <Button
            variant="light"
            color="gray"
            disabled={page === pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </Group>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={selectedVibe?.author.name || "Vibe"}
        size="calc(100vw - 64px)"
        styles={{
          content: { maxWidth: 1180 },
          body: { padding: 0 },
        }}
      >
        {selectedVibe && (
          <Grid gutter={0}>
            <Grid.Col
              span={{ base: 12, md: 8 }}
              bg="#000"
              style={{ minHeight: "min(74vh, 780px)" }}
            >
              <VibeMedia vibe={selectedVibe} controls />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack
                h="100%"
                p="lg"
                gap="lg"
                style={{ minHeight: "min(74vh, 780px)" }}
              >
                <Group justify="space-between">
                  <Badge
                    variant="light"
                    radius="sm"
                    tt="capitalize"
                    color={statusColor(selectedVibe.moderationStatus)}
                  >
                    {selectedVibe.moderationStatus}
                  </Badge>
                  <Text fz={12} c="var(--fj-text-muted)">
                    {formatDateTime(selectedVibe.createdAt)}
                  </Text>
                </Group>

                <Text fz={14} lh={1.6}>
                  {selectedVibe.caption || "No caption"}
                </Text>

                <Group gap={18}>
                  <Metric icon={IconEye} value={selectedVibe.counts.views} />
                  <Metric icon={IconLike} value={selectedVibe.counts.likes} />
                  <Metric
                    icon={IconComment}
                    value={selectedVibe.counts.comments}
                  />
                  <Metric
                    icon={IconFlag}
                    value={selectedVibe.counts.reports}
                    emphasis={selectedVibe.counts.reports > 0}
                  />
                </Group>

                {/* Linked event — the jump-off lives inside the card it belongs
                    to, rather than floating below as a separate button. */}
                <Card radius="md" bg="var(--fj-surface-elevated)" p="md">
                  <Text
                    fz={11}
                    fw={600}
                    tt="uppercase"
                    c="var(--fj-text-muted)"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    Linked event
                  </Text>
                  <Text fw={700} fz={15} mt={6} lineClamp={2}>
                    {selectedVibe.event.name}
                  </Text>
                  <Text fz={12} c="var(--fj-text-muted)" ff="monospace" mt={2}>
                    {selectedVibe.event.eventId}
                  </Text>

                  <Button
                    fullWidth
                    mt="md"
                    radius="xl"
                    color="gray.0"
                    c="var(--fj-text-inverse)"
                    rightSection={
                      <IconArrowRight
                        size={16}
                        color="currentColor"
                        variant="Linear"
                      />
                    }
                    onClick={() =>
                      router.push(`/event-management/${selectedVibe.event.id}`)
                    }
                  >
                    View event
                  </Button>
                </Card>

                <Box style={{ marginTop: "auto" }}>
                  <Divider color="var(--fj-border)" />
                  <Text
                    fz={11}
                    fw={600}
                    tt="uppercase"
                    c="var(--fj-text-muted)"
                    style={{ letterSpacing: "0.05em" }}
                    mt={14}
                    mb={2}
                  >
                    Moderation
                  </Text>

                  <Stack gap={0}>
                    {selectedVibe.moderationStatus !== "active" && (
                      <ModerationAction
                        icon={IconSuccess}
                        label="Restore to feed"
                        loading={moderate.isPending}
                        onClick={act("active")}
                      />
                    )}
                    <ModerationAction
                      icon={IconFlag}
                      label="Flag for review"
                      loading={moderate.isPending}
                      active={selectedVibe.moderationStatus === "flagged"}
                      onClick={act("flagged")}
                    />
                    <ModerationAction
                      icon={IconEyeSlash}
                      label="Hide from feed"
                      loading={moderate.isPending}
                      active={selectedVibe.moderationStatus === "hidden"}
                      onClick={act("hidden")}
                    />
                    <ModerationAction
                      icon={IconDisable}
                      label="Disable permanently"
                      loading={moderate.isPending}
                      danger
                      onClick={act("disabled")}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Grid.Col>
          </Grid>
        )}
      </Modal>
    </AppLayout>
  );
}
