/**
 * Status colours, resolved from the shared token palette so a "successful"
 * badge is the same green everywhere — including inside charts and stat tiles.
 */

// Literal hex rather than `var(--fj-*)`: these feed Mantine's `color` prop,
// which parses the value to compute contrast and cannot resolve a CSS variable.
// Keep in sync with `src/styles/tokens.css`.
const SUCCESS = "#1ED69E";
const WARNING = "#FF8A00";
const DANGER = "#FF5C66";
const INFO = "#74C0FC";
const NEUTRAL = "#747482";
const VIOLET = "#D0BFFF";
const PINK = "#F45797";

export const getStatusColor = (data: string) => {
  switch (data) {
    case "active":
    case "complete":
    case "completed":
    case "successful":
    case "available":
    case "verified":
    case "approved":
    case "delivered":
    case "paid":
    case "gifted":
      return SUCCESS;

    case "pending":
    case "processing":
    case "upcoming":
    case "outofstock":
    case "medium":
    case "intransit":
    case "confirmed":
    case "customersupport":
    case "giftingstarted":
      return WARNING;

    case "deactivated":
    case "cancelled":
    case "inactive":
    case "failed":
    case "high":
    case "unverified":
    case "disapproved":
    case "suspended":
    case "rejected":
    case "revoked":
      return DANGER;

    case "invited":
    case "gifts":
    case "superadmin":
    case "admin":
    case "ticket":
      return INFO;

    case "products":
    case "services":
      return VIOLET;

    case "operations":
    case "customrole1":
      return PINK;

    case "expectinggift":
      return NEUTRAL;

    default:
      return NEUTRAL;
  }
};

export const getStatusColorAlt = (data: string, isTransaction?: boolean) => {
  if (isTransaction) {
    switch (data) {
      case "successful":
      case "completed":
      case "paid":
        return SUCCESS;
      case "inprogress":
      case "pending":
        return WARNING;
      case "failed":
      case "cancelled":
        return DANGER;
      default:
        return NEUTRAL;
    }
  }

  switch (data) {
    case "all":
      return "#FFFFFF";

    case "confirmed":
    case "completed":
    case "delivered":
    case "active":
      return SUCCESS;

    case "inprogress":
    case "pending":
    case "refunded":
      return WARNING;

    case "outfordelivery":
    case "shipped":
      return VIOLET;

    case "cancelled":
    case "failed":
    case "noshow":
      return DANGER;

    case "infulfilment":
    case "processing":
    case "suspended":
      return PINK;

    case "paid":
    case "invited":
      return INFO;

    case "convertedtocash":
      return NEUTRAL;

    default:
      return NEUTRAL;
  }
};
