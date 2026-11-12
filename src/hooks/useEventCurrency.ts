import { useQuery } from "@tanstack/react-query";
import { GetEventBudget } from "@/services/api";
import { retryUnlessUnavailable } from "@/utils";

/**
 * The currency an event's own figures (budget, flat discounts) are in.
 *
 * The event record does not carry one; its budget does. The query shares the
 * Budget tab's cache key, so this costs at most one request per event however
 * many panels ask. `undefined` until it loads, which `formatMoney` reads as
 * the platform default.
 */
export const useEventCurrency = (eventId: string): string | undefined => {
  const { data } = useQuery({
    queryKey: ["admin-event-budget", eventId],
    queryFn: () => GetEventBudget(eventId),
    enabled: Boolean(eventId),
    retry: retryUnlessUnavailable,
  });

  return data?.data?.currency;
};
