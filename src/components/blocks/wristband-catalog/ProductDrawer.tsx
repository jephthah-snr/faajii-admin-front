"use client";

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  ColorInput,
  Divider,
  Drawer,
  Flex,
  Group,
  Image,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateAdminWristbandProduct,
  UpdateAdminWristbandProduct,
  UploadAdminWristbandImage,
} from "@/services/api";
import type {
  AdminWristbandProduct,
  WristbandPricing,
  WristbandProductInput,
} from "@/services/api/wristbands/wristband-catalog.types";
import { IconAdd, IconClose, IconUpload } from "@/config/icons";
import { formatMoney, getApiErrorMessage, marketOptions } from "@/utils";
import classes from "@/styles/General.module.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const HEX = /^#[0-9a-fA-F]{6}$/;

interface FormValues {
  name: string;
  code: string;
  description: string;
  images: string[];
  palette: string[];
  minQuantity: number;
  pricing: WristbandPricing[];
  isActive: boolean;
  sortOrder: number;
}

const blank: FormValues = {
  name: "",
  code: "",
  description: "",
  images: [],
  palette: ["#FFFFFF"],
  minQuantity: 1,
  pricing: [{ currency: "XOF", unitPrice: 0, productionCost: 0 }],
  isActive: true,
  sortOrder: 0,
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fromProduct = (product: AdminWristbandProduct): FormValues => ({
  name: product.name,
  code: product.code,
  description: product.description ?? "",
  images: product.images,
  palette: product.palette,
  minQuantity: product.minQuantity,
  pricing: product.pricing.map((row) => ({ ...row })),
  isActive: product.isActive,
  sortOrder: product.sortOrder,
});

interface ProductFormProps {
  onClose: () => void;
  /** `null` creates a new band. */
  product: AdminWristbandProduct | null;
}

/**
 * Creates or edits a wristband the app offers. What is entered here is what
 * creators see: name, photos, colours, price and minimum order. Production
 * cost is the one admin-only field — it is what turns wristband payments
 * (gross) into revenue (net).
 */
const ProductForm = ({ onClose, product }: ProductFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(product);
  const [codeTouched, setCodeTouched] = useState(isEdit);
  const [newColor, setNewColor] = useState("");
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    initialValues: product ? fromProduct(product) : blank,
    validate: {
      name: (value) => (value.trim() ? null : "Give the band a name"),
      code: (value) =>
        isEdit || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
          ? null
          : "Lowercase letters, numbers and dashes only",
      images: (value) => (value.length ? null : "Add at least one photo"),
      palette: (value) => (value.length ? null : "Add at least one colour"),
      minQuantity: (value) =>
        Number.isInteger(value) && value >= 1 ? null : "At least 1",
      pricing: (rows) => {
        if (!rows.length) return "Add a price for at least one region";
        const codes = rows.map((row) => row.currency);
        if (new Set(codes).size !== codes.length)
          return "Each region can only be priced once";
        if (rows.some((row) => !(row.unitPrice > 0)))
          return "Every price must be more than 0";
        if (rows.some((row) => row.productionCost < 0))
          return "Production cost can't be negative";
        return null;
      },
    },
  });

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: WristbandProductInput = {
        code: isEdit ? undefined : values.code,
        name: values.name.trim(),
        description: values.description.trim(),
        images: values.images,
        palette: values.palette,
        minQuantity: values.minQuantity,
        pricing: values.pricing,
        isActive: values.isActive,
        sortOrder: values.sortOrder,
      };
      return product
        ? UpdateAdminWristbandProduct(product.id, payload)
        : CreateAdminWristbandProduct(payload);
    },
    onSuccess: () => {
      notifications.show({
        color: "teal",
        message: isEdit ? "Wristband updated" : "Wristband added to the catalog",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-wristband-products"] });
      onClose();
    },
    onError: (error) =>
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Couldn't save this wristband"),
      }),
  });

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const response = await UploadAdminWristbandImage(file);
        urls.push(response.data.url);
      }
      form.setFieldValue("images", [...form.values.images, ...urls]);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Photo upload failed"),
      });
    } finally {
      setUploading(false);
    }
  };

  const addColor = () => {
    const hex = newColor.trim().toUpperCase();
    if (!HEX.test(hex) || form.values.palette.includes(hex)) return;
    form.setFieldValue("palette", [...form.values.palette, hex]);
    setNewColor("");
  };

  const updatePricing = (index: number, patch: Partial<WristbandPricing>) =>
    form.setFieldValue(
      "pricing",
      form.values.pricing.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    );

  const addRegion = () => {
    const used = new Set(form.values.pricing.map((row) => row.currency));
    const next = marketOptions().find((option) => !used.has(option.value));
    if (!next) return;
    form.setFieldValue("pricing", [
      ...form.values.pricing,
      { currency: next.value, unitPrice: 0, productionCost: 0 },
    ]);
  };

  return (
      <form onSubmit={form.onSubmit((values) => save.mutate(values))}>
        <Stack gap="lg" pb="xl">
          <TextInput
            label="Name"
            description="Shown to creators in the app"
            {...form.getInputProps("name")}
            onChange={(event) => {
              const name = event.currentTarget.value;
              form.setFieldValue("name", name);
              if (!isEdit && !codeTouched)
                form.setFieldValue("code", toSlug(name));
            }}
          />
          <TextInput
            label="Code"
            description={
              isEdit
                ? "The code is fixed once orders exist"
                : "Short unique name the app and orders use. Can't be changed later"
            }
            disabled={isEdit}
            {...form.getInputProps("code")}
            onChange={(event) => {
              setCodeTouched(true);
              form.setFieldValue("code", event.currentTarget.value);
            }}
          />
          <Textarea
            label="Description"
            description="What the band is and what it suits"
            minRows={3}
            autosize
            {...form.getInputProps("description")}
          />

          <Divider label="Photos" labelPosition="left" />
          <Stack gap="xs">
            <Dropzone
              onDrop={uploadFiles}
              accept={IMAGE_MIME_TYPE}
              maxSize={MAX_IMAGE_SIZE}
              loading={uploading}
              onReject={() =>
                notifications.show({
                  color: "red",
                  message: "Photos must be images under 5 MB",
                })
              }
            >
              <Flex align="center" justify="center" gap="sm" mih={80}>
                <IconUpload size={22} color="var(--fj-text-muted)" variant="Linear" />
                <Stack gap={0}>
                  <Text fz="sm">Drop photos here or click to choose</Text>
                  <Text fz="xs" c="var(--fj-text-muted)">
                    The first photo is the cover and the base for mockups
                  </Text>
                </Stack>
              </Flex>
            </Dropzone>
            {typeof form.errors.images === "string" && (
              <Text fz="xs" c="var(--fj-danger)">
                {form.errors.images}
              </Text>
            )}
            {form.values.images.length > 0 && (
              <SimpleGrid cols={3} spacing="xs">
                {form.values.images.map((url, index) => (
                  <Box key={url} pos="relative">
                    <Image
                      src={url}
                      alt={`Wristband photo ${index + 1}`}
                      radius="md"
                      h={96}
                      fit="cover"
                    />
                    {index === 0 ? (
                      <Badge pos="absolute" bottom={6} left={6} size="sm" color="gray">
                        Cover
                      </Badge>
                    ) : (
                      <Button
                        pos="absolute"
                        bottom={6}
                        left={6}
                        size="compact-xs"
                        variant="default"
                        onClick={() =>
                          form.setFieldValue("images", [
                            url,
                            ...form.values.images.filter((u) => u !== url),
                          ])
                        }
                      >
                        Make cover
                      </Button>
                    )}
                    <ActionIcon
                      pos="absolute"
                      top={4}
                      right={4}
                      size="sm"
                      variant="default"
                      aria-label="Remove photo"
                      onClick={() =>
                        form.setFieldValue(
                          "images",
                          form.values.images.filter((u) => u !== url),
                        )
                      }
                    >
                      <IconClose size={14} color="currentColor" variant="Linear" />
                    </ActionIcon>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Stack>

          <Divider label="Colours" labelPosition="left" />
          <Stack gap="xs">
            <Group gap="xs">
              {form.values.palette.map((hex, index) => (
                <Group
                  key={hex}
                  gap={6}
                  px={8}
                  py={4}
                  style={{
                    border: "1px solid var(--fj-border)",
                    borderRadius: 999,
                  }}
                >
                  <Box
                    w={16}
                    h={16}
                    style={{
                      background: hex,
                      borderRadius: "50%",
                      border: "1px solid var(--fj-border)",
                    }}
                  />
                  <Text fz="xs">
                    {hex}
                    {index === 0 ? " · natural" : ""}
                  </Text>
                  {form.values.palette.length > 1 && (
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      aria-label={`Remove ${hex}`}
                      onClick={() =>
                        form.setFieldValue(
                          "palette",
                          form.values.palette.filter((c) => c !== hex),
                        )
                      }
                    >
                      <IconClose size={12} color="currentColor" variant="Linear" />
                    </ActionIcon>
                  )}
                </Group>
              ))}
            </Group>
            <Group gap="xs" align="flex-end" wrap="nowrap">
              <ColorInput
                flex={1}
                size="sm"
                placeholder="#FF4FA0"
                format="hex"
                value={newColor}
                onChange={setNewColor}
                aria-label="New colour"
              />
              <Button
                variant="default"
                h={36}
                onClick={addColor}
                disabled={!HEX.test(newColor.trim())}
                leftSection={<IconAdd size={16} color="currentColor" variant="Linear" />}
              >
                Add colour
              </Button>
            </Group>
            <Text fz="xs" c="var(--fj-text-muted)">
              The first colour is the band&rsquo;s natural colour.
            </Text>
          </Stack>

          <Divider label="Pricing by region" labelPosition="left" />
          <Stack gap="sm">
            {form.values.pricing.map((row, index) => {
              const margin = row.unitPrice - row.productionCost;
              const used = new Set(
                form.values.pricing
                  .filter((_, i) => i !== index)
                  .map((r) => r.currency),
              );
              return (
                <Stack
                  key={`${row.currency}-${index}`}
                  gap="xs"
                  p="sm"
                  style={{
                    border: "1px solid var(--fj-border-subtle)",
                    borderRadius: 12,
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Select
                      aria-label="Region"
                      size="sm"
                      allowDeselect={false}
                      data={marketOptions().map((option) => ({
                        ...option,
                        disabled: used.has(option.value),
                      }))}
                      value={row.currency}
                      onChange={(value) =>
                        value && updatePricing(index, { currency: value })
                      }
                    />
                    {form.values.pricing.length > 1 && (
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label="Remove region"
                        onClick={() =>
                          form.setFieldValue(
                            "pricing",
                            form.values.pricing.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <IconClose size={16} color="currentColor" variant="Linear" />
                      </ActionIcon>
                    )}
                  </Group>
                  <SimpleGrid cols={2} spacing="xs">
                    <NumberInput
                      label="Price per band"
                      min={0}
                      hideControls
                      thousandSeparator=","
                      value={row.unitPrice}
                      onChange={(value) =>
                        updatePricing(index, { unitPrice: Number(value) || 0 })
                      }
                    />
                    <NumberInput
                      label="Production cost"
                      description="Admin only"
                      min={0}
                      hideControls
                      thousandSeparator=","
                      value={row.productionCost}
                      onChange={(value) =>
                        updatePricing(index, {
                          productionCost: Number(value) || 0,
                        })
                      }
                    />
                  </SimpleGrid>
                  {row.unitPrice > 0 && (
                    <Text
                      fz="xs"
                      c={margin < 0 ? "var(--fj-danger)" : "var(--fj-text-muted)"}
                    >
                      Faajii keeps {formatMoney(margin, row.currency)} per band
                      {margin >= 0
                        ? ` (${Math.round((margin / row.unitPrice) * 100)}%)`
                        : " — below cost"}
                    </Text>
                  )}
                </Stack>
              );
            })}
            {typeof form.errors.pricing === "string" && (
              <Text fz="xs" c="var(--fj-danger)">
                {form.errors.pricing}
              </Text>
            )}
            {form.values.pricing.length < marketOptions().length && (
              <Button
                variant="default"
                onClick={addRegion}
                leftSection={<IconAdd size={16} color="currentColor" variant="Linear" />}
              >
                Price another region
              </Button>
            )}
          </Stack>

          <Divider label="Ordering" labelPosition="left" />
          <SimpleGrid cols={2} spacing="xs">
            <NumberInput
              label="Minimum order"
              description="Fewest bands per order"
              min={1}
              allowDecimal={false}
              hideControls
              {...form.getInputProps("minQuantity")}
            />
            <NumberInput
              label="Display order"
              description="Lower shows first"
              min={0}
              allowDecimal={false}
              hideControls
              {...form.getInputProps("sortOrder")}
            />
          </SimpleGrid>
          <Switch
            label="Show in the app"
            description="Hidden bands stay on past orders but can't be ordered"
            checked={form.values.isActive}
            onChange={(event) =>
              form.setFieldValue("isActive", event.currentTarget.checked)
            }
          />

          <Flex gap="sm" justify="flex-end">
            <Button
              variant="default"
              onClick={onClose}
              disabled={save.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={classes.btnWhite}
              loading={save.isPending}
              disabled={uploading}
            >
              {isEdit ? "Save changes" : "Add wristband"}
            </Button>
          </Flex>
        </Stack>
      </form>
  );
};

interface ProductDrawerProps {
  opened: boolean;
  onClose: () => void;
  product: AdminWristbandProduct | null;
}

/**
 * The drawer only mounts its form while open, so every opening starts from the
 * band being edited (or a blank one) without syncing state in an effect.
 */
const ProductDrawer = ({ opened, onClose, product }: ProductDrawerProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isMobile ? "100%" : 560}
      title={
        <Text fw={700} fz={18}>
          {product ? `Edit ${product.name}` : "Add a wristband"}
        </Text>
      }
    >
      <ProductForm key={product?.id ?? "new"} product={product} onClose={onClose} />
    </Drawer>
  );
};

export default ProductDrawer;
