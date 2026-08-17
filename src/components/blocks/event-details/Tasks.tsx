"use client";

import { Badge, Card, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { GetEventTasks } from "@/services/api";
import { TaskStatus } from "@/services/api/event-ops/event-ops.types";
import EmptyState from "../../blocks/empty-state";
import PendingBackend from "../../elements/pending-backend";
import { TableSkeleton } from "../../elements/skeletons";
import {
  asList,
  formatDateTime,
  formatStatusLabel,
  isEndpointUnavailable,
  retryUnlessUnavailable,
} from "@/utils";

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

  if (isEndpointUnavailable(error)) {
    return (
      <PendingBackend
        feature="Task tracker"
        endpoints={["GET /admin/events/:id/tasks"]}
      />
    );
  }

  const tasks = asList(data?.data);

  const counts = tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  if (isFetching) return <TableSkeleton />;

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 2, md: 5 }}>
        {(Object.keys(statusColor) as TaskStatus[]).map((status) => (
          <Card key={status} radius="lg" bg="var(--fj-surface-elevated)" p="md">
            <Text fz="xs" c="var(--fj-text-muted)">
              {formatStatusLabel(status)}
            </Text>
            <Text fz={26} fw={800} mt={4}>
              {counts[status] || 0}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card radius="lg" p={0}>
        <Table.ScrollContainer minWidth={840}>
          <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Task</Table.Th>
                <Table.Th>Assignee</Table.Th>
                <Table.Th>Created by</Table.Th>
                <Table.Th>Deadline</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tasks.map((task) => (
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
                  <Table.Td>
                    {formatDateTime(task.deadline, "No deadline")}
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor[task.status]}>
                      {formatStatusLabel(task.status)}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {tasks.length === 0 && (
          <EmptyState
            title="No tasks yet"
            description="Tasks the host or co-planners create will appear here."
            mb={40}
          />
        )}
      </Card>
    </Stack>
  );
};

export default Tasks;
