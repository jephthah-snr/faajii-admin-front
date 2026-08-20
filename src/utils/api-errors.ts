import { AxiosError } from "axios";

/**
 * Several admin modules are built ahead of their backend routes. When the API
 * answers 404/501 for a whole collection endpoint the feature isn't wired up
 * yet — that is a deployment gap, not an error the operator caused, so the UI
 * says so instead of showing a generic failure.
 */
export const isEndpointUnavailable = (error: unknown): boolean => {
  const status = (error as AxiosError)?.response?.status;
  return status === 404 || status === 501;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  const data = (error as AxiosError<{ message?: string | string[] }>)?.response
    ?.data;
  const message = data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;

  // Without this, a missing route surfaces as a generic failure and looks like
  // the operator did something wrong.
  if (isEndpointUnavailable(error)) {
    return "This action isn't available yet — the backend endpoint is not deployed.";
  }

  return fallback;
};

/**
 * React Query retries 404s pointlessly for modules awaiting backend work.
 * Use as `retry: retryUnlessUnavailable`.
 */
export const retryUnlessUnavailable = (
  failureCount: number,
  error: unknown,
): boolean => {
  if (isEndpointUnavailable(error)) return false;
  return failureCount < 2;
};

/**
 * Narrows an API field to a list.
 *
 * Endpoints occasionally answer with a different envelope than the type says —
 * a paginated object where a bare array was expected, or `null` on an empty
 * result. `?.data || []` does not catch those, and the resulting `.map is not a
 * function` takes the whole page down. This does.
 */
// Overloaded so a well-typed field keeps its element type — only genuinely
// unknown input falls back to the widened form.
export function asList<T>(value: T[] | null | undefined): T[];
export function asList<T = unknown>(value: unknown): T[];
export function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
