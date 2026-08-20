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
