/**
 * Single source of truth for admin route access.
 *
 * Both the navigation sidebar and the edge proxy read from this file so the
 * menu a user sees and the routes they can actually reach can never drift
 * apart. `permission` is the value returned by `POST /admin/signin` and mirrored
 * into the `faajiiAdminUserPermission` cookie.
 */

export type AdminPermission = "super" | "admin" | "finance" | "support";

export const ADMIN_PERMISSIONS: AdminPermission[] = [
  "super",
  "admin",
  "finance",
  "support",
];

/** Every admin section, with the roles allowed to open it. */
export interface RouteAccess {
  /** Route prefix. Nested paths inherit the parent's access. */
  path: string;
  roles: AdminPermission[] | "*";
}

export const routeAccess: RouteAccess[] = [
  { path: "/dashboard", roles: "*" },

  // Community
  { path: "/user-management", roles: ["super", "admin", "support"] },
  { path: "/host-profiles", roles: ["super", "admin", "support"] },
  { path: "/vendor-management", roles: ["super", "admin", "support"] },

  // Events — check-ins, budget, tasks, sponsors and discount codes live as
  // tabs inside an event, so they inherit this rule.
  { path: "/event-management", roles: ["super", "admin", "support"] },

  // Commerce
  { path: "/purchases", roles: ["super", "admin", "finance", "support"] },
  { path: "/order-management", roles: ["super", "admin", "support"] },
  { path: "/wristband-orders", roles: ["super", "admin", "support"] },
  { path: "/gift-links", roles: ["super", "admin", "support"] },

  // Money
  { path: "/transactions", roles: ["super", "admin", "finance"] },
  { path: "/payment-tracking", roles: ["super", "admin", "finance"] },
  { path: "/wallets", roles: ["super", "admin", "finance"] },
  { path: "/momo-accounts", roles: ["super", "admin", "finance"] },

  // Content & comms
  { path: "/vibes", roles: ["super", "admin", "support"] },
  { path: "/notifications", roles: ["super", "admin", "support"] },
  { path: "/support", roles: ["super", "admin", "support"] },

  // Platform
  { path: "/integrations", roles: ["super", "admin"] },
  { path: "/team-settings", roles: ["super", "admin"] },
];

/** Where a role lands when it hits something it may not open. */
export const fallbackRoute: Record<AdminPermission, string> = {
  super: "/dashboard",
  admin: "/dashboard",
  finance: "/transactions",
  support: "/user-management",
};

const normalise = (value?: string | null): AdminPermission =>
  ADMIN_PERMISSIONS.includes(value as AdminPermission)
    ? (value as AdminPermission)
    : "support";

/**
 * Longest-prefix match, so `/event-management/42` inherits the access rule
 * declared for `/event-management`.
 */
export const canAccessRoute = (
  pathname: string,
  permission?: string | null,
): boolean => {
  const role = normalise(permission);

  const match = routeAccess
    .filter(
      (route) =>
        pathname === route.path || pathname.startsWith(`${route.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];

  // Unknown routes are not gated here — Next renders its own 404 for them.
  if (!match) return true;

  return match.roles === "*" || match.roles.includes(role);
};

export const getFallbackRoute = (permission?: string | null): string =>
  fallbackRoute[normalise(permission)];
