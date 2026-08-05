import {
  IconBalloon,
  IconLogout,
  IconPieChart,
  IconTransfer,
  IconUser,
  IconUsers3,
  IconDebit,
  IconPlay,
  IconAdmin,
  IconStack,
} from "@/icons";

export const navLinks = [
  {
    label: "Dashboard",
    navLink: "/dashboard",
    icon: IconPieChart,
    permissions: ["super", "admin", "support", "finance"],
  },
  {
    label: "User Management",
    navLink: "/user-management",
    icon: IconUser,
    permissions: ["super", "admin"],
  },
  {
    label: "Event Management",
    navLink: "/event-management",
    icon: IconBalloon,
    permissions: ["super", "admin", "support"],
  },
  {
    label: "Vendor Management",
    navLink: "/vendor-management",
    icon: IconUsers3,
    permissions: ["super", "admin", "support"],
  },
  {
    label: "Vibes",
    navLink: "/vibes",
    icon: IconPlay,
    permissions: ["super", "admin", "support"],
  },
  {
    label: "Purchases",
    navLink: "/purchases",
    icon: IconDebit,
    permissions: ["super", "admin", "finance", "support"],
  },
  {
    label: "Wristband Orders",
    navLink: "/wristband-orders",
    icon: IconStack,
    permissions: ["super", "admin"],
  },
  {
    label: "External Integrations",
    navLink: "/integrations",
    icon: IconAdmin,
    permissions: ["super", "admin"],
  },
  {
    label: "Wallet Transactions",
    navLink: "/transactions",
    icon: IconTransfer,
    permissions: ["super", "admin", "finance"],
  },
  /* {
    label: "Gift Shop",
    navLink: "/gift-shop",
    icon: IconGift,
    permissions: ["super", "support"],
  },
  {
    label: "Party Bundles",
    navLink: "/party-bundles",
    icon: IconStack,
    permissions: ["super", "support"],
  },
  {
    label: "Drinks",
    navLink: "/drinks",
    icon: IconDrink,
    permissions: ["super", "support"],
  },
  {
    label: "Admin",
    navLink: "/admin",
    icon: IconAdmin,
    permissions: ["super"],
  }, */
  {
    label: "Logout",
    navLink: "/logout",
    icon: IconLogout,
    permissions: ["super", "admin", "support", "finance"],
  },
];
