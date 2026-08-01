import { IconArrowFall, IconArrowRise, IconInfo } from "@/icons";
import { Card, CardProps, Flex, Text, Tooltip } from "@mantine/core";
import Image from "next/image";

interface SummaryCardProps extends CardProps {
  title: string;
  value: string | number | undefined;
  metric?: string | number;
  isCurrency?: boolean;
  withLightTitle?: boolean;
  tooltip?: string;
}

const SummaryCard = ({
  title,
  value,
  metric,
  isCurrency,
  withLightTitle,
  tooltip,
  ...props
}: SummaryCardProps) => {
  const formattedMetric =
    typeof metric === "number"
      ? `${metric > 0 ? "+" : ""}${metric.toFixed(2)}%`
      : !isNaN(Number(metric))
        ? `${Number(metric) > 0 ? "+" : ""}${Number(metric).toFixed(2)}%`
        : metric;

  return (
    <Card
      p={20}
      miw={withLightTitle ? { base: "50%", md: 170 } : 190}
      flex={1}
      bg={"#1E1E1E"}
      radius="lg"
      {...props}
    >
      <Flex direction="column">
        <Flex justify="space-between" mb={8}>
          <Flex align="center" gap={10}>
            <Text
              c={withLightTitle ? "#D9D9D9B2" : "#fff"}
              fw={withLightTitle ? 400 : 700}
              fz="sm"
            >
              {title}
            </Text>
            {tooltip && (
              <Tooltip
                label={tooltip}
                w={220}
                withArrow
                transitionProps={{ duration: 200 }}
                position="top"
                multiline
              >
                <Image src={IconInfo} width={18} height={18} alt="info icon" />
              </Tooltip>
            )}
          </Flex>
        </Flex>
        <Flex align="center" justify="space-between" gap={5}>
          <Text c={"#fff"} fw={700} fz={isCurrency ? 20 : 24}>
            {isCurrency ? "₦" : ""}
            {value?.toLocaleString()}
          </Text>

          {(typeof metric === "number" || !isNaN(Number(metric))) &&
            metric !== "0.00" &&
            metric !== 0 && (
              <Flex align="center" gap={3}>
                <Text c={"#ffffff"} fz="xs">
                  {formattedMetric}
                </Text>
                <Image
                  src={
                    (typeof metric === "number" ? metric : Number(metric)) > 0
                      ? IconArrowRise
                      : IconArrowFall
                  }
                  alt="arrow-rise"
                  style={{ width: "40%", height: "40%" }}
                />
              </Flex>
            )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default SummaryCard;
