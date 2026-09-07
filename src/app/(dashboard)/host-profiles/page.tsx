"use client";

import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Divider,
  Flex,
  Group,
  Modal,
  Stack,
  Table,
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
import { PpTable, StatBar } from "@/components";
import {
  asList,
  formatDateTime,
  getApiErrorMessage,
  hostProfileEmptyState,
  hostProfileFilters,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { mockHostProfileStats, mockHostProfiles } from "@/mocks";

const statusColor: Record<HostApprovalStatus, string> = {
  pending: "yellow",
  approved: "teal",
  rejected: "red",
};

const tableHeaders = [
  "Profile",
  "Owner",
  "Type",
  "Events hosted",
  "Review",
  "Created",
];

/** Label/value pair used in the detail modal's fact grid. */
const Fact = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack gap={2}>
    <Text c="var(--fj-text-muted)" fz={11}>
      {label}
    </Text>
    <Text fz="sm" fw={600} style={{ overflowWrap: "anywhere" }}>
      {value}
    </Text>
  </Stack>
);

/**
 * Approval queue for the branded host identities users create in the app. The
 * mobile `HostProfile` record already carries `approvalStatus`, `approvedBy`
 * and `rejectionReason` — this is the screen that fills them in.
 *
 * A queue is a worklist, so it reads as a table: an admin scans down the review
 * column, opens the one that needs a decision, and acts. The card grid it
 * replaced showed six profiles a screen and buried the status a reviewer was
 * actually looking for.
 */
export default function HostProfilesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<AdminHostProfile | null>(null);
  /** The reject form stays folded away until a reviewer asks for it. */
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  const approvalStatus = filters.approvalStatus as
    | HostApprovalStatus
    | undefined;
  const type = filters.type as "custom" | "user_profile" | undefined;

  const profilesQuery = useQuery({
    queryKey: ["admin-host-profiles", page, debouncedSearch, approvalStatus, type],
    queryFn: () =>
      GetHostProfiles({
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        approvalStatus: approvalStatus || undefined,
        type: type || undefined,
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
    mutationFn: ({
      id,
      rejectionReason,
    }: {
      id: number;
      rejectionReason: string;
    }) => RejectHostProfile(id, rejectionReason),
    onSuccess: () => {
      notifications.show({ color: "teal", message: "Host profile rejected" });
      setReason("");
      setIsRejecting(false);
      invalidate();
      close();
    },
    onError: (err) =>
      notifications.show({ color: "red", message: getApiErrorMessage(err) }),
  });

  // The approval queue has no admin route yet — sample profiles below.
  const isSample = isEndpointUnavailable(profilesQuery.error);
  const stats = isSample ? mockHostProfileStats : statsQuery.data?.data;
  const profiles = isSample
    ? mockHostProfiles
    : asList(profilesQuery.data?.data?.data);
  const totalItems = isSample
    ? mockHostProfiles.length
    : profilesQuery.data?.data?.pagination?.total || 0;

  const openProfile = (profile: AdminHostProfile) => {
    setSelected(profile);
    setReason(profile.rejectionReason || "");
    setIsRejecting(false);
    open();
  };

  const rows = profiles.map((profile) => (
    <Table.Tr
      key={profile.id}
      className="cursor-pointer"
      onClick={() => openProfile(profile)}
    >
      <Table.Td>
        <Group gap={10}>
          <Avatar size="sm" src={profile.avatar} name={profile.name} />
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text fz="sm" fw={650} lineClamp={1}>
              {profile.name}
            </Text>
            <Text c="var(--fj-text-muted)" fz="xs" lineClamp={1}>
              {profile.description || "No description"}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{profile.ownerName || `User #${profile.userId}`}</Text>
        <Text c="var(--fj-text-muted)" fz="xs">
          {profile.ownerEmail || "No email"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light">
          {profile.type === "user_profile" ? "Personal" : "Custom"}
        </Badge>
      </Table.Td>
      <Table.Td>{profile.eventsHosted}</Table.Td>
      <Table.Td>
        <Badge variant="light" color={statusColor[profile.approvalStatus]}>
          {profile.approvalStatus}
        </Badge>
      </Table.Td>
      <Table.Td>{formatDateTime(profile.created_at)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <AppLayout
      title="Host profiles"
      subTitle="Review the identities users host their events under"
    >
      <Stack gap="xl">
        {stats && (
          <StatBar
            items={[
              {
                label: "Awaiting review",
                value: stats.pendingApproval,
                hint:
                  stats.pendingApproval > 0
                    ? "Oldest first in the queue"
                    : "Queue is clear",
              },
              { label: "Approved", value: stats.approved },
              { label: "Rejected", value: stats.rejected },
              {
                label: "Total profiles",
                value: stats.totalProfiles,
                hint: `${stats.customProfiles.toLocaleString()} custom`,
              },
            ]}
          />
        )}

        <PpTable
          headers={tableHeaders}
          rowData={rows}
          totalItems={totalItems}
          activePage={page}
          setActivePage={setPage}
          rowsPerPage={rowsPerPage}
          isLoading={profilesQuery.isFetching && !isSample}
          hasActions
          filters={hostProfileFilters}
          onFilterChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          query={search}
          handleQuery={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search profile or owner"
          emptyState={hostProfileEmptyState}
        />
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title="Host profile review"
        size="lg"
        centered
      >
        {selected && (
          <Stack gap="lg">
            {/* Who and what — identity first, decision last. */}
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap={14} wrap="nowrap">
                <Avatar size={56} src={selected.avatar} name={selected.name} />
                <Stack gap={4} style={{ minWidth: 0 }}>
                  <Text fw={700} fz="lg" lineClamp={1}>
                    {selected.name}
                  </Text>
                  <Group gap={6}>
                    <Badge variant="light">
                      {selected.type === "user_profile" ? "Personal" : "Custom"}
                    </Badge>
                    {selected.isDefault && (
                      <Badge variant="light">Default profile</Badge>
                    )}
                  </Group>
                </Stack>
              </Group>
              <Badge
                size="lg"
                variant="light"
                color={statusColor[selected.approvalStatus]}
              >
                {selected.approvalStatus}
              </Badge>
            </Group>

            <Text fz="sm" c="var(--fj-text-secondary)" lh={1.6}>
              {selected.description || "No description provided."}
            </Text>

            <Divider />

            <Flex gap="lg" wrap="wrap">
              <Fact
                label="Owner"
                value={
                  <Anchor
                    fz="sm"
                    fw={600}
                    onClick={() =>
                      router.push(`/user-management/${selected.userId}`)
                    }
                  >
                    {selected.ownerName || `User #${selected.userId}`}
                  </Anchor>
                }
              />
              <Fact
                label="Contact"
                value={selected.ownerEmail || "No email on file"}
              />
              <Fact label="Events hosted" value={selected.eventsHosted} />
              <Fact
                label="Created"
                value={formatDateTime(selected.created_at)}
              />
              {selected.address?.city && (
                <Fact
                  label="Based in"
                  value={[selected.address.city, selected.address.country]
                    .filter(Boolean)
                    .join(", ")}
                />
              )}
              {selected.website && (
                <Fact
                  label="Website"
                  value={
                    <Anchor
                      href={selected.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      fz="sm"
                      fw={600}
                    >
                      {selected.website}
                    </Anchor>
                  }
                />
              )}
              {selected.approvedByName && (
                <Fact
                  label="Reviewed by"
                  value={`${selected.approvedByName}${
                    selected.approvedAt
                      ? ` · ${formatDateTime(selected.approvedAt)}`
                      : ""
                  }`}
                />
              )}
            </Flex>

            {selected.socialMedia &&
              Object.keys(selected.socialMedia).length > 0 && (
                <Group gap={6}>
                  {Object.entries(selected.socialMedia).map(
                    ([network, handle]) => (
                      <Badge key={network} variant="light">
                        {network}: {handle}
                      </Badge>
                    ),
                  )}
                </Group>
              )}

            {selected.approvalStatus === "rejected" &&
              selected.rejectionReason && (
                <Stack
                  gap={4}
                  p="sm"
                  style={{
                    borderRadius: "var(--fj-radius-input)",
                    background: "rgba(255, 135, 135, 0.08)",
                  }}
                >
                  <Text fz={11} c="var(--fj-text-muted)">
                    Why this was rejected
                  </Text>
                  <Text fz="sm">{selected.rejectionReason}</Text>
                </Stack>
              )}

            <Divider />

            {/* Decision. The reason box only appears once rejection is chosen,
                so the common case — approve — is a single click. */}
            {isRejecting ? (
              <Stack gap="sm">
                <Textarea
                  label="Reason for rejection"
                  description="The owner sees this, so say what would make the profile acceptable."
                  placeholder="e.g. This reads as ticket resale rather than a host identity."
                  value={reason}
                  onChange={(event) => setReason(event.currentTarget.value)}
                  minRows={3}
                  autosize
                />
                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="subtle"
                    color="gray"
                    onClick={() => setIsRejecting(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="red"
                    disabled={!reason.trim()}
                    loading={reject.isPending}
                    onClick={() =>
                      reject.mutate({
                        id: selected.id,
                        rejectionReason: reason.trim(),
                      })
                    }
                  >
                    Confirm rejection
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Group justify="space-between">
                <Text c="var(--fj-text-muted)" fz="xs" maw={280}>
                  {selected.approvalStatus === "pending"
                    ? "Approving lets this profile host events under its own name."
                    : selected.approvalStatus === "approved"
                      ? "This profile is live. Rejecting it takes it out of use."
                      : "This profile is rejected and cannot host events."}
                </Text>
                <Group gap="sm">
                  {selected.approvalStatus !== "rejected" && (
                    <Button
                      variant="light"
                      color="red"
                      onClick={() => setIsRejecting(true)}
                    >
                      Reject…
                    </Button>
                  )}
                  {selected.approvalStatus !== "approved" && (
                    <Button
                      color="teal"
                      loading={approve.isPending}
                      onClick={() => approve.mutate(selected.id)}
                    >
                      Approve profile
                    </Button>
                  )}
                </Group>
              </Group>
            )}
          </Stack>
        )}
      </Modal>
    </AppLayout>
  );
}
