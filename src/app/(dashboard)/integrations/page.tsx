"use client";

import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { AppLayout } from "@/layout";
import {
  CreateIntegrationBusiness,
  GetIntegrationBusinesses,
  UpdateIntegrationBusiness,
} from "@/services/api";
import { asList } from "@/utils";

function statusColor(status: string) {
  if (status === "active") return "teal";
  if (status === "suspended") return "yellow";
  return "red";
}

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      name: "",
      slug: "",
      legalName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
    validate: {
      name: (value) => (value.trim() ? null : "Business name is required"),
      slug: (value) =>
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? null
          : "Use lowercase letters, numbers, and hyphens",
      contactEmail: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email",
    },
  });

  const businessesQuery = useQuery({
    queryKey: ["integration-businesses"],
    queryFn: GetIntegrationBusinesses,
  });

  const createBusiness = useMutation({
    mutationFn: CreateIntegrationBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration-businesses"] });
      form.reset();
      close();
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "active" | "suspended";
    }) => UpdateIntegrationBusiness(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["integration-businesses"] }),
  });

  const businesses = asList(businessesQuery.data?.data);

  return (
    <AppLayout
      title="External Integrations"
      subTitle="Manage businesses connected to the Faajii platform."
      action={<Button onClick={open}>Add integration</Button>}
    >
      <Grid>
        {businesses.map((business) => {
          const nextStatus =
            business.status === "active" ? "suspended" : "active";
          const actionLabel =
            business.status === "active" ? "Suspend access" : "Restore access";

          return (
            <Grid.Col key={business.id} span={{ base: 12, md: 6, xl: 4 }}>
              <Card radius="lg" padding="lg" h="100%">
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={2}>
                      <Text fw={700} fz="lg">
                        {business.name}
                      </Text>
                      <Text c="var(--fj-text-muted)" fz="sm">
                        {business.businessId}
                      </Text>
                    </Stack>
                    <Badge color={statusColor(business.status)} variant="light">
                      {business.status}
                    </Badge>
                  </Group>

                  <Stack gap={4}>
                    <Text fz="sm">{business.contactEmail}</Text>
                    <Text fz="sm" c="var(--fj-text-muted)">
                      /{business.slug}
                    </Text>
                  </Stack>

                  <Button
                    variant="light"
                    color={nextStatus === "active" ? "teal" : "yellow"}
                    loading={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate({
                        id: business.id,
                        status: nextStatus,
                      })
                    }
                  >
                    {actionLabel}
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>

      {!businessesQuery.isLoading && businesses.length === 0 && (
        <Card radius="lg" p="xl">
          <Text ta="center" c="var(--fj-text-muted)">
            No external integrations have been added.
          </Text>
        </Card>
      )}

      <Modal opened={opened} onClose={close} title="Add external integration">
        <form
          onSubmit={form.onSubmit((values) =>
            createBusiness.mutate({
              ...values,
              legalName: values.legalName || undefined,
              contactName: values.contactName || undefined,
              contactPhone: values.contactPhone || undefined,
            }),
          )}
        >
          <Stack>
            <TextInput
              label="Business name"
              placeholder="Acme Events"
              {...form.getInputProps("name")}
              onChange={(event) => {
                const name = event.currentTarget.value;
                form.setFieldValue("name", name);
                if (!form.isTouched("slug")) {
                  form.setFieldValue(
                    "slug",
                    name
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
                }
              }}
            />
            <TextInput label="Slug" {...form.getInputProps("slug")} />
            <TextInput
              label="Legal name"
              {...form.getInputProps("legalName")}
            />
            <TextInput
              label="Contact name"
              {...form.getInputProps("contactName")}
            />
            <TextInput
              label="Contact email"
              {...form.getInputProps("contactEmail")}
            />
            <TextInput
              label="Contact phone"
              {...form.getInputProps("contactPhone")}
            />
            {createBusiness.isError && (
              <Text c="red" fz="sm">
                Unable to create this integration. Check the details and try
                again.
              </Text>
            )}
            <Flex justify="flex-end" gap="sm">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={createBusiness.isPending}>
                Add integration
              </Button>
            </Flex>
          </Stack>
        </form>
      </Modal>
    </AppLayout>
  );
}
