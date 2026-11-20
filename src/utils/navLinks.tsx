import {
  Icon,
  IconBanners,
  IconDashboard,
  IconEvents,
  IconGiftLinks,
  IconHostProfile,
  IconIntegrations,
  IconLogout,
  IconMomo,
  IconNotifications,
  IconOrders,
  IconPromoters,
  IconPurchases,
  IconReach,
  IconReconciliation,
  IconRevenue,
  IconSupport,
  IconTeamSettings,
  IconTransactions,
  IconUsers,
  IconVendors,
  IconVibes,
  IconWallets,
  IconWristbands,
} from "@/config/icons";

export interface NavLink {
  label: string;
  navLink: string;
  icon: Icon;
}

export interface NavSection {
  /** Section heading; `null` renders the links without one. */
  title: string | null;
  links: NavLink[];
}

/**
 * Sidebar structure. Which of these a given admin actually sees is decided by
 * `canAccessRoute` in `@/config/access` — the same map the edge proxy uses — so
 * a link can never appear for a role that would be redirected away from it.
 */
export const navSections: NavSection[] = [
  {
    title: null,
    links: [{ label: "Dashboard", navLink: "/dashboard", icon: IconDashboard }],
  },
  {
    // Everything about money in one place. Revenue is the entry point; event
    // revenue is reached from it, so the two never light up together.
    title: "Finance",
    links: [
      { label: "Revenue", navLink: "/finance", icon: IconRevenue },
      {
        label: "Transactions",
        navLink: "/transactions",
        icon: IconTransactions,
      },
      {
        label: "Reconciliation",
        navLink: "/payment-tracking",
        icon: IconReconciliation,
      },
      { label: "Wallets", navLink: "/wallets", icon: IconWallets },
      { label: "MoMo Accounts", navLink: "/momo-accounts", icon: IconMomo },
    ],
  },
  {
    title: "Events",
    links: [
      { label: "Events", navLink: "/event-management", icon: IconEvents },
      { label: "Promoters", navLink: "/promoters", icon: IconPromoters },
      { label: "Event Reach", navLink: "/event-reach", icon: IconReach },
    ],
  },
  {
    title: "Orders",
    links: [
      { label: "Ticket Purchases", navLink: "/purchases", icon: IconPurchases },
      {
        label: "Wristband Orders",
        navLink: "/wristband-orders",
        icon: IconWristbands,
      },
      {
        label: "Wristband Catalog",
        navLink: "/wristband-catalog",
        icon: IconWristbands,
      },
      {
        label: "Merchandise Orders",
        navLink: "/merchandise-orders",
        icon: IconOrders,
      },
      { label: "Order Tracking", navLink: "/order-management", icon: IconOrders },
      { label: "Gift Links", navLink: "/gift-links", icon: IconGiftLinks },
    ],
  },
  {
    title: "People",
    links: [
      { label: "Users", navLink: "/user-management", icon: IconUsers },
      {
        label: "Host Profiles",
        navLink: "/host-profiles",
        icon: IconHostProfile,
      },
      { label: "KYC Reviews", navLink: "/kyc", icon: IconHostProfile },
      { label: "Vendors", navLink: "/vendor-management", icon: IconVendors },
    ],
  },
  {
    title: "Content & Comms",
    links: [
      { label: "Vibes", navLink: "/vibes", icon: IconVibes },
      {
        label: "Notifications",
        navLink: "/notifications",
        icon: IconNotifications,
      },
      { label: "Banners", navLink: "/banner-campaigns", icon: IconBanners },
      { label: "Support", navLink: "/support", icon: IconSupport },
    ],
  },
  {
    title: "Platform",
    links: [
      {
        label: "Integrations",
        navLink: "/integrations",
        icon: IconIntegrations,
      },
      {
        label: "Team & Roles",
        navLink: "/team-settings",
        icon: IconTeamSettings,
      },
    ],
  },
];

/** Always rendered at the bottom, outside the permission-filtered sections. */
export const logoutLink: NavLink = {
  label: "Logout",
  navLink: "/logout",
  icon: IconLogout,
};
