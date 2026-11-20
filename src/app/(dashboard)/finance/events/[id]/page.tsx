"use client";

import { EventFinance } from "@/components";
import { AppLayout } from "@/layout";
import { GetEventDetails } from "@/services/api";
import type { EventDetails } from "@/services/api/event/event.types";
import { Anchor, Group } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

/** One event's money, outside the event screen — linked from the revenue tables. */
export default function FinanceEventPage() {
  const { id } = useParams<{ id: string }>();

  const eventQuery = useQuery({
    queryKey: ["admin-event-overview", id],
    queryFn: () => GetEventDetails(id, "event"),
    enabled: Boolean(id),
  });

  return (
    <AppLayout
      title="Event revenue"
      subTitle={
        (eventQuery.data?.data as EventDetails | undefined)?.name ||
        "Loading event"
      }
      hasBackButton
    >
      <Group mb="lg">
        <Anchor component={Link} href={`/event-management/${id}`} fz="sm">
          Open event details
        </Anchor>
      </Group>
      <EventFinance eventId={id} />
    </AppLayout>
  );
}
