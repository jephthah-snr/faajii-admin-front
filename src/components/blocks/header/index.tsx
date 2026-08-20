"use client";

import { BackButton } from "@/components/elements";
import { IconArrowRight } from "@/config/icons";
import { truncateText } from "@/utils";
import { Burger, Flex, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface HeaderProps {
  title?: string | React.ReactNode;
  subTitle?: string;
  hasBackButton?: boolean;
  isDashboard?: boolean;
  openNav: boolean;
  onClick: () => void;
  action?: React.ReactNode;
}

const Header = ({
  openNav,
  onClick,
  title,
  subTitle,
  hasBackButton = false,
  isDashboard = false,
  action,
}: HeaderProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Flex
      w="100%"
      direction={{ base: "column", md: "row" }}
      align={{ base: "flex-start", md: "center" }}
      justify="space-between"
      gap={12}
      px={{ base: "md", md: "xl" }}
      py="md"
      className="app-header"
    >
      <Flex align="center" justify="space-between" w="100%" gap={10}>
        <Flex align="center" gap={10} style={{ minWidth: 0 }}>
          {hasBackButton && <BackButton />}

          {isDashboard ? (
            <Flex align="center" gap={10}>
              {title}
            </Flex>
          ) : hasBackButton ? (
            <Flex align="center" gap={8} style={{ minWidth: 0 }}>
              <Text c="var(--fj-text-muted)" fz={{ base: 13, md: 15 }}>
                {title}
              </Text>
              {subTitle && (
                <IconArrowRight
                  size={16}
                  color="var(--fj-text-muted)"
                  variant="Linear"
                />
              )}
              <Text fw={700} fz={{ base: 14, md: 16 }} truncate="end">
                {isMobile ? truncateText(subTitle, 15) : subTitle}
              </Text>
            </Flex>
          ) : (
            // Title + optional caption stacked, so a page can explain itself
            // without a second heading block inside the content area.
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Text fw={700} fz={{ base: 18, md: 22 }} lh={1.2}>
                {title}
              </Text>
              {subTitle && (
                <Text c="var(--fj-text-muted)" fz={13} lh={1.3}>
                  {subTitle}
                </Text>
              )}
            </Stack>
          )}
        </Flex>

        <Burger opened={openNav} onClick={onClick} hiddenFrom="sm" size="sm" />
      </Flex>

      {action}
    </Flex>
  );
};

export default Header;
