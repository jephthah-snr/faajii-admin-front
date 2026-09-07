import { FilterItem } from "./types";

export const userManagementFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Pending", "Active", "Suspended"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Active Events",
    apiKey: "activeEvent",
    items: ["On", "Off"],
    transform: (v) => (v?.toLowerCase() === "on" ? "yes" : "no"),
  },
  {
    title: "Date Joined",
    apiKey: "dateJoined",
    isDate: true,
  },
];

export const eventFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Draft", "Published", "Completed", "Cancelled"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Date/Time",
    apiKey: "datetime",
    isDate: true,
  },
];

export const transactionFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Pending", "Success", "Failed"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Transaction Type",
    apiKey: "type",
    items: ["Inward", "Outward"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Date",
    apiKey: "date",
    isDate: true,
  },
  {
    title: "Amount Range",
    apiKey: "range",
    items: ["0 - 50000", "50001 - 500000", "500001 - 1000000", "> 1000000"],
    transform: (v) => v?.replace(/\s+/g, ""),
  },
];

export const giftShopFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Pending", "Active"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Price",
    apiKey: "price",
    items: ["High-Low", "Low-High"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Selling",
    apiKey: "selling",
    items: ["Best-Least", "Least-Best"],
    transform: (v) => v?.toLowerCase(),
  },
];

export const salesFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Pending", "Active"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Date",
    apiKey: "date",
    isDate: true,
  },
  {
    title: "Price Range",
    apiKey: "pricerange",
    items: ["0 - 50000", "50001 - 500000", "500001 - 1000000", "> 1000000"],
  },
];

export const orderManagementFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Pending", "Active"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Date Created",
    apiKey: "datecreated",
    isDate: true,
  },
  {
    title: "Date Delivered",
    apiKey: "datedelivered",
    isDate: true,
  },
  {
    title: "Price Range",
    apiKey: "pricerange",
    items: ["0 - 50000", "50001 - 500000", "500001 - 1000000", "> 1000000"],
  },
];

export const drinksFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Pending", "Active"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Qty sold",
    apiKey: "qty",
    items: ["High-Low", "Low-High"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Brand",
    apiKey: "brand",
    default: "All",
    items: ["Glenfiddich", "Martell", "Coca-Cola"],
    transform: (v) => v?.toLowerCase(),
  },
];

export const adminFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Super admin", "Support admin", "Finance admin"],
    transform: (v) => v?.toLowerCase(),
  },
];

export const partyBundlesFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Pending", "Active"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Price",
    apiKey: "price",
    items: ["High-Low", "Low-High"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Selling",
    apiKey: "selling",
    items: ["Best-Least", "Least-Best"],
    transform: (v) => v?.toLowerCase(),
  },
];

export const paymentTrackingFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Pending", "Confirmed", "Failed", "Expired", "Partial"],
    transform: (v) => (v === "All" ? "" : v?.toLowerCase()),
  },
  {
    title: "Service",
    apiKey: "serviceId",
    default: "All",
    items: [
      "All",
      "RSVP",
      "Gift Registry",
      "Cash Gift",
      "Gift Box",
      "Guest Purchase",
      "POS",
      "3rd Party",
      "Gift Purchase",
    ],
    transform: (v) => {
      const serviceMap: Record<string, string> = {
        "RSVP": "rsvp",
        "Gift Registry": "gift-registry",
        "Cash Gift": "cash-gift",
        "Gift Box": "gift-box",
        "Guest Purchase": "guest-purchase",
        "POS": "point-of-sale",
        "3rd Party": "third-party-purchase",
        "Gift Purchase": "gift-purchase",
      };
      return serviceMap[v] || "";
    },
  },
  {
    title: "Date",
    apiKey: "date",
    isDate: true,
  },
];

export const buildDefaultFilters = (config: FilterItem[]) => {
  const out: Record<string, any> = {};

  config.forEach((f) => {
    if (f.isDate) {
      out.startDate = undefined;
      out.endDate = undefined;
    } else {
      out[f.apiKey] = undefined;
    }
  });

  if (!("startDate" in out)) out.startDate = undefined;
  if (!("endDate" in out)) out.endDate = undefined;

  return out;
};

export const computeApiFilters = (
  selected: Record<string, any>,
  config: FilterItem[]
): Record<string, string> => {
  const out: Record<string, string> = {};

  // init shape from config to guarantee stable keys
  config.forEach((f) => {
    if (f.isDate) {
      out.startDate = "";
      out.endDate = "";
    } else {
      out[f.apiKey] = "";
    }
  });

  // fill values
  config.forEach((f) => {
    const raw = selected[f.title];

    if (f.isDate) {
      const range = raw as [Date | null, Date | null] | undefined;
      if (range && range[0] && range[1]) {
        out.startDate = range[0].toISOString();
        out.endDate = range[1].toISOString();
      }
      return;
    }

    if (raw === undefined || raw === null) return;

    if (f.default && raw === f.default) {
      out[f.apiKey] = "";
      return;
    }

    const transformed = f.transform
      ? f.transform(raw)
      : raw.toString().toLowerCase();
    out[f.apiKey] = transformed;
  });

  // ensure keys are strings
  Object.keys(out).forEach((k) => {
    if (out[k] === undefined || out[k] === null) out[k] = "";
  });

  return out;
};

export const walletFilters: FilterItem[] = [
  {
    title: "Scope",
    apiKey: "scope",
    default: "All",
    items: ["All", "User wallets", "Event purses"],
    transform: (v) => (v === "User wallets" ? "user" : "event"),
  },
];

export const momoFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Active", "Pending", "Disabled", "Failed"],
    transform: (v) => v?.toLowerCase(),
  },
];

export const giftLinkFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Active", "Closed", "Suspended"],
    transform: (v) => v?.toLowerCase(),
  },
];

export const purchaseFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: ["All", "Paid", "Pending", "Failed", "Cancelled"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Channel",
    apiKey: "channel",
    default: "All",
    items: ["All", "Mobile", "Web", "Integration"],
    transform: (v) => v?.toLowerCase(),
  },
];

export const wristbandFilters: FilterItem[] = [
  {
    title: "Order",
    apiKey: "status",
    default: "All",
    items: [
      "All",
      "Pending payment",
      "Payment failed",
      "Placed",
      "In production",
      "Quality check",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
    transform: (v) => v?.toLowerCase().replace(/\s+/g, "_"),
  },
  {
    title: "Payment",
    apiKey: "paymentState",
    default: "All",
    items: ["All", "Paid", "Pending", "Failed"],
    transform: (v) => v?.toLowerCase(),
  },
];

/**
 * The support queue opens on unresolved tickets, so "Open" is the default
 * selection and "All" has to be picked deliberately.
 */
export const supportFilters: FilterItem[] = [
  {
    title: "Status",
    apiKey: "status",
    default: "Open",
    items: ["All", "Open", "Pending", "Resolved", "Closed"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Priority",
    apiKey: "priority",
    default: "All",
    items: ["All", "Urgent", "High", "Normal", "Low"],
    transform: (v) => v?.toLowerCase(),
  },
];

export const checkInFilters: FilterItem[] = [
  {
    title: "Attendance",
    apiKey: "checkedIn",
    default: "All",
    items: ["All", "Checked in", "Not arrived"],
    transform: (v) => (v === "Checked in" ? "yes" : "no"),
  },
];

export const promoterFilters: FilterItem[] = [
  {
    title: "Profile",
    apiKey: "status",
    default: "All",
    items: ["All", "Active", "Inactive"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Promotions",
    apiKey: "promotionStatus",
    default: "All",
    items: ["All", "Pending", "Offered", "Active", "Declined", "Expired"],
    transform: (v) => v?.toLowerCase(),
  },
];

export const publicationFilters: FilterItem[] = [
  {
    title: "Channel",
    apiKey: "channel",
    default: "All",
    items: ["All", "Push", "Email"],
    transform: (v) => v?.toLowerCase(),
  },
  {
    title: "Status",
    apiKey: "status",
    default: "All",
    items: [
      "All",
      "Awaiting payment",
      "Paid",
      "Sending",
      "Completed",
      "Failed",
    ],
    transform: (v) =>
      v === "Awaiting payment" ? "pending_payment" : v?.toLowerCase(),
  },
];
