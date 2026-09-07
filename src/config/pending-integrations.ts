/**
 * Every admin module whose screen is built but whose API is not deployed yet.
 *
 * One registry drives three things, so they can never drift: the sample-data
 * banner each screen shows, the `/pending-backend` handover page, and the route
 * list an engineer needs to make a module live. `docs/backend-gaps.md` is the
 * long-form version of the same picture.
 */

export type PendingArea =
  | "Community"
  | "Events"
  | "Event operations"
  | "Commerce"
  | "Money"
  | "Content & comms"
  | "Platform";

export interface PendingIntegration {
  /** Stable id a screen passes to `SampleDataNotice`. */
  key: string;
  feature: string;
  area: PendingArea;
  /** Where the built screen lives. Event tabs point at a sample event. */
  route: string;
  routeLabel: string;
  /** One line on why it is not live — the blocker, not the feature pitch. */
  note: string;
  endpoints: string[];
}

export const pendingIntegrations: PendingIntegration[] = [
  /* -------------------------------- Community ------------------------------ */
  {
    key: "host-profiles",
    feature: "Host profiles",
    area: "Community",
    route: "/host-profiles",
    routeLabel: "Host Profiles",
    note: "The mobile record already carries approvalStatus, approvedBy and rejectionReason — only the admin-scoped route is missing.",
    endpoints: [
      "GET /admin/host-profiles",
      "GET /admin/host-profiles/statistics",
      "GET /admin/host-profiles/:id",
      "PATCH /admin/host-profiles/:id/approve",
      "PATCH /admin/host-profiles/:id/reject",
    ],
  },

  /* --------------------------------- Events -------------------------------- */
  {
    key: "promoters",
    feature: "Promoters",
    area: "Events",
    route: "/promoters",
    routeLabel: "Promoters",
    note: "Promoters and hosts both read this today under their own token (/v1/promoter/*). There is no platform-wide view.",
    endpoints: [
      "GET /admin/promoters",
      "GET /admin/promoters/statistics",
      "GET /admin/promoters/:id",
      "PATCH /admin/promoters/:id/status",
    ],
  },
  {
    key: "event-reach",
    feature: "Event reach",
    area: "Events",
    route: "/event-reach",
    routeLabel: "Event Reach",
    note: "Paid push/email publications are live for hosts on /v1/event/:id/publications; the admin needs the cross-event view.",
    endpoints: [
      "GET /admin/publications",
      "GET /admin/publications/statistics",
      "GET /admin/publications/:reference",
    ],
  },

  /* ---------------------------- Event operations --------------------------- */
  {
    key: "event-check-ins",
    feature: "Check-ins",
    area: "Event operations",
    route: "/event-management",
    routeLabel: "Event → Check-ins",
    note: "The app scans against POST /v1/event/:id/guests/check-in. The admin needs the read side plus a manual override.",
    endpoints: [
      "GET /admin/events/:id/check-ins",
      "GET /admin/events/:id/check-ins/summary",
      "PATCH /admin/events/:id/check-ins/:guestId",
    ],
  },
  {
    key: "event-budget",
    feature: "Event budget",
    area: "Event operations",
    route: "/event-management",
    routeLabel: "Event → Budget",
    note: "Mirrors the host's Budget screen (GET /v1/budget/event/:id).",
    endpoints: ["GET /admin/events/:id/budget"],
  },
  {
    key: "event-tasks",
    feature: "Task tracker",
    area: "Event operations",
    route: "/event-management",
    routeLabel: "Event → Tasks",
    note: "Mirrors the shared task tracker (GET /v1/task-tracker/).",
    endpoints: ["GET /admin/events/:id/tasks"],
  },
  {
    key: "event-sponsors",
    feature: "Event sponsors",
    area: "Event operations",
    route: "/event-management",
    routeLabel: "Event → Sponsors",
    note: "Sponsor logos are public on the event page; removal needs an admin route.",
    endpoints: [
      "GET /admin/events/:id/sponsors",
      "DELETE /admin/events/:id/sponsors/:sponsorId",
    ],
  },
  {
    key: "event-discount-codes",
    feature: "Discount codes",
    area: "Event operations",
    route: "/event-management",
    routeLabel: "Event → Discounts",
    note: "Promo codes exist per event (GET /v1/events/:id/discount-codes); disabling one is an admin action.",
    endpoints: [
      "GET /admin/events/:id/discount-codes",
      "PATCH /admin/events/:id/discount-codes/:codeId",
    ],
  },
  {
    key: "event-wallet",
    feature: "Event purse",
    area: "Event operations",
    route: "/event-management",
    routeLabel: "Event → Purse",
    note: "Funding and vendor payouts run through /v1/event/:id/wallet/*; the admin needs the ledger.",
    endpoints: ["GET /admin/events/:id/wallet"],
  },
  {
    key: "event-coplanners",
    feature: "Co-planners",
    area: "Event operations",
    route: "/event-management",
    routeLabel: "Event → Co-planners",
    note: "The list is live; revoking an invite from the admin is not.",
    endpoints: ["DELETE /admin/events/:id/planners/:coPlannerId"],
  },
  {
    key: "event-promoters",
    feature: "Event promoters",
    area: "Event operations",
    route: "/event-management",
    routeLabel: "Event → Promoters",
    note: "The host's promoter screen, admin-scoped.",
    endpoints: ["GET /admin/events/:id/promotions"],
  },
  {
    key: "event-reach-tab",
    feature: "Event reach (per event)",
    area: "Event operations",
    route: "/event-management",
    routeLabel: "Event → Reach",
    note: "Campaigns bought for one event, plus the interest pool they draw from.",
    endpoints: [
      "GET /admin/events/:id/publications",
      "GET /admin/events/:id/publications/activity",
    ],
  },

  /* -------------------------------- Commerce ------------------------------- */
  {
    key: "order-management",
    feature: "Order tracking",
    area: "Commerce",
    route: "/order-management",
    routeLabel: "Order Tracking",
    note: "Gift orders exist; the admin list and status update route answer 404.",
    endpoints: [
      "GET /admin/order-management",
      "PATCH /admin/gift-orders/:id/status",
    ],
  },
  {
    key: "gift-links",
    feature: "Gift links",
    area: "Commerce",
    route: "/gift-links",
    routeLabel: "Gift Links",
    note: "Weakest of the set — gift links are still device-local in the app (AsyncStorage), so the feature needs a backend before admin visibility means anything.",
    endpoints: [
      "GET /admin/gift-links",
      "GET /admin/gift-links/:id",
      "PATCH /admin/gift-links/:id/status",
    ],
  },

  /* ---------------------------------- Money -------------------------------- */
  {
    key: "payment-tracking",
    feature: "Payment reconciliation",
    area: "Money",
    route: "/payment-tracking",
    routeLabel: "Reconciliation",
    note: "The largest gap: the whole reconciliation queue and its actions are unserved.",
    endpoints: [
      "GET /admin/payment-tracking",
      "GET /admin/payment-tracking/stats",
      "GET /admin/payment-tracking/:id",
      "POST /admin/payment-tracking/:reference/confirm",
      "POST /admin/payment-tracking/:reference/assign-ticket",
      "POST /admin/payment-tracking/:reference/escalate",
      "POST /admin/payment-tracking/:id/resend-rsvp",
      "POST /admin/payment-tracking/:id/resend-webhook",
      "POST /admin/payment-tracking/:id/waive-and-resend",
    ],
  },
  {
    key: "wallets",
    feature: "Wallets",
    area: "Money",
    route: "/wallets",
    routeLabel: "Wallets",
    note: "User wallets and event purses exist per-owner; the platform float view does not.",
    endpoints: ["GET /admin/wallets", "GET /admin/wallets/summary"],
  },
  {
    key: "momo-accounts",
    feature: "MoMo accounts",
    area: "Money",
    route: "/momo-accounts",
    routeLabel: "MoMo Accounts",
    note: "Linking runs on /v1/momo/link/*. GET /v1/momo/providers is already public and feeds the provider filter.",
    endpoints: ["GET /admin/momo/accounts", "PATCH /admin/momo/accounts/:id"],
  },

  /* ----------------------------- Content & comms --------------------------- */
  {
    key: "notification-devices",
    feature: "Push devices",
    area: "Content & comms",
    route: "/notifications",
    routeLabel: "Notifications → Devices",
    note: "The app registers FCM tokens on sign-in; the admin needs the reach side of it.",
    endpoints: [
      "GET /admin/notifications/devices",
      "GET /admin/notifications/devices/statistics",
    ],
  },
  {
    key: "notification-broadcasts",
    feature: "Broadcasts",
    area: "Content & comms",
    route: "/notifications",
    routeLabel: "Notifications → Broadcasts",
    note: "Sending a push to a segment has no route yet.",
    endpoints: [
      "GET /admin/notifications/broadcasts",
      "POST /admin/notifications/broadcasts",
      "PATCH /admin/notifications/broadcasts/:id/cancel",
    ],
  },
  {
    key: "support",
    feature: "Support desk",
    area: "Content & comms",
    route: "/support",
    routeLabel: "Support",
    note: "\"Contact support\" in the app is a set of outbound links with no store — this needs a ticket model, not just a route.",
    endpoints: [
      "GET /admin/support/tickets",
      "GET /admin/support/tickets/:id",
      "POST /admin/support/tickets/:id/messages",
      "PATCH /admin/support/tickets/:id",
      "GET /admin/support/statistics",
    ],
  },

  /* -------------------------------- Platform ------------------------------- */
  {
    key: "roles-permissions",
    feature: "Roles & permissions",
    area: "Platform",
    route: "/team-settings",
    routeLabel: "Team & Roles → Roles",
    note: "The administrator list is live (/admin/all/admins-list); roles, permissions and invites are not.",
    endpoints: [
      "GET /admin/roles",
      "POST /admin/roles",
      "PUT /admin/roles/:id",
      "DELETE /admin/roles/:id",
      "PUT /admin/roles/:id/permissions",
      "GET /admin/permissions",
      "PUT /admin/:adminId/change-role",
      "POST /admin/invite",
    ],
  },
  {
    key: "audit-log",
    feature: "Audit log",
    area: "Platform",
    route: "/team-settings",
    routeLabel: "Team & Roles → Audit log",
    note: "Admin actions are not recorded anywhere queryable yet.",
    endpoints: ["GET /admin/audit-logs"],
  },
];

export const getPendingIntegration = (
  key: string,
): PendingIntegration | undefined =>
  pendingIntegrations.find((integration) => integration.key === key);

/** Registry grouped for the handover page, in the order areas are declared. */
export const pendingIntegrationsByArea = (): {
  area: PendingArea;
  items: PendingIntegration[];
}[] => {
  const areas: PendingArea[] = [];
  pendingIntegrations.forEach((integration) => {
    if (!areas.includes(integration.area)) areas.push(integration.area);
  });
  return areas.map((area) => ({
    area,
    items: pendingIntegrations.filter(
      (integration) => integration.area === area,
    ),
  }));
};
