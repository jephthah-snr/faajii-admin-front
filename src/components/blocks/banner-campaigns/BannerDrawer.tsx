"use client";

import {
  Button,
  Drawer,
  Flex,
  Image,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CreateBannerCampaign,
  GetEvents,
  UpdateBannerCampaign,
} from "@/services/api";
import type {
  BannerCampaign,
  BannerCampaignInput,
} from "@/services/api/banner-campaigns/banner-campaign.types";
import { asList, getApiErrorMessage } from "@/utils";
import classes from "@/styles/General.module.css";

interface FormValues {
  imageUrl: string;
  eventId: string | null;
  expiresAt: Date | null;
  isActive: boolean;
}

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const fromBanner = (banner: BannerCampaign): FormValues => {
  const expires = banner.expiresAt ? new Date(banner.expiresAt) : null;
  return {
    imageUrl: banner.imageUrl,
    eventId: banner.eventId ? String(banner.eventId) : null,
    expiresAt: expires && !Number.isNaN(expires.getTime()) ? expires : null,
    isActive: banner.isActive,
  };
};

const blank: FormValues = {
  imageUrl: "",
  eventId: null,
  expiresAt: null,
  isActive: true,
};

const BannerForm = ({
  banner,
  onClose,
}: {
  banner: BannerCampaign | null;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(banner);
  const [eventSearch, setEventSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(eventSearch, 300);

  const form = useForm<FormValues>({
    initialValues: banner ? fromBanner(banner) : blank,
    validate: {
      imageUrl: (value) =>
        isHttpUrl(value) ? null : "Enter a full image link (https://…)",
    },
  });

  const eventsQuery = useQuery({
    queryKey: ["admin-banner-event-options", debouncedSearch],
    queryFn: () => GetEvents("1", "20", debouncedSearch || undefined),
  });

  const options = asList<{ id: number; name: string }>(
    eventsQuery.data?.data?.data,
  ).map((event) => ({ value: String(event.id), label: event.name }));

  // Keep the event this banner already points at selectable even when it is
  // not in the current search results.
  if (
    form.values.eventId &&
    !options.some((option) => option.value === form.values.eventId)
  ) {
    options.unshift({
      value: form.values.eventId,
      label: `Event #${form.values.eventId}`,
    });
  }

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: BannerCampaignInput = {
        imageUrl: values.imageUrl.trim(),
        eventId: values.eventId ? Number(values.eventId) : null,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
        isActive: values.isActive,
      };
      return banner
        ? UpdateBannerCampaign(banner.id, payload)
        : CreateBannerCampaign(payload);
    },
    onSuccess: () => {
      notifications.show({
        color: "teal",
        message: isEdit ? "Banner updated" : "Banner created",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-banner-campaigns"] });
      onClose();
    },
    onError: (error) =>
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Couldn't save this banner"),
      }),
  });

  const previewUrl = isHttpUrl(form.values.imageUrl)
    ? form.values.imageUrl.trim()
    : null;

  return (
    <form
      onSubmit={form.onSubmit((values) => save.mutate(values))}
      style={{ display: "flex", flex: 1, flexDirection: "column" }}
    >
      <Stack gap="lg" pt={16} pb="xl" flex={1}>
        <TextInput
          label="Image link"
          placeholder="Hosted image URL, e.g. https://res.cloudinary.com/…"
          {...form.getInputProps("imageUrl")}
        />
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Banner preview"
            radius="md"
            h={160}
            fit="cover"
          />
        )}

        <Select
          label="Opens event"
          placeholder="Event opened on tap (optional)"
          searchable
          clearable
          data={options}
          nothingFoundMessage="No events found"
          searchValue={eventSearch}
          onSearchChange={setEventSearch}
          filter={({ options: all }) => all}
          value={form.values.eventId}
          onChange={(value) => form.setFieldValue("eventId", value)}
        />

        <DateTimePicker
          label="Expires"
          placeholder="No expiry — runs until turned off"
          clearable
          valueFormat="DD MMM YYYY, hh:mm A"
          {...form.getInputProps("expiresAt")}
        />

        <Switch
          label="Active"
          description="Inactive banners are hidden from the app's home carousel"
          checked={form.values.isActive}
          onChange={(event) =>
            form.setFieldValue("isActive", event.currentTarget.checked)
          }
        />

        {/* Pinned to the bottom of the drawer; stays in view if the form scrolls. */}
        <Flex
          gap="sm"
          justify="flex-end"
          mt="auto"
          pt="md"
          pos="sticky"
          bottom={0}
          style={{ background: "var(--fj-bg)", zIndex: 1 }}
        >
          <Button variant="default" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            className={classes.btnWhite}
            loading={save.isPending}
          >
            {isEdit ? "Save changes" : "Create banner"}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

interface BannerDrawerProps {
  opened: boolean;
  onClose: () => void;
  /** `null` creates a new banner. */
  banner: BannerCampaign | null;
}

/** Mounts the form only while open so each opening starts from fresh values. */
const BannerDrawer = ({ opened, onClose, banner }: BannerDrawerProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isMobile ? "100%" : 520}
      styles={{
        content: { display: "flex", flexDirection: "column" },
        body: { display: "flex", flex: 1, flexDirection: "column" },
      }}
      title={
        <Text fw={700} fz={18}>
          {banner ? "Edit banner" : "New banner"}
        </Text>
      }
    >
      <BannerForm key={banner?.id ?? "new"} banner={banner} onClose={onClose} />
    </Drawer>
  );
};

export default BannerDrawer;
