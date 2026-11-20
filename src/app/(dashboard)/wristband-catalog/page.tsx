"use client";

import {
  Badge,
  Box,
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
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState, WristbandProductDrawer } from "@/components";
import { AppLayout } from "@/layout";
import {
  GetAdminWristbandProducts,
  SetAdminWristbandProductActive,
} from "@/services/api";
import type { AdminWristbandProduct } from "@/services/api/wristbands/wristband-catalog.types";
import { mockWristbandProducts } from "@/mocks";
import { IconAdd, IconEdit, IconWristbands } from "@/config/icons";
import {
  asList,
  formatCount,
  formatMoney,
  getApiErrorMessage,
  isEndpointUnavailable,
  marketLabel,
  retryUnlessUnavailable,
} from "@/utils";
import classes from "@/styles/General.module.css";

const ProductCard = ({
  product,
  onEdit,
  onToggle,
  toggling,
}: {
  product: AdminWristbandProduct;
  onEdit: () => void;
  onToggle: (isActive: boolean) => void;
  toggling: boolean;
}) => (
  <Card radius="lg" p={0} style={{ overflow: "hidden" }}>
    {product.images[0] ? (
      <Image
        src={product.images[0]}
        alt={product.name}
        h={160}
        fit="cover"
        style={{ opacity: product.isActive ? 1 : 0.5 }}
      />
    ) : (
      <Box
        h={160}
        style={{
          display: "grid",
          placeItems: "center",
          background: "var(--fj-surface)",
        }}
      >
        <IconWristbands size={36} color="var(--fj-text-muted)" variant="Linear" />
      </Box>
    )}

    <Stack gap="sm" p="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={0} miw={0}>
          <Text fw={700} truncate="end">
            {product.name}
          </Text>
          <Text fz="xs" c="var(--fj-text-muted)">
            {product.code} · min {formatCount(product.minQuantity)}
          </Text>
        </Stack>
        <Switch
          checked={product.isActive}
          disabled={toggling}
          onChange={(event) => onToggle(event.currentTarget.checked)}
          aria-label={`Show ${product.name} in the app`}
        />
      </Group>

      <Stack gap={4}>
        {product.pricing.map((row) => {
          const margin = row.unitPrice - row.productionCost;
          return (
            <Group key={row.currency} justify="space-between" wrap="nowrap">
              <Text fz="xs" c="var(--fj-text-muted)">
                {marketLabel(row.currency)}
              </Text>
              <Text fz="sm" ta="right">
                <Text span fw={700}>
                  {formatMoney(row.unitPrice, row.currency)}
                </Text>
                <Text span c="var(--fj-text-muted)">
                  {" "}
                  · keeps {formatMoney(margin, row.currency)}
                </Text>
              </Text>
            </Group>
          );
        })}
      </Stack>

      <Group gap={6}>
        {product.palette.map((hex) => (
          <Box
            key={hex}
            w={16}
            h={16}
            title={hex}
            style={{
              background: hex,
              borderRadius: "50%",
              border: "1px solid var(--fj-border)",
            }}
          />
        ))}
      </Group>

      <Group justify="space-between">
        <Badge color={product.isActive ? "teal" : "gray"} variant="light">
          {product.isActive ? "In the app" : "Hidden"}
        </Badge>
        <Group gap="xs">
          <Text fz="xs" c="var(--fj-text-muted)">
            {formatCount(product.ordersCount)} orders
          </Text>
          <Button
            variant="default"
            size="compact-sm"
            onClick={onEdit}
            leftSection={<IconEdit size={14} color="currentColor" variant="Linear" />}
          >
            Edit
          </Button>
        </Group>
      </Group>
    </Stack>
  </Card>
);

/**
 * The wristbands creators can order in the app. Whatever is set up here —
 * photos, colours, price, minimum order — is what the app's catalog shows.
 */
export default function WristbandCatalogPage() {
  const queryClient = useQueryClient();
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<AdminWristbandProduct | null>(null);

  const productsQuery = useQuery({
    queryKey: ["admin-wristband-products"],
    queryFn: GetAdminWristbandProducts,
    retry: retryUnlessUnavailable,
  });

  // The catalog routes are not deployed yet, so the screen runs on samples.
  const isSample = isEndpointUnavailable(productsQuery.error);
  const products = (
    isSample ? mockWristbandProducts : asList(productsQuery.data?.data)
  )
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      SetAdminWristbandProductActive(id, isActive),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-wristband-products"] }),
    onError: (error) =>
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Couldn't update this wristband"),
      }),
  });

  const openCreate = () => {
    setEditing(null);
    open();
  };
  const openEdit = (product: AdminWristbandProduct) => {
    setEditing(product);
    open();
  };

  return (
    <AppLayout
      title="Wristband catalog"
      subTitle="The bands creators can order in the app, and what each one earns"
      hasBackButton
      action={
        <Button
          className={classes.btnWhite}
          onClick={openCreate}
          leftSection={<IconAdd size={18} color="currentColor" variant="Linear" />}
        >
          Add wristband
        </Button>
      }
    >
      {productsQuery.isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} height={360} radius="lg" />
          ))}
        </SimpleGrid>
      ) : products.length === 0 ? (
        <EmptyState
          title="No wristbands yet"
          description="Add the first band and it appears in the app's wristband catalog."
          icon={IconWristbands}
          action={
            <Button className={classes.btnWhite} onClick={openCreate}>
              Add wristband
            </Button>
          }
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => openEdit(product)}
              toggling={
                toggle.isPending && toggle.variables?.id === product.id
              }
              onToggle={(isActive) =>
                toggle.mutate({ id: product.id, isActive })
              }
            />
          ))}
        </SimpleGrid>
      )}

      <WristbandProductDrawer
        opened={drawerOpened}
        onClose={close}
        product={editing}
      />
    </AppLayout>
  );
}
