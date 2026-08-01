"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Image,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
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

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "flagged", label: "Flagged" },
  { value: "hidden", label: "Hidden" },
  { value: "disabled", label: "Disabled" },
];

function statusColor(status: VibeModerationStatus) {
  if (status === "active") return "teal";
  if (status === "flagged") return "yellow";
  if (status === "hidden") return "gray";
  return "red";
}

function VibeMedia({ vibe, controls = false }: { vibe: AdminVibe; controls?: boolean }) {
  if (vibe.mediaType === "video") {
    if (!controls) {
      return (
        <Box pos="relative">
          <Image
            src={vibe.posterUrl}
            alt={vibe.caption || "Faajii vibe"}
            h={320}
            fit="cover"
            radius="lg"
          />
          <Flex
            pos="absolute"
            inset={0}
            align="center"
            justify="center"
            style={{ pointerEvents: "none" }}
          >
            <Flex
              w={52}
              h={52}
              align="center"
              justify="center"
              bg="rgba(0, 0, 0, 0.65)"
              style={{ borderRadius: "50%", backdropFilter: "blur(8px)" }}
            >
              <Text c="white" fz={24} ml={3}>
                ▶
              </Text>
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
          height: "min(76vh, 820px)",
          objectFit: "contain",
          background: "#111",
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
      h={controls ? "min(76vh, 820px)" : 320}
      fit={controls ? "contain" : "cover"}
      radius={controls ? 0 : "lg"}
    />
  );
}

export default function VibesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [status, setStatus] = useState<VibeModerationStatus | undefined>();
  const [selectedVibe, setSelectedVibe] = useState<AdminVibe | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const vibesQuery = useQuery({
    queryKey: ["admin-vibes", page, debouncedSearch, status],
    queryFn: () =>
      GetAdminVibes({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        status,
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

  return (
    <AppLayout
      title="Vibes"
      subTitle="Review public vibes and moderate content across Faajii."
    >
      <Flex gap="md" mb="xl" wrap="wrap">
        <TextInput
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
          placeholder="Search caption, creator, or event"
          w={{ base: "100%", md: 360 }}
        />
        <Select
          data={statusOptions}
          value={status || ""}
          onChange={(value) => {
            setStatus((value || undefined) as VibeModerationStatus | undefined);
            setPage(1);
          }}
          w={200}
        />
      </Flex>

      <Grid>
        {vibes.map((vibe) => (
          <Grid.Col key={vibe.ref} span={{ base: 12, sm: 6, lg: 4, xl: 3 }}>
            <Card
              withBorder
              radius="xl"
              padding="sm"
              onClick={() => openVibe(vibe)}
              style={{ cursor: "pointer" }}
            >
              <VibeMedia vibe={vibe} />
              <Stack gap="sm" mt="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <Avatar src={vibe.author.avatar} size="sm" />
                    <Text fw={600} fz="sm">
                      {vibe.author.name}
                    </Text>
                  </Group>
                  <Badge color={statusColor(vibe.moderationStatus)}>
                    {vibe.moderationStatus}
                  </Badge>
                </Group>
                <Text lineClamp={2}>{vibe.caption || "No caption"}</Text>
                <Text fz="sm" c="dimmed" lineClamp={1}>
                  {vibe.event.name}
                </Text>
                <Group gap="lg">
                  <Text fz="xs">{vibe.counts.views} views</Text>
                  <Text fz="xs">{vibe.counts.reports} reports</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {pagination && pagination.totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Button
            variant="light"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <Text>
            Page {page} of {pagination.totalPages}
          </Text>
          <Button
            variant="light"
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
        centered
        styles={{
          content: { background: "#111", maxWidth: 1180 },
          header: { background: "#111", color: "white" },
          body: { padding: 0 },
        }}
      >
        {selectedVibe && (
          <Grid gutter={0}>
            <Grid.Col
              span={{ base: 12, md: 8 }}
              bg="#050505"
              style={{ minHeight: "min(76vh, 820px)" }}
            >
              <VibeMedia vibe={selectedVibe} controls />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack h="100%" p="xl" style={{ minHeight: "min(76vh, 820px)" }}>
                <Badge
                  color={statusColor(selectedVibe.moderationStatus)}
                  w="fit-content"
                >
                  {selectedVibe.moderationStatus}
                </Badge>
                <Text>{selectedVibe.caption || "No caption"}</Text>
                <Card withBorder radius="lg">
                  <Text fz="xs" c="dimmed">
                    Linked event
                  </Text>
                  <Text fw={700}>{selectedVibe.event.name}</Text>
                  <Text fz="sm" c="dimmed">
                    {selectedVibe.event.eventId}
                  </Text>
                </Card>
                <Button
                  variant="light"
                  onClick={() =>
                    router.push(
                      `/event-management/${selectedVibe.event.id}`,
                    )
                  }
                >
                  View event
                </Button>
                <Group grow mt="auto">
                  <Button
                    color="yellow"
                    variant="light"
                    loading={moderate.isPending}
                    onClick={() =>
                      moderate.mutate({
                        ref: selectedVibe.ref,
                        nextStatus: "flagged",
                      })
                    }
                  >
                    Flag
                  </Button>
                  <Button
                    color="gray"
                    variant="light"
                    loading={moderate.isPending}
                    onClick={() =>
                      moderate.mutate({
                        ref: selectedVibe.ref,
                        nextStatus: "hidden",
                      })
                    }
                  >
                    Hide
                  </Button>
                </Group>
                <Group grow>
                  <Button
                    color="red"
                    loading={moderate.isPending}
                    onClick={() =>
                      moderate.mutate({
                        ref: selectedVibe.ref,
                        nextStatus: "disabled",
                      })
                    }
                  >
                    Disable
                  </Button>
                  <Button
                    color="teal"
                    loading={moderate.isPending}
                    onClick={() =>
                      moderate.mutate({
                        ref: selectedVibe.ref,
                        nextStatus: "active",
                      })
                    }
                  >
                    Restore
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        )}
      </Modal>
    </AppLayout>
  );
}
