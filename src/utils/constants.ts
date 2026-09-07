/** Shared UI constants used across the admin tables and filters. */

export const rowsPerPage = 50;

export const initialsColors = ["blue", "green", "orange", "red"];

export const orderStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export const eventGuestHeaders = [
  "Name",
  "Phone Number",
  "Email Address",
  "# of Items",
  "Status",
  "RSVP Code",
  "Date",
  "Action",
];

export const eventStoreHeaders = [
  "ID",
  "Item",
  "Price",
  "Type",
  "Quantity",
  "Purchased",
  "Total Left",
  "Status",
  "Action",
];

/**
 * The markets Faajii sells reach in. Benin leads because it is where the app
 * started and where most campaigns are bought; each market bills in its own
 * currency, so revenue is only ever read one region at a time.
 */
export const reachRegions = [
  { code: "BJ", label: "Benin", currency: "XOF" },
  { code: "CI", label: "Côte d'Ivoire", currency: "XOF" },
  { code: "NG", label: "Nigeria", currency: "NGN" },
];

export const defaultReachRegion = "BJ";
