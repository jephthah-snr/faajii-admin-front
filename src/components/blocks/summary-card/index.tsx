"use client";

import { IconArrowDown, IconArrowUp, IconInfo, type Icon } from "@/config/icons";
import {
  Card,
  CardProps,
  Flex,
  Text,
  Tooltip,
} from "@mantine/core";

interface SummaryCardProps extends CardProps {
  title: string;
  value: string | number | undefined;
  metric?: string | number;
  isCurrency?: boolean;
  withLightTitle?: boolean;
  tooltip?: string;
  /** Optional glyph shown alongside the label. */
  icon?: Icon;
}

const SummaryCard = ({
  title,
  value,
  metric,
  isCurrency,
  withLightTitle,
  tooltip,
  icon: IconComponent,
  ...props
}: SummaryCardProps) => {
  const numericMetric = typeof metric === "number" ? metric : Number(metric);
  const hasMetric =
    metric !== undefined &&
    metric !== null &&
    metric !== "" &&
    !Number.isNaN(numericMetric) &&
    numericMetric !== 0;
  const isUp = numericMetric > 0;
  const formattedMetric = `${isUp ? "+" : ""}${numericMetric.toFixed(2)}%`;

  return (
    <Card
      p={20}
      miw={withLightTitle ? { base: "50%", md: 170 } : 190}
      flex={1}
      radius="lg"
      pos="relative"
      style={{ overflow: "hidden" }}
      {...props}
    >
      <Flex direction="column" gap={10}>
        <Flex align="center" gap={8}>
          {IconComponent && (
            <IconComponent
              size={16}
              color="var(--fj-text-muted)"
              variant="Bulk"
            />
          )}
          <Text
            c="var(--fj-text-secondary)"
            fw={500}
            fz={13}
            tt="uppercase"
            style={{ letterSpacing: "0.04em" }}
          >
            {title}
          </Text>
          {tooltip && (
            <Tooltip
              label={tooltip}
              w={240}
              withArrow
              transitionProps={{ duration: 200 }}
              position="top"
              multiline
            >
              <Flex align="center" style={{ cursor: "help" }}>
                <IconInfo
                  size={15}
                  color="var(--fj-text-muted)"
                  variant="Linear"
                />
              </Flex>
            </Tooltip>
          )}
        </Flex>

        <Flex align="flex-end" justify="space-between" gap={8}>
          <Text c="var(--fj-text-primary)" fw={700} fz={28} lh={1.1}>
            {isCurrency ? "₦" : ""}
            {value?.toLocaleString() ?? 0}
          </Text>

          {hasMetric && (
            <Flex
              align="center"
              gap={3}
              px={8}
              py={3}
              style={{
                borderRadius: "var(--fj-radius-pill)",
                background: isUp
                  ? "var(--fj-success-soft)"
                  : "var(--fj-danger-soft)",
              }}
            >
              {isUp ? (
                <IconArrowUp
                  size={12}
                  color="var(--fj-success)"
                  variant="Linear"
                />
              ) : (
                <IconArrowDown
                  size={12}
                  color="var(--fj-danger)"
                  variant="Linear"
                />
              )}
              <Text
                c={isUp ? "var(--fj-success)" : "var(--fj-danger)"}
                fz={11}
                fw={600}
              >
                {formattedMetric}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default SummaryCard;
