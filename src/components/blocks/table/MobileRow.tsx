"use client";

import { Box, Flex, Skeleton, Text } from "@mantine/core";
import classes from "@/styles/General.module.css";

export interface MobileRowDetail {
  label: string;
  value: React.ReactNode;
  /** Span both columns (long text, badges). */
  fullWidth?: boolean;
}

export interface MobileRowProps {
  /** Primary identifier: a name, reference or title. */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  caption?: React.ReactNode;
  /** Emphasised top-right figure, usually an amount. */
  value?: React.ReactNode;
  /** Status badge, shown under `value`. */
  status?: React.ReactNode;
  leading?: React.ReactNode;
  /** Far-right control such as a row menu; clicks on it don't open the row. */
  trailing?: React.ReactNode;
  /** Extra fields, for rows that have no details view to open. */
  details?: MobileRowDetail[];
  actions?: React.ReactNode;
  onClick?: () => void;
}

/**
 * What a table row becomes below the `lg` breakpoint. Left: who/what it is.
 * Right: the one figure and the status an admin scans for. Anything else
 * lives in the row's details view (or `details`, where there is none), so the
 * list never needs a horizontal scroll.
 */
const MobileRow = ({
  title,
  subtitle,
  caption,
  value,
  status,
  leading,
  trailing,
  details,
  actions,
  onClick,
}: MobileRowProps) => {
  const hasAside = value !== undefined || status !== undefined;

  return (
    <Box
      className={`${classes.mobileRow} ${onClick ? classes.mobileRowClickable : ""}`}
      onClick={onClick}
    >
      <Flex align="flex-start" gap={12}>
        {leading && <Box style={{ flexShrink: 0 }}>{leading}</Box>}

        <Flex direction="column" gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text fz={14} fw={500} truncate="end" component="div">
            {title}
          </Text>
          {subtitle && (
            <Text c="dimmed" fz={12} truncate="end" component="div">
              {subtitle}
            </Text>
          )}
          {caption && (
            <Text c="dimmed" fz={12} truncate="end" component="div">
              {caption}
            </Text>
          )}
        </Flex>

        {hasAside && (
          <Flex
            direction="column"
            align="flex-end"
            gap={6}
            style={{ flexShrink: 0, maxWidth: "50%" }}
          >
            {value !== undefined && (
              <Text fz={14} fw={600} ta="right" component="div">
                {value}
              </Text>
            )}
            {status}
          </Flex>
        )}

        {trailing && (
          <Box
            style={{ flexShrink: 0, marginRight: -6 }}
            onClick={(e) => e.stopPropagation()}
          >
            {trailing}
          </Box>
        )}
      </Flex>

      {details && details.length > 0 && (
        <Box className={classes.mobileRowDetails}>
          {details.map((detail) => (
            <Flex
              key={detail.label}
              direction="column"
              gap={2}
              style={{
                minWidth: 0,
                gridColumn: detail.fullWidth ? "1 / -1" : undefined,
              }}
            >
              <Text c="dimmed" fz={11}>
                {detail.label}
              </Text>
              <Text fz={13} component="div">
                {detail.value}
              </Text>
            </Flex>
          ))}
        </Box>
      )}

      {actions && (
        <Flex
          gap={8}
          mt={12}
          wrap="wrap"
          className={classes.mobileRowActions}
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </Flex>
      )}
    </Box>
  );
};

export const MobileRowSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <Box>
    {[...Array(rows)].map((_, index) => (
      <Flex key={index} className={classes.mobileRow} gap={12}>
        <Flex direction="column" gap={8} style={{ flex: 1 }}>
          <Skeleton height={14} width="60%" radius="sm" />
          <Skeleton height={10} width="40%" radius="sm" />
        </Flex>
        <Flex direction="column" gap={8} align="flex-end">
          <Skeleton height={14} width={70} radius="sm" />
          <Skeleton height={18} width={60} radius="xl" />
        </Flex>
      </Flex>
    ))}
  </Box>
);

export default MobileRow;
