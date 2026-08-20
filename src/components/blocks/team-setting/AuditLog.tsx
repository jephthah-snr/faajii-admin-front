"use client";

import {
  Avatar,
  Box,
  Button,
  Flex,
  Menu,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import PpTable from "../table";
import { IconCheck, IconChevronDown, IconChevronUp } from "@/config/icons";
import {
  asList,
  isEndpointUnavailable,
  retryUnlessUnavailable,
  rowsPerPage,
} from "@/utils";
import { DatePicker } from "@mantine/dates";
import { PendingBackend, StatusBadge } from "@/components/elements";
import { useMemo, useState } from "react";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { GetAuditLogs, GetRoles } from "@/services/api/admin";
import { IAuditLogFilters } from "@/services/api/admin/admin.types";

const tableHeaders = [
  "Reference ID",
  "Admin Name",
  "Role",
  "Action taken",
  "Time Stamp",
];

const auditActionFilterOptions = [
  "All",
  "Transactions",
  "Wallet & Payment Tracking",
  "Events & Tickets",
  "Admin Controls",
];

const auditDateFilterOptions = ["All-Time", "Last week", "3 months ago"];

const AuditLog = () => {
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>("All-Time");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [openedPicker, setOpenedPicker] = useState<boolean>(false);
  const [activePage, setActivePage] = useState(1);

  // Fetch roles for role filter
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: GetRoles,
  });

  const roleFilterOptions = useMemo(() => {
    const roleNames = asList(rolesData?.data).map((r) => r.name);
    return ["All", ...roleNames];
  }, [rolesData]);

  // Build API filters
  const apiFilters: IAuditLogFilters = useMemo(() => {
    const filters: IAuditLogFilters = {
      page: String(activePage),
      limit: String(rowsPerPage),
    };

    if (selectedAction !== "All") {
      filters.category = selectedAction;
    }

    if (selectedRole !== "All") {
      filters.role = selectedRole;
    }

    if (selectedDate === "Last week") {
      filters.startDate = dayjs().subtract(7, "day").format("YYYY-MM-DD");
    } else if (selectedDate === "3 months ago") {
      filters.startDate = dayjs().subtract(3, "month").format("YYYY-MM-DD");
    } else if (
      selectedDate !== "All-Time" &&
      selectedDate !== "Last week" &&
      selectedDate !== "3 months ago"
    ) {
      // Custom date
      filters.startDate = selectedDate;
      filters.endDate = dayjs(selectedDate).add(1, "day").format("YYYY-MM-DD");
    }

    return filters;
  }, [selectedAction, selectedRole, selectedDate, activePage]);

  // Fetch audit logs
  const {
    data: auditLogsData,
    isFetching: isFetchingLogs,
    error: auditLogsError,
  } = useQuery({
    queryKey: ["audit-logs", apiFilters],
    queryFn: () => GetAuditLogs(apiFilters),
    placeholderData: (prev) => prev,
    retry: retryUnlessUnavailable,
  });

  const auditData = useMemo(
    () => asList(auditLogsData?.data?.data),
    [auditLogsData],
  );
  const totalItems = auditLogsData?.data?.pagination?.total || 0;

  const rows = auditData?.map((data) => {
    return (
      <Table.Tr key={data?.id}>
        <Table.Td>#{data?.id || "N/A"}</Table.Td>

        <Table.Td>
          <Flex align="center" gap={8}>
            <Avatar
              name={data?.adminName || "U"}
              size={30}
              radius="xl"
              alt="avatar"
            />
            <Box maw={180}>
              <Text fz={14} c="#F8F8F8E5" tt="capitalize" truncate="end">
                {data?.adminName || "-"}
              </Text>
            </Box>
          </Flex>
        </Table.Td>

        <Table.Td>
          <StatusBadge
            status={data?.adminRole}
            variant="light"
            px={10}
            isTransparent={false}
          />
        </Table.Td>

        <Table.Td>{data?.action || "N/A"}</Table.Td>

        <Table.Td c="#767676">
          {data?.created_at
            ? dayjs(data.created_at).format("DD/MM/YYYY; hh:mm A")
            : "N/A"}
        </Table.Td>
      </Table.Tr>
    );
  });

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setCustomDate(date);
    setSelectedDate(dayjs(date).format("YYYY-MM-DD"));
    setOpenedPicker(false);
  };

  if (isEndpointUnavailable(auditLogsError)) {
    return (
      <PendingBackend
        feature="Audit log"
        endpoints={["GET /admin/audit-logs"]}
      />
    );
  }

  return (
    <Flex direction="column" gap={20}>
      <Box bg="var(--fj-bg)" py={10} className="sticky top-14 z-10">
        <ScrollArea.Autosize scrollbarSize={0}>
          <Flex align="center" gap={10}>
            <AuditLogFilter label="Action Taken" value={selectedAction}>
              <>
                {auditActionFilterOptions.map((action) => {
                  const isSelected = selectedAction === action;
                  return (
                    <Menu.Item
                      key={action}
                      ta="left"
                      px={0}
                      c={isSelected ? "#FFFFFF" : "#AAAAAA"}
                      onClick={() => {
                        setSelectedAction(action);
                        setActivePage(1);
                      }}
                      rightSection={
                        isSelected ? (
                          <IconCheck size={16} color="currentColor" variant="Linear" />
                        ) : null
                      }
                    >
                      {action}
                    </Menu.Item>
                  );
                })}
              </>
            </AuditLogFilter>

            <AuditLogFilter label="Role" value={selectedRole}>
              <>
                {roleFilterOptions.map((role) => {
                  const isSelected = selectedRole === role;

                  return (
                    <Menu.Item
                      key={role}
                      ta="left"
                      px={0}
                      c={isSelected ? "#FFFFFF" : "#AAAAAA"}
                      onClick={() => {
                        setSelectedRole(role);
                        setActivePage(1);
                      }}
                      rightSection={
                        isSelected ? (
                          <IconCheck size={16} color="currentColor" variant="Linear" />
                        ) : null
                      }
                    >
                      {role}
                    </Menu.Item>
                  );
                })}
              </>
            </AuditLogFilter>

            <AuditLogFilter
              label="Date"
              value={selectedDate}
              onClose={() => setOpenedPicker(false)}
            >
              <>
                {auditDateFilterOptions.map((action) => {
                  const isSelected = selectedDate === action;
                  return (
                    <Menu.Item
                      key={action}
                      ta="left"
                      px={0}
                      c={isSelected ? "#FFFFFF" : "#AAAAAA"}
                      onClick={() => {
                        setSelectedDate(action);
                        setCustomDate(null);
                        setActivePage(1);
                      }}
                      rightSection={
                        isSelected ? (
                          <IconCheck size={16} color="currentColor" variant="Linear" />
                        ) : null
                      }
                    >
                      {action}
                    </Menu.Item>
                  );
                })}

                <Box pos="relative">
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={16}
                    mb={6}
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenedPicker((prev) => !prev)}
                  >
                    <Text c="#FFFFFF" fz={13}>
                      Pick a Custom Date
                    </Text>
                    <IconChevronUp size={16} color="currentColor" variant="Linear" />
                  </Flex>

                  {openedPicker && (
                    <Box
                      pos="absolute"
                      top={{ base: 0, md: -176 }}
                      left={{ base: -100, md: 190 }}
                      bg="var(--fj-surface)"
                      className="rounded-[12px]"
                      p={6}
                    >
                      <DatePicker
                        value={customDate}
                        maxDate={new Date()}
                        classNames={{ day: inputClasses.day }}
                        onChange={handleDateChange}
                      />
                    </Box>
                  )}
                </Box>
              </>
            </AuditLogFilter>
          </Flex>
        </ScrollArea.Autosize>
      </Box>

      <PpTable
        headers={tableHeaders}
        rowData={rows}
        totalItems={totalItems}
        activePage={activePage}
        setActivePage={setActivePage}
        isLoading={isFetchingLogs}
        rowsPerPage={rowsPerPage}
        addOnStyle="noRowBorders, lightHeaderBorder"
        mt={-10}
      />
    </Flex>
  );
};

export default AuditLog;

interface AuditLogFilterProps {
  label: string;
  value: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const AuditLogFilter = ({
  label,
  value,
  children,
  onClose,
}: AuditLogFilterProps) => {
  return (
    <Menu
      classNames={{ arrow: classes.filterMenuArrow }}
      shadow="md"
      width={200}
      position="bottom-start"
      onClose={onClose}
      withArrow
    >
      <Menu.Target>
        <Button
          size="sm"
          h={36}
          style={{ border: "1px solid #181818" }}
          color="#0D0D0D"
          radius={6}
          miw="fit-content"
          px={8}
        >
          <Flex align="center" justify="space-between" gap={10}>
            <Text fz={13} c="#868686">
              {label !== "Action Taken" ? `By ${label}` : label}:
            </Text>
            <Flex align="center" gap={4}>
              <Text fz={13}>{value || "All"}</Text>
              <IconChevronDown size={20} color="currentColor" variant="Linear" />
            </Flex>
          </Flex>
        </Button>
      </Menu.Target>

      <Menu.Dropdown bg="var(--fj-surface-elevated)">
        <Flex direction="column" p={4} gap={12}>
          <Flex align="center" justify="space-between" gap={12}>
            <Text fz={12} c="#868686">
              Filter by {label}:
            </Text>
          </Flex>

          {children}
        </Flex>
      </Menu.Dropdown>
    </Menu>
  );
};
