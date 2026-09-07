"use client";

import { Badge, Stack, Table, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { GetEventTasks } from "@/services/api";
import { TaskStatus } from "@/services/api/event-ops/event-ops.types";
import PpTable from "../../blocks/table";
import StatBar from "../../blocks/stat-bar";
import { TableSkeleton } from "../../elements/skeletons";
import {
  asList,
  formatDateTime,
  formatStatusLabel,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";
import { IconNoTasks } from "@/config/icons";
import { mockEventTasks } from "@/mocks";

const tableHeaders = [
  "Task",
  "Assignee",
  "Created by",
  "Deadline",
  "Status",
];

const taskEmptyState = {
  title: "No tasks yet",
  description: "Tasks the host or co-planners create will appear here.",
  icon: IconNoTasks,
};

const statusColor: Record<TaskStatus, string> = {
  pending: "gray",
  in_progress: "blue",
  completed: "teal",
  overdue: "red",
  cancelled: "dark",
};

/** Mirrors the Task Tracker screen the host and co-planners share in the app. */
const Tasks = ({ eventId }: { eventId: string }) => {
  const { data, isFetching, error } = useQuery({
    queryKey: ["admin-event-tasks", eventId],
    queryFn: () => GetEventTasks(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  // No admin task route yet — the tab previews with a sample task list.
  const isSample = isEndpointUnavailable(error);
  const tasks = isSample ? mockEventTasks : asList(data?.data);

  const counts = tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const rows = tasks.map((task) => (
    <Table.Tr key={task.id}>
      <Table.Td>
        <Text fw={600}>{task.title}</Text>
        {task.description && (
          <Text c="var(--fj-text-muted)" fz="xs" lineClamp={1}>
            {task.description}
          </Text>
        )}
      </Table.Td>
      <Table.Td>{task.assigneeName || "Unassigned"}</Table.Td>
      <Table.Td>{task.createdByName || "—"}</Table.Td>
      <Table.Td>{formatDateTime(task.deadline, "No deadline")}</Table.Td>
      <Table.Td>
        <Badge variant="light" color={statusColor[task.status]}>
          {formatStatusLabel(task.status)}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  if (isFetching && !isSample) return <TableSkeleton />;

  return (
    <Stack gap="xl">
      <StatBar
        minCellWidth={120}
        items={(Object.keys(statusColor) as TaskStatus[]).map((status) => ({
          label: formatStatusLabel(status),
          value: counts[status] || 0,
        }))}
      />

      <PpTable
        headers={tableHeaders}
        rowData={rows}
        showPagination={false}
        isLoading={isFetching && !isSample}
        emptyState={taskEmptyState}
      />
    </Stack>
  );
};

export default Tasks;
