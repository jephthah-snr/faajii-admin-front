"use client";

import {
  Badge,
  Button,
  Card,
  Group,
  Image,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BannerDrawer, ConfirmationModal, EmptyState } from "@/components";
import { AppLayout } from "@/layout";
import {
  DeleteBannerCampaign,
  GetBannerCampaigns,
  UpdateBannerCampaign,
} from "@/services/api";
import type { BannerCampaign } from "@/services/api/banner-campaigns/banner-campaign.types";
import { IconAdd, IconBanners, IconEdit, IconTrash } from "@/config/icons";
import {
  asList,
  formatDateTime,
  getApiErrorMessage,
  retryUnlessUnavailable,
} from "@/utils";
import classes from "@/styles/General.module.css";

const isExpired = (banner: BannerCampaign) =>
  Boolean(banner.expiresAt) &&
  new Date(banner.expiresAt as string).getTime() < Date.now();

const BannerCard = ({
  banner,
  onEdit,
  onDelete,
  onToggle,
  toggling,
}: {
  banner: BannerCampaign;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (isActive: boolean) => void;
  toggling: boolean;
}) => {
  const expired = isExpired(banner);
  const live = banner.isActive && !expired;
  return (
    <Card radius="lg" p={0} style={{ overflow: "hidden" }}>
      <Image
        src={banner.imageUrl}
        alt={`Banner ${banner.id}`}
        h={160}
        fit="cover"
        style={{ opacity: live ? 1 : 0.5 }}
      />
      <Stack gap="sm" p="md">
        <Group justify="space-between" wrap="nowrap">
          <Badge
            color={live ? "teal" : expired ? "red" : "gray"}
            variant="light"
          >
            {live ? "Live" : expired ? "Expired" : "Off"}
          </Badge>
          <Switch
            checked={banner.isActive}
            disabled={toggling}
            onChange={(event) => onToggle(event.currentTarget.checked)}
            aria-label={`Show banner ${banner.id} in the app`}
          />
        </Group>
        <Stack gap={2}>
          <Text fz="sm">
            {banner.eventId
              ? `Opens event #${banner.eventId}`
              : "Not linked to an event"}
          </Text>
          <Text fz="xs" c="var(--fj-text-muted)">
            {banner.expiresAt
              ? `Expires ${formatDateTime(banner.expiresAt)}`
              : "No expiry"}
          </Text>
        </Stack>
        <Group justify="flex-end" gap="xs">
          <Button
            variant="default"
            size="compact-sm"
            onClick={onDelete}
            leftSection={
              <IconTrash size={14} color="currentColor" variant="Linear" />
            }
          >
            Delete
          </Button>
          <Button
            variant="default"
            size="compact-sm"
            onClick={onEdit}
            leftSection={
              <IconEdit size={14} color="currentColor" variant="Linear" />
            }
          >
            Edit
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Banners on the app's home carousel. The app reads the active, unexpired ones
 * from `GET /v1/carousel/home`; this page manages the same records.
 */
export default function BannerCampaignsPage() {
  const queryClient = useQueryClient();
  const [drawerOpened, drawer] = useDisclosure(false);
  const [confirmOpened, confirm] = useDisclosure(false);
  const [editing, setEditing] = useState<BannerCampaign | null>(null);
  const [deleting, setDeleting] = useState<BannerCampaign | null>(null);

  const bannersQuery = useQuery({
    queryKey: ["admin-banner-campaigns"],
    queryFn: GetBannerCampaigns,
    retry: retryUnlessUnavailable,
  });

  const payload = bannersQuery.data?.data;
  const banners = asList<BannerCampaign>(
    Array.isArray(payload) ? payload : payload?.data,
  )
    .slice()
    .sort((a, b) => b.id - a.id);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-banner-campaigns"] });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      UpdateBannerCampaign(id, { isActive }),
    onSuccess: refresh,
    onError: (error) =>
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Couldn't update this banner"),
      }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => DeleteBannerCampaign(id),
    onSuccess: () => {
      notifications.show({ color: "teal", message: "Banner deleted" });
      refresh();
      confirm.close();
    },
    onError: (error) =>
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Couldn't delete this banner"),
      }),
  });

  const openCreate = () => {
    setEditing(null);
    drawer.open();
  };

  return (
    <AppLayout
      title="Banners"
      subTitle="Home carousel banners shown in the app"
      action={
        <Button
          className={classes.btnWhite}
          onClick={openCreate}
          leftSection={
            <IconAdd size={18} color="currentColor" variant="Linear" />
          }
        >
          New banner
        </Button>
      }
    >
      {bannersQuery.isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} height={300} radius="lg" />
          ))}
        </SimpleGrid>
      ) : bannersQuery.isError ? (
        <Text c="var(--fj-danger)">
          {getApiErrorMessage(bannersQuery.error, "Couldn't load banners")}
        </Text>
      ) : banners.length === 0 ? (
        <EmptyState
          title="No banners yet"
          description="Create a banner and it appears on the app's home carousel."
          icon={IconBanners}
          action={
            <Button className={classes.btnWhite} onClick={openCreate}>
              New banner
            </Button>
          }
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {banners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              toggling={toggle.isPending && toggle.variables?.id === banner.id}
              onToggle={(isActive) =>
                toggle.mutate({ id: banner.id, isActive })
              }
              onEdit={() => {
                setEditing(banner);
                drawer.open();
              }}
              onDelete={() => {
                setDeleting(banner);
                confirm.open();
              }}
            />
          ))}
        </SimpleGrid>
      )}

      <BannerDrawer
        opened={drawerOpened}
        onClose={drawer.close}
        banner={editing}
      />

      <ConfirmationModal
        opened={confirmOpened}
        close={confirm.close}
        type="warning"
        title="Delete this banner?"
        message="It will be removed from the app's home carousel. This can't be undone."
        actions={
          <Group justify="center" gap="sm">
            <Button variant="default" onClick={confirm.close}>
              Cancel
            </Button>
            <Button
              color="red"
              loading={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting.id)}
            >
              Delete
            </Button>
          </Group>
        }
      />
    </AppLayout>
  );
}
