"use client";

import {
  Box,
  Flex,
  TextInput,
  Button,
  rem,
  Table,
  Avatar,
  Text,
  ActionIcon,
  Menu,
  Tabs,
} from "@mantine/core";
import Image from "next/image";
import inputClasses from "@/styles/Input.module.css";
import classes from "@/styles/General.module.css";
import {
  IconEllipsisH,
  IconQuestionmark,
  IconRotate,
  IconSearch,
  IconTrash,
} from "@/icons";
import { AddTeamMemberModal, StatusBadge } from "@/components/elements";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import PpTable from "../table";
import { rowsPerPage } from "@/utils";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetAdmins,
  GetRoles,
  DeleteAdmin,
  SuspendAdmin,
  ChangeAdminRole,
} from "@/services/api/admin";
import { IAdmin } from "@/services/api/admin/admin.types";
import { notifications } from "@mantine/notifications";

const tableHeaders = [
  "Team Member",
  "Phone Number",
  "Email Address",
  "Role",
  "Status",
  "",
];

const Administrators = () => {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [activeRole, setActiveRole] = useState<string>("all");
  const [activePage, setActivePage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [changeRoleAdmin, setChangeRoleAdmin] = useState<IAdmin | null>(null);

  // Fetch admins
  const { data: admins, isFetching: isFetchingAdmins } = useQuery({
    queryKey: ["team-admins", activePage, rowsPerPage, debouncedQuery],
    queryFn: () =>
      GetAdmins(String(activePage), String(rowsPerPage), debouncedQuery),
    placeholderData: (prev) => prev,
  });

  const adminData = useMemo(() => admins?.data?.data || [], [admins]);
  const totalItems = admins?.data?.pagination?.total || 0;

  // Fetch roles for change-role dropdown
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: GetRoles,
  });
  const roles = useMemo(() => rolesData?.data || [], [rolesData]);

  // Suspend mutation
  const suspendMutation = useMutation({
    mutationFn: (id: string) => SuspendAdmin(id),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Admin status updated",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["team-admins"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to update admin",
        color: "red",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => DeleteAdmin(id),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Admin removed successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["team-admins"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to remove admin",
        color: "red",
      });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({ adminId, roleId }: { adminId: number; roleId: number }) =>
      ChangeAdminRole(adminId, { roleId }),
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Admin role updated",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["team-admins"] });
      setChangeRoleAdmin(null);
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to change role",
        color: "red",
      });
    },
  });

  const filteredAdmins = useMemo(() => {
    if (activeRole === "all") return adminData;

    return adminData.filter(
      (admin) =>
        admin.roleName === activeRole ||
        admin.adminRole === activeRole ||
        String(admin.roleId) === activeRole,
    );
  }, [adminData, activeRole]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: adminData.length };

    roles.forEach((role) => {
      counts[role.name] = adminData.filter(
        (admin) =>
          admin.roleName === role.name ||
          admin.adminRole === role.name ||
          admin.roleId === role.id,
      ).length;
    });

    return counts;
  }, [adminData, roles]);

  const rows = filteredAdmins?.map((data) => {
    return (
      <Table.Tr key={data?.id}>
        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              name={
                `${data?.firstName || ""} ${data?.lastName || ""}`.trim() || "U"
              }
              size={30}
              radius="xl"
              alt="avatar"
            />
            <Box maw={180}>
              <Text fz={14} c="#F8F8F8E5" tt="capitalize" truncate="end">
                {`${data?.firstName || ""} ${data?.lastName || ""}`.trim() ||
                  "-"}
              </Text>
            </Box>
          </Flex>
        </Table.Td>

        <Table.Td>{data?.phoneNumber || "N/A"}</Table.Td>

        <Table.Td>{data?.email || "N/A"}</Table.Td>

        <Table.Td>
          <StatusBadge
            status={data?.roleName || data?.adminRole || "Admin"}
            variant="light"
            px={10}
            isTransparent={false}
          />
        </Table.Td>

        <Table.Td>
          <StatusBadge
            status={data?.isSuspended ? "Suspended" : "Active"}
            useAltColor
          />
        </Table.Td>

        <Table.Td>
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="transparent">
                <Image
                  src={IconEllipsisH}
                  alt="icon"
                  style={{ width: "70%", height: "70%" }}
                />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu
                position="right-start"
                trigger="hover"
                openDelay={100}
                closeDelay={200}
              >
                <Menu.Target>
                  <Menu.Item
                    leftSection={<Image src={IconRotate} alt="icon" />}
                    c="#CECECF"
                    ta="left"
                  >
                    Change Role
                  </Menu.Item>
                </Menu.Target>
                <Menu.Dropdown>
                  {roles.map((role) => (
                    <Menu.Item
                      key={role.id}
                      c="#CECECF"
                      ta="left"
                      onClick={() =>
                        changeRoleMutation.mutate({
                          adminId: data.id,
                          roleId: role.id,
                        })
                      }
                    >
                      {role.name}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
              <Menu.Item
                leftSection={<Image src={IconQuestionmark} alt="icon" />}
                c="#B99F2B"
                ta="left"
                onClick={() => suspendMutation.mutate(String(data.id))}
              >
                Suspend
              </Menu.Item>
              <Menu.Item
                leftSection={<Image src={IconTrash} alt="icon" />}
                c="#A94A55"
                ta="left"
                onClick={() => deleteMutation.mutate(String(data.id))}
              >
                Remove User
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      {/* Search + Add team member */}
      <Flex
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap={16}
        wrap="wrap"
        bg="#0A0A0A"
        py={14}
        className="sticky top-14 z-10"
      >
        <TextInput
          placeholder="Search by name, email or role"
          variant="default"
          leftSectionPointerEvents="none"
          classNames={{ input: inputClasses.searchInputAlt }}
          w={{ base: "100%", md: 400 }}
          value={query}
          onChange={(e: any) => setQuery(e.currentTarget.value)}
          size="sm"
          radius="md"
          leftSection={
            <Image
              src={IconSearch}
              alt="icon"
              style={{ width: rem(16), height: rem(16) }}
            />
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
          Add Team Member
        </Button>
      </Flex>

      {/* Team members list */}
      <Tabs
        value={activeRole}
        onChange={(value) => {
          setActiveRole(value || "all");
          setActivePage(1);
        }}
        classNames={{
          list: classes.teamAdminTabList,
          tab: classes.teamAdminTab,
        }}
        mt={10}
      >
        <Box style={{ overflowX: "auto" }}>
          <Tabs.List>
            <Tabs.Tab value="all">
              All <sup>({roleCounts.all || 0})</sup>
            </Tabs.Tab>

            {roles.map((role) => (
              <Tabs.Tab key={role.id} value={role.name}>
                {role.name} <sup>({roleCounts[role.name] || 0})</sup>
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Box>

        <Tabs.Panel value={activeRole}>
          <TeamMemberTable
            data={rows}
            totalItems={totalItems}
            activePage={activePage}
            setActivePage={setActivePage}
            isLoading={isFetchingAdmins}
          />
        </Tabs.Panel>
      </Tabs>

      {/* Add team member modal */}
      <AddTeamMemberModal opened={opened} onClose={close} />
    </Box>
  );
};

export default Administrators;

interface TeamMemberTableProps {
  data: any[];
  totalItems: number;
  activePage: number;
  setActivePage: (page: any) => void;
  isLoading: boolean;
}

const TeamMemberTable = ({
  data,
  totalItems,
  activePage,
  setActivePage,
  isLoading,
}: TeamMemberTableProps) => {
  return (
    <>
      <PpTable
        headers={tableHeaders}
        rowData={data}
        totalItems={totalItems}
        activePage={activePage}
        setActivePage={setActivePage}
        isLoading={isLoading}
        rowsPerPage={rowsPerPage}
        addOnStyle="noRowBorders, lightHeaderBorder"
        mt={-10}
      />

      {/* <PpTable
        headers={tableHeaders}
        rowData={rows}
        totalItems={totalItems}
        activePage={activePage}
        setActivePage={setActivePage}
        isLoading={isFetchingAdmins}
        rowsPerPage={rowsPerPage}
        addOnStyle="noRowBorders"
        mt={20}
      /> */}
    </>
  );
};
