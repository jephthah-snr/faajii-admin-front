import parsePhoneNumberFromString from "libphonenumber-js";

/* export const formatStringAmount = (amount: string | number): string => {
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}; */

export const formatStringAmount = (
  amount: string | number | null | undefined,
  fallback: string = "N/A",
): string => {
  if (amount === null || amount === undefined || amount === "") return fallback;
  const num = Number(amount);
  if (!Number.isFinite(num)) return fallback;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Currency an amount is shown in when its record does not say. Faajii's home
 * market is Benin, so this matches the mobile app's default rather than
 * assuming naira.
 */
export const DEFAULT_CURRENCY = "XOF";

const COUNTRY_CURRENCY: Record<string, string> = {
  NG: "NGN",
  GH: "GHS",
  // UEMOA — the eight states that share the West African CFA franc.
  BJ: "XOF",
  BF: "XOF",
  CI: "XOF",
  GW: "XOF",
  ML: "XOF",
  NE: "XOF",
  SN: "XOF",
  TG: "XOF",
};

/** The currency a market bills in, for records that only carry a country. */
export const currencyForCountry = (countryCode?: string | null): string =>
  COUNTRY_CURRENCY[(countryCode || "").trim().toUpperCase()] ??
  DEFAULT_CURRENCY;

const PREFIX_SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", EUR: "€" };

/** Decimal places the currency is actually written with (XOF has none). */
const fractionDigits = (code: string): number => {
  try {
    return (
      new Intl.NumberFormat("en", { style: "currency", currency: code })
        .resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
};

/**
 * The one money formatter. Mirrors the mobile app so both products print an
 * amount identically: "₦1,000.00" / "$25.00" with a prefix symbol, and every
 * other currency as the figure followed by its code — "25,000 XOF".
 */
export const formatMoney = (
  amount: number | string | null | undefined,
  currency?: string | null,
): string => {
  const value = Number(amount);
  const code = (currency || DEFAULT_CURRENCY).trim().toUpperCase();
  const digits = fractionDigits(code);
  const figure = new Intl.NumberFormat("en", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

  const symbol = PREFIX_SYMBOLS[code];
  return symbol ? `${symbol}${figure}` : `${figure} ${code}`;
};

/**
 * Paystack-era records (gift orders, verified Paystack transactions) store
 * naira in kobo, so both the conversion and the currency are fixed.
 */
export const formatKobo = (amount?: string | number | null): string =>
  formatMoney(convertToNaira(amount), "NGN");

/** Human date + time, or a placeholder when the value is absent. */
export const formatDateTime = (
  value?: string | null,
  fallback = "Not set",
): string => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const extractWalletName = (walletString: string): string => {
  return walletString.replace(
    /-\b[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}\b/,
    "",
  );
};

export const capitalizeString = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getFirstName = (fullName: string): string => {
  const nameParts = fullName.trim().split(" ");
  return nameParts[0] || "";
};

export const getUuidPrefix = (uuid: string): string => {
  if (typeof uuid !== "string") return "";
  return uuid.split("-")[0] || "";
};

export const truncateText = (text = "", maxLength = 10) => {
  if (typeof text !== "string") return "";
  const cleanText = text.trim();
  return cleanText.length > maxLength
    ? cleanText.substring(0, maxLength).trimEnd() + "..."
    : cleanText;
};

export const getProgressColor = (
  progress: number,
  progressColor?: string,
): string => {
  if (progress === 0) return "#F8F8F8E5";
  if (progress < 100) return progressColor || "#F6D425";
  return "#10B980";
};

export const getPhoneCountryFlag = (phoneNumber: string): string => {
  if (!phoneNumber) return "🏳️";

  // Normalize number
  let formatted = phoneNumber.trim();
  if (!formatted.startsWith("+")) {
    // Add a default prefix for local numbers (you can change this default)
    if (formatted.startsWith("0")) {
      formatted = "+234" + formatted.slice(1); // Assume Nigeria for local format
    } else {
      formatted = "+" + formatted;
    }
  }

  try {
    const parsed = parsePhoneNumberFromString(formatted);
    if (!parsed?.country) return "🏳️";

    const countryCode = parsed.country.toUpperCase();
    return countryCode.replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
  } catch (error) {
    console.error("Flag parsing failed:", error);
    return "🏳️";
  }
};

/** "PENDING_PAYMENT" / "in-transit" → "Pending payment" / "In transit". */
export const formatStatusLabel = (status?: string | null) => {
  const formatted = (status || "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatLocalDate = (date: Date | null) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const normalizeStatus = (status: string) => {
  if (!status || status.toLowerCase() === "all") return "";
  return status.toLowerCase().replace(/\s+/g, "");
};

/** Kobo → naira for the Paystack-era records stored in minor units. */
export const convertToNaira = (amount?: string | number | null) => {
  if (!amount) return;
  return Math.abs(Number(amount)) / 100;
};

export const extractDocId = (url: string | undefined) => {
  if (!url) return "";

  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1]; // "7d7584fc-3a77-4318-a133-46249d68e258.pdf"
    const uuid = filename.split(".")[0]; // "7d7584fc-3a77-4318-a133-46249d68e258"
    const shortId = uuid.split("-")[0]; // "7d7584fc"
    return shortId;
  } catch {
    return "";
  }
};

export const formatForFilename = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const generateCsvSuffix = (
  selectedFilter: string | undefined,
  formattedDateRange: [string | null, string | null],
) => {
  const parts: string[] = [];

  // Status filter, ignore All
  if (selectedFilter && selectedFilter !== "All") {
    parts.push(selectedFilter);
  }

  // Date range, convert ISO to readable label
  if (formattedDateRange[0] && formattedDateRange[1]) {
    const startLabel = formatForFilename(formattedDateRange[0]);
    const endLabel = formatForFilename(formattedDateRange[1]);
    parts.push(`${startLabel} - ${endLabel}`);
  }

  if (parts.length === 0) return "";
  return " " + parts.join(" ");
};

export const normalizeAddress = (
  address: string | { formattedAddress?: string } | null | undefined,
): string => {
  if (!address) return "N/A";

  if (typeof address === "string") {
    return address;
  }

  return address.formattedAddress || "N/A";
};

/**
 * Renders a count. A stats payload can arrive without every field, and calling
 * `.toLocaleString()` on the missing one throws and blanks the page — so a
 * non-numeric value reads as zero rather than taking the screen down.
 */
export const formatCount = (value: number | null | undefined): string => {
  const numeric = Number(value);
  return (Number.isFinite(numeric) ? numeric : 0).toLocaleString();
};

/**
 * "315,000 FCFA". Promoter commission and payouts settle in one currency
 * platform-wide, so those figures are written the way the region writes them
 * rather than through the multi-currency formatter.
 */
export const formatFcfa = (
  amount: number | string | null | undefined,
  fallback = "—",
): string => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return fallback;
  return `${value.toLocaleString()} FCFA`;
};

/** "5% per ticket" / "1,500 FCFA per ticket" — null when no offer exists. */
export const formatCommission = (
  type: "percentage" | "flat" | null | undefined,
  value: number | null | undefined,
): string | null => {
  if (value == null || !type) return null;
  return type === "percentage"
    ? `${value}% per ticket`
    : `${formatFcfa(value)} per ticket`;
};
