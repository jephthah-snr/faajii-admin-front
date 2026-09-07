import type {
  IAuditLog,
  IPermission,
  IPermissionGroup,
  IRole,
} from "@/services/api/admin/admin.types";

/** Sample roles, the permission matrix behind them, and recent admin actions. */

const permission = (
  id: number,
  key: string,
  label: string,
  category: string,
): IPermission => ({ id, ref: `perm_${id}`, key, label, category });

export const mockPermissionGroups: IPermissionGroup[] = [
  {
    category: "Community",
    permissions: [
      permission(1, "users.view", "View users", "Community"),
      permission(2, "users.suspend", "Suspend a user", "Community"),
      permission(3, "hosts.approve", "Approve host profiles", "Community"),
      permission(4, "vendors.manage", "Manage vendors", "Community"),
    ],
  },
  {
    category: "Events",
    permissions: [
      permission(5, "events.view", "View events", "Events"),
      permission(6, "events.edit", "Edit an event", "Events"),
      permission(7, "promoters.manage", "Manage promoters", "Events"),
      permission(8, "reach.view", "View reach campaigns", "Events"),
    ],
  },
  {
    category: "Money",
    permissions: [
      permission(9, "transactions.view", "View transactions", "Money"),
      permission(10, "payments.reconcile", "Reconcile a payment", "Money"),
      permission(11, "wallets.view", "View wallets", "Money"),
      permission(12, "payouts.approve", "Approve payouts", "Money"),
    ],
  },
  {
    category: "Platform",
    permissions: [
      permission(13, "team.invite", "Invite an admin", "Platform"),
      permission(14, "roles.manage", "Create and edit roles", "Platform"),
      permission(15, "audit.view", "Read the audit log", "Platform"),
    ],
  },
];

const allPermissions = mockPermissionGroups.flatMap(
  (group) => group.permissions,
);

const permissionsFor = (keys: string[]) =>
  allPermissions.filter((item) => keys.includes(item.key));

export const mockRoles: IRole[] = [
  {
    id: 1,
    ref: "role_super",
    name: "Super admin",
    description: "Full access, including roles and payouts.",
    isDefault: false,
    permissions: allPermissions,
    created_at: "2025-06-01T09:00:00Z",
    updated_at: "2026-08-14T10:20:00Z",
  },
  {
    id: 2,
    ref: "role_ops",
    name: "Operations",
    description: "Runs events, promoters and day-to-day community work.",
    isDefault: true,
    permissions: permissionsFor([
      "users.view",
      "users.suspend",
      "hosts.approve",
      "vendors.manage",
      "events.view",
      "events.edit",
      "promoters.manage",
      "reach.view",
    ]),
    created_at: "2025-06-01T09:05:00Z",
    updated_at: "2026-07-02T11:44:00Z",
  },
  {
    id: 3,
    ref: "role_finance",
    name: "Finance",
    description: "Reconciliation, wallets and payouts.",
    isDefault: false,
    permissions: permissionsFor([
      "transactions.view",
      "payments.reconcile",
      "wallets.view",
      "payouts.approve",
      "reach.view",
    ]),
    created_at: "2025-06-01T09:07:00Z",
    updated_at: "2026-05-19T15:02:00Z",
  },
  {
    id: 4,
    ref: "role_support",
    name: "Support",
    description: "Read-only across community and events, plus the ticket queue.",
    isDefault: false,
    permissions: permissionsFor(["users.view", "events.view", "reach.view"]),
    created_at: "2025-06-01T09:09:00Z",
    updated_at: "2026-04-08T08:30:00Z",
  },
];

export const mockAuditLogs: IAuditLog[] = [
  {
    id: 1,
    adminId: 3,
    adminName: "Ngozi Eze",
    adminRole: "Super admin",
    action: "Approved host profile",
    category: "Community",
    details: "Approved “Abidjan Tech Collective” (hp_5a99)",
    ipAddress: "102.89.44.12",
    created_at: "2026-09-07T08:12:00Z",
  },
  {
    id: 2,
    adminId: 5,
    adminName: "Samuel Ade",
    adminRole: "Finance",
    action: "Confirmed payment",
    category: "Money",
    details: "Marked FJ-PAY-77398 confirmed after bank statement match",
    ipAddress: "197.210.76.4",
    created_at: "2026-09-06T14:21:00Z",
  },
  {
    id: 3,
    adminId: 3,
    adminName: "Ngozi Eze",
    adminRole: "Super admin",
    action: "Suspended gift link",
    category: "Commerce",
    details: "Suspended “Quick cash gifts” (gl_4a92) — suspected resale",
    ipAddress: "102.89.44.12",
    created_at: "2026-09-05T17:38:00Z",
  },
  {
    id: 4,
    adminId: 5,
    adminName: "Samuel Ade",
    adminRole: "Finance",
    action: "Escalated payment",
    category: "Money",
    details: "Escalated FJ-PAY-77320 to Finance for manual review",
    ipAddress: "197.210.76.4",
    created_at: "2026-09-04T09:02:00Z",
  },
  {
    id: 5,
    adminId: 7,
    adminName: "Adaeze Nwosu",
    adminRole: "Operations",
    action: "Disabled discount code",
    category: "Events",
    details: "Disabled EARLYBIRD on Cotonou Beach Countdown (max uses reached)",
    ipAddress: "154.113.20.88",
    created_at: "2026-09-02T00:01:00Z",
  },
  {
    id: 6,
    adminId: 3,
    adminName: "Ngozi Eze",
    adminRole: "Super admin",
    action: "Changed role",
    category: "Platform",
    details: "Moved Adaeze Nwosu from Support to Operations",
    ipAddress: "102.89.44.12",
    created_at: "2026-08-28T12:45:00Z",
  },
  {
    id: 7,
    adminId: 7,
    adminName: "Adaeze Nwosu",
    adminRole: "Operations",
    action: "Rejected host profile",
    category: "Community",
    details: "Rejected “VIP Lagos Tickets” (hp_4b17) — ticket resale",
    ipAddress: "154.113.20.88",
    created_at: "2026-08-22T10:02:00Z",
  },
  {
    id: 8,
    adminId: 5,
    adminName: "Samuel Ade",
    adminRole: "Finance",
    action: "Approved payout",
    category: "Money",
    details: "Approved promoter withdrawal FJ-PRM-WD-8821 (XOF 190,800)",
    ipAddress: "197.210.76.4",
    created_at: "2026-09-03T09:41:00Z",
  },
];
