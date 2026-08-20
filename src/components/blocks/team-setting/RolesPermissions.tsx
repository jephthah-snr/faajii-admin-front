"use client";

import { IconSearch } from "@/config/icons";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Loader,
  rem,
  ScrollArea,
  Table,
  TextInput,
} from "@mantine/core";
import inputClasses from "@/styles/Input.module.css";
import classes from "@/styles/General.module.css";
import { useDisclosure } from "@mantine/hooks";
import { CreateRoleModal, PendingBackend } from "@/components/elements";
import {
  asList,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetRoles,
  GetPermissions,
  UpdateRolePermissions,
} from "@/services/api/admin";
import { IRole } from "@/services/api/admin/admin.types";
import { notifications } from "@mantine/notifications";

const RolesPermissions = () => {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);

  // Fetch roles with their permissions
  const {
    data: rolesData,
    isFetching: isFetchingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: GetRoles,
    retry: retryUnlessUnavailable,
  });

  // Fetch all permissions grouped by category
  const { data: permissionsData, isFetching: isFetchingPermissions } = useQuery(
    {
      queryKey: ["permissions"],
      queryFn: GetPermissions,
      retry: retryUnlessUnavailable,
    },
  );

  const roles: IRole[] = useMemo(() => asList(rolesData?.data), [rolesData]);
  const permissionGroups = useMemo(
    () => asList(permissionsData?.data),
    [permissionsData],
  );

  // Build permission state: { [permissionKey]: { [roleId]: boolean } }
  const [permissionsState, setPermissionsState] = useState<
    Record<string, Record<number, boolean>>
  >({});

  // Initialize permissions state from fetched roles
  useEffect(() => {
    if (!roles.length || !permissionGroups.length) return;

    const state: Record<string, Record<number, boolean>> = {};

    permissionGroups.forEach((group) => {
      group.permissions.forEach((perm) => {
        state[perm.key] = {};
        roles.forEach((role) => {
          const hasPermission = role.permissions?.some(
            (rp) => rp.key === perm.key,
          );
          state[perm.key][role.id] = !!hasPermission;
        });
      });
    });

    setPermissionsState(state);
  }, [roles, permissionGroups]);

  // Update role permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: number;
      permissions: string[];
    }) => UpdateRolePermissions(roleId, { permissions }),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Permissions updated",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to update permissions",
        color: "red",
      });
    },
  });

  const handlePermissionChange = (
    permKey: string,
    roleId: number,
    checked: boolean,
  ) => {
    setPermissionsState((prev) => {
      const updated = {
        ...prev,
        [permKey]: {
          ...prev[permKey],
          [roleId]: checked,
        },
      };

      // Collect all permission keys that are enabled for this role
      const rolePermissions = Object.entries(updated)
        .filter(([, roleMap]) => roleMap[roleId])
        .map(([key]) => key);

      updatePermissionsMutation.mutate({
        roleId,
        permissions: rolePermissions,
      });

      return updated;
    });
  };

  const isLoading = isFetchingRoles || isFetchingPermissions;

  if (isEndpointUnavailable(rolesError)) {
    return (
      <PendingBackend
        feature="Roles & permissions"
        endpoints={[
          "GET /admin/roles",
          "POST /admin/roles",
          "PUT /admin/roles/:id",
          "DELETE /admin/roles/:id",
          "PUT /admin/roles/:id/permissions",
          "GET /admin/permissions",
        ]}
      />
    );
  }

  return (
    <Box>
      {/* Search + Create role */}
      <Flex
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap={10}
        wrap="wrap"
        bg="var(--fj-bg)"
        py={14}
        className="sticky top-14 z-10"
      >
        <TextInput
          placeholder="Search"
          variant="default"
          leftSectionPointerEvents="none"
          classNames={{ input: inputClasses.searchInputAlt }}
          w={{ base: "100%", md: 400 }}
          size="sm"
          radius="md"
          leftSection={
            <IconSearch size={16} color="currentColor" variant="Linear" />
          }
        />

        <Button
          h={38}
          px={14}
          radius="md"
          onClick={open}
          className={classes.btnWhite}
          styles={{ root: { minWidth: 160 } }}
        >
          Create Role
        </Button>
      </Flex>

      {/* Roles & permissions table */}
      <Box>
        {isLoading ? (
          <Flex justify="center" py={40}>
            <Loader size="sm" />
          </Flex>
        ) : (
          <ScrollArea mt={20} pb={20}>
            <Table
              c="white"
              style={{ minWidth: 800, borderCollapse: "separate" }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: rem(250) }}></Table.Th>
                  <Table.Th style={{ width: rem(300) }}></Table.Th>
                  {roles.map((role) => (
                    <Table.Th
                      key={role.id}
                      ta="center"
                      fz={13}
                      fw={500}
                      py={20}
                      style={{ border: "1px solid #171717" }}
                    >
                      {role.name}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {permissionGroups.map((group) => (
                  <>
                    {group.permissions.map((perm, index) => (
                      <Table.Tr key={perm.key}>
                        {/* Only show Category on the first row of the group */}
                        {index === 0 && (
                          <Table.Td
                            rowSpan={group.permissions.length}
                            valign="middle"
                            ta="center"
                            fw={500}
                            fz={14}
                            bg="var(--fj-bg)"
                            pos={{ base: "relative", md: "sticky" }}
                            left={0}
                            style={{
                              minWidth: 184,
                              borderLeft: "1px solid #171717",
                              borderTop:
                                index === 0 ? "1px solid #171717" : "none",
                              borderBottom: "1px solid #171717",
                              zIndex: 2,
                            }}
                          >
                            {group.category}
                          </Table.Td>
                        )}

                        <Table.Td
                          fz={13}
                          py={16}
                          pl={20}
                          bg="var(--fj-bg)"
                          pos={{ base: "relative", md: "sticky" }}
                          left={{ base: 0, md: 186 }}
                          style={{
                            minWidth: 220,
                            borderRight: "1px solid #171717",
                            borderLeft: "1px solid #171717",
                            borderTop:
                              index === 0 ? "1px solid #171717" : "none",
                            borderBottom: "1px solid #171717",
                            zIndex: 2,
                          }}
                        >
                          {perm.label}
                        </Table.Td>

                        {roles.map((role) => (
                          <Table.Td
                            key={role.id}
                            style={{
                              borderRight: "1px solid #171717",
                              borderBottom: "1px solid #171717",
                            }}
                          >
                            <Flex align="center" justify="center">
                              <Checkbox
                                checked={
                                  permissionsState[perm.key]?.[role.id] || false
                                }
                                onChange={(e) => {
                                  handlePermissionChange(
                                    perm.key,
                                    role.id,
                                    e.currentTarget.checked,
                                  );
                                }}
                                classNames={{
                                  input: inputClasses.roleCheckboxInput,
                                }}
                                iconColor="dark.8"
                              />
                            </Flex>
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
                  </>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Box>

      {/* Create role modal */}
      <CreateRoleModal opened={opened} onClose={close} />
    </Box>
  );
};

export default RolesPermissions;
