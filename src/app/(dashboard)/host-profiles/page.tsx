"use client";

import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { AppLayout } from "@/layout";
import {
  ApproveHostProfile,
  GetHostProfileStats,
  GetHostProfiles,
  RejectHostProfile,
} from "@/services/api";
import {
  AdminHostProfile,
  HostApprovalStatus,
} from "@/services/api/host-profiles/host-profiles.types";
import {
  CardGridSkeleton,
  EmptyState,
  FilterPill,
  PendingBackend,
  StatTile,
  TableToolbar,
} from "@/components";
import {
  asList,
  capitalizeString,
  formatCount,
  formatDateTime,
  getApiErrorMessage,
  hostProfileEmptyState,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";

const statusColor: Record<HostApprovalStatus, string> = {
  pending: "yellow",
  approved: "teal",
  rejected: "red",
};

/**
 * Approval queue for the branded host identities users create in the app. The
 * mobile `HostProfile` record already carries `approvalStatus`, `approvedBy`
 * and `rejectionReason` — this is the screen that fills them in.
 */
export default function HostProfilesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [status, setStatus] = useState<"all" | HostApprovalStatus>("all");
  const [selected, setSelected] = useState<AdminHostProfile | null>(null);
  const [reason, setReason] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  const profilesQuery = useQuery({
    queryKey: ["admin-host-profiles", page, debouncedSearch, status],
    queryFn: () =>
      GetHostProfiles({
        page,
        limit: 24,
        search: debouncedSearch || undefined,
        approvalStatus: status === "all" ? undefined : status,
      }),
    retry: retryUnlessUnavailable,
  });

  const statsQuery = useQuery({
    queryKey: ["admin-host-profile-stats"],
    queryFn: GetHostProfileStats,
    retry: retryUnlessUnavailable,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-host-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["admin-host-profile-stats"] });
  };

  const approve = useMutation({
    mutationFn: (id: number) => ApproveHostProfile(id),
    onSuccess: () => {
      notifications.show({ color: "teal", message: "Host profile approved" });
      invalidate();
      close();
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  const reject = useMutation({
    mutationFn: ({ id, rejectionReason }: { id: number; rejectionReason: string }) =>
      RejectHostProfile(id, rejectionReason),
    onSuccess: () => {
      notifications.show({ color: "teal", message: "Host profile rejected" });
      setReason("");
      invalidate();
      close();
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  const stats = statsQuery.data?.data;
  const profiles = asList(profilesQuery.data?.data?.data);
  const pagination = profilesQuery.data?.data?.pagination;

  const openProfile = (profile: AdminHostProfile) => {
    setSelected(profile);
    setReason(profile.rejectionReason || "");
    open();
  };

  return (
    <AppLayout
      title="Host profiles"
      subTitle="Review the identities users host their events under"
    >
      {isEndpointUnavailable(profilesQuery.error) ? (
        <PendingBackend
          feature="Host profiles"
          endpoints={[
            "GET /admin/host-profiles",
            "GET /admin/host-profiles/statistics",
            "PATCH /admin/host-profiles/:id/approve",
            "PATCH /admin/host-profiles/:id/reject",
          ]}
        />
      ) : (
        <Stack gap="xl">
          {stats && (
            <SimpleGrid cols={{ base: 2, md: 4 }}>
              {[
                {
                  label: "Awaiting review",
                  value: stats.pendingApproval,
                  color: "#F5C912",
                },
                { label: "Approved", value: stats.approved, color: "#63E6BE" },
                { label: "Rejected", value: stats.rejected, color: "#FF8787" },
                {
                  label: "Total profiles",
                  value: stats.totalProfiles,
                  color: "#74C0FC",
                },
              ].map((metric) => (
                <StatTile key={metric.label} label={metric.label} value={formatCount(metric.value)} accent={metric.color} />
              ))}
            </SimpleGrid>
          )}

          <TableToolbar
            query={search}
            onQueryChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search profile or owner"
            action={
              <FilterPill
                label="Review"
                value={capitalizeString(status)}
                items={["Pending", "Approved", "Rejected", "All"]}
                onChange={(value) => {
                  setStatus(
                    String(value).toLowerCase() as "all" | HostApprovalStatus,
                  );
                  setPage(1);
                }}
              />
            }
          />

          {profilesQuery.isFetching ? (
            <CardGridSkeleton count={6} />
          ) : profiles.length === 0 ? (
            <EmptyState {...hostProfileEmptyState} />
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  radius="lg"
                  className="cursor-pointer"
                  onClick={() => openProfile(profile)}
                >
                  <Group justify="space-between" align="flex-start">
                    <Group>
                      <Avatar
                        src={profile.avatar}
                        name={profile.name}
                        size="lg"
                      />
                      <Stack gap={2}>
                        <Text fw={700} lineClamp={1}>
                          {profile.name}
                        </Text>
                        <Text c="var(--fj-text-muted)" fz="sm" lineClamp={1}>
                          {profile.ownerName || `User #${profile.userId}`}
                        </Text>
                      </Stack>
                    </Group>
                    <Badge
                      variant="light"
                      color={statusColor[profile.approvalStatus]}
                    >
                      {profile.approvalStatus}
                    </Badge>
                  </Group>

                  <Text mt="md" lineClamp={2} fz="sm" c="var(--fj-text-muted)">
                    {profile.description || "No description"}
                  </Text>

                  <Group justify="space-between" mt="lg">
                    <Badge variant="light" tt="capitalize">
                      {profile.type === "user_profile" ? "Personal" : "Custom"}
                    </Badge>
                    <Text fz="xs" c="var(--fj-text-muted)">
                      {profile.eventsHosted} events hosted
                    </Text>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Group justify="center">
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
        </Stack>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={selected?.name || "Host profile"}
        size="lg"
        centered
      >
        {selected && (
          <Stack gap="md">
            <Group>
              <Avatar src={selected.avatar} name={selected.name} size="xl" />
              <Stack gap={2}>
                <Text fw={700} fz="lg">
                  {selected.name}
                </Text>
                <Anchor
                  fz="sm"
                  onClick={() =>
                    router.push(`/user-management/${selected.userId}`)
                  }
                >
                  {selected.ownerName || `User #${selected.userId}`}
                </Anchor>
                <Text c="var(--fj-text-muted)" fz="sm">
                  {selected.ownerEmail || "No email"}
                </Text>
              </Stack>
            </Group>

            <Text>{selected.description || "No description provided."}</Text>

            {selected.website && (
              <Anchor
                href={selected.website}
                target="_blank"
                rel="noopener noreferrer"
                fz="sm"
              >
                {selected.website}
              </Anchor>
            )}

            <SimpleGrid cols={2}>
              <Card radius="md" p="sm">
                <Text fz="xs" c="var(--fj-text-muted)">
                  Events hosted
                </Text>
                <Text fw={700}>{selected.eventsHosted}</Text>
              </Card>
              <Card radius="md" p="sm">
                <Text fz="xs" c="var(--fj-text-muted)">
                  Created
                </Text>
                <Text fw={700}>{formatDateTime(selected.created_at)}</Text>
              </Card>
            </SimpleGrid>

            {selected.approvalStatus === "rejected" &&
              selected.rejectionReason && (
                <Card radius="md" p="sm">
                  <Text fz="xs" c="var(--fj-text-muted)">
                    Rejection reason
                  </Text>
                  <Text fz="sm">{selected.rejectionReason}</Text>
                </Card>
              )}

            <Textarea
              label="Rejection reason"
              description="Shown to the user if you reject this profile."
              value={reason}
              onChange={(event) => setReason(event.currentTarget.value)}
              minRows={3}
              autosize
            />

            <Group grow>
              <Button
                color="red"
                variant="light"
                disabled={!reason.trim()}
                loading={reject.isPending}
                onClick={() =>
                  reject.mutate({
                    id: selected.id,
                    rejectionReason: reason.trim(),
                  })
                }
              >
                Reject
              </Button>
              <Button
                color="teal"
                loading={approve.isPending}
                onClick={() => approve.mutate(selected.id)}
              >
                Approve
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </AppLayout>
  );
}
