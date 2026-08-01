import { getStatusColor, getStatusColorAlt } from "@/utils";
import { Badge, BadgeProps, Box, Flex } from "@mantine/core";

interface StatusBadgeProps extends BadgeProps {
  status: string;
  size?: string;
  useAltColor?: boolean;
  isTransparent?: boolean;
  isTransaction?: boolean;
  hasDropdown?: boolean;
  hasDot?: boolean;
  variant?: BadgeProps["variant"];
}

const StatusBadge = ({
  status,
  size = "lg",
  useAltColor = false,
  isTransparent = true,
  isTransaction = false,
  hasDropdown = false,
  hasDot = false,
  variant,
  ...props
}: StatusBadgeProps) => {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "");
  const resolvedVariant = variant ?? (isTransparent ? "transparent" : "filled");

  // decide which function to use for the inner dot color
  const dotColor = useAltColor
    ? getStatusColorAlt(normalizedStatus, isTransaction)
    : getStatusColor(normalizedStatus);

  const badgeColor = () => {
    if (!isTransparent && useAltColor) {
      return getStatusColorAlt(normalizedStatus, isTransaction);
    }
    return useAltColor
      ? getStatusColorAlt(normalizedStatus)
      : getStatusColor(normalizedStatus);
  };

  return (
    <Badge
      {...props}
      variant={resolvedVariant}
      tt={"capitalize"}
      fw={400}
      color={badgeColor()}
      rightSection={hasDropdown ? <CaretDownIcon color={badgeColor()} /> : null}
      radius="xl"
      size={size}
      styles={{
        root: {
          cursor: "pointer",
        },
      }}
    >
      <Flex align={"center"} gap={6}>
        {hasDot && (
          <Box
            bg={dotColor}
            w={6}
            h={6}
            opacity={0.8}
            className="rounded-full"
          ></Box>
        )}
        {status}
      </Flex>
    </Badge>
  );
};

export default StatusBadge;

const CaretDownIcon = ({ color }: { color: string }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4.5L7.06067 7.43934C6.47488 8.02513 5.52513 8.02513 4.93935 7.43934L2 4.5"
        stroke={color}
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
