import { formatStatusLabel, getStatusColor } from "@/utils";
import { alpha, Badge, BadgeProps, Box } from "@mantine/core";

interface StatusBadgeProps extends Omit<BadgeProps, "color" | "variant"> {
  /** Raw API status — "pending_payment", "COMPLETED", "In transit" all work. */
  status?: string | null;
  /** Wording to show instead of the status itself, coloured by `status`. */
  label?: React.ReactNode;
  hasDropdown?: boolean;
  hasDot?: boolean;
}

/**
 * The one way the admin shows a status. Colour comes from the shared palette,
 * so a status reads the same on every screen; the label is sentence case
 * ("Pending payment") rather than shouted in uppercase.
 */
const StatusBadge = ({
  status,
  label,
  size = "md",
  hasDropdown = false,
  hasDot = false,
  style,
  ...props
}: StatusBadgeProps) => {
  const color = getStatusColor(status);

  return (
    <Badge
      radius="xl"
      size={size}
      tt="none"
      fw={500}
      leftSection={
        hasDot ? <Box bg={color} w={6} h={6} className="rounded-full" /> : null
      }
      rightSection={hasDropdown ? <CaretDownIcon color={color} /> : null}
      {...props}
      style={{
        "--badge-bg": alpha(color, 0.14),
        "--badge-color": color,
        "--badge-bd": `1px solid ${alpha(color, 0.32)}`,
        ...(hasDropdown ? { cursor: "pointer" } : null),
        ...(style as object),
      }}
    >
      {label ?? (formatStatusLabel(status) || "Unknown")}
    </Badge>
  );
};

export default StatusBadge;

const CaretDownIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
    <path
      d="M10 4.5L7.06067 7.43934C6.47488 8.02513 5.52513 8.02513 4.93935 7.43934L2 4.5"
      stroke={color}
      strokeWidth="0.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
