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

export const formatQuantityPrice = (value: string) => {
  const [quantity, amount] = value.split("x");
  const formattedAmount = Number(amount).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  });

  return `${quantity} x ${formattedAmount}`;
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

export const formatStatusLabel = (status: string) => {
  const formatted = status
    .replace(/_/g, " ")
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

export const convertToNaira = (amount: string | number) => {
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
