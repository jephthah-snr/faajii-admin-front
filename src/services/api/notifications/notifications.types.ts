/**
 * Push notifications. The app registers FCM tokens via
 * `/v1/notifications/register-token` and can fire a self-test toast; the admin
 * needs the other half — who is reachable, what was sent, and the ability to
 * broadcast.
 */

export type DeviceType = "ios" | "android";

export interface AdminPushToken {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  deviceType: DeviceType;
  deviceId: string | null;
  appVersion: string | null;
  isActive: boolean;
  lastSeenAt: string | null;
  created_at: string;
}

export interface AdminPushTokenStats {
  totalDevices: number;
  activeDevices: number;
  ios: number;
  android: number;
  /** Devices that have not checked in for 30 days. */
  staleDevices: number;
}

export type BroadcastStatus =
  | "draft"
  | "queued"
  | "sending"
  | "sent"
  | "failed";

export type BroadcastAudience =
  | "all"
  | "ios"
  | "android"
  | "event_attendees"
  | "event_hosts";

export interface AdminBroadcast {
  id: number;
  title: string;
  message: string;
  audience: BroadcastAudience;
  /** Set when `audience` targets a single event. */
  eventId: number | null;
  eventName: string | null;
  deepLink: string | null;
  status: BroadcastStatus;
  recipientCount: number;
  deliveredCount: number;
  failedCount: number;
  createdByName: string | null;
  scheduledFor: string | null;
  sentAt: string | null;
  created_at: string;
}

export interface CreateBroadcastPayload {
  title: string;
  message: string;
  audience: BroadcastAudience;
  eventId?: number;
  deepLink?: string;
  /** ISO timestamp; omit to send immediately. */
  scheduledFor?: string;
}

export interface BroadcastFilters {
  page: number;
  limit: number;
  search?: string;
  status?: BroadcastStatus;
}
