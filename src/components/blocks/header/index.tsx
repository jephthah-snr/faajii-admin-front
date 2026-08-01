import { BackButton } from "@/components/elements";
import { IconCaretRight } from "@/icons";
import { truncateText } from "@/utils";
import { Burger, Flex, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Image from "next/image";

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
      justify={"space-between"}
      gap={10}
      p={"md"}
      className="app-header"
    >
      <Flex align="center" justify="space-between" w="100%" gap={10}>
        <Flex align={"center"} gap={8}>
          {hasBackButton && <BackButton />}

          {isDashboard ? (
            <Flex align={"center"} gap={8}>
              {title}
            </Flex>
          ) : hasBackButton ? (
            <Flex align={"center"} gap={8}>
              <Text c={"#D9D9D9B2"} fz={{ base: 14, md: 16 }}>
                {title}
              </Text>
              {subTitle && (
                <Image src={IconCaretRight} alt="icon" width={20} height={20} />
              )}
              <Text fw={"bold"} fz={{ base: 14, md: 16 }}>
                {isMobile ? truncateText(subTitle, 15) : subTitle}
              </Text>
            </Flex>
          ) : (
            <Text fw={"bold"} fz={{ sm: 14, md: 20 }}>
              {title}
            </Text>
          )}
        </Flex>

        <Burger opened={openNav} onClick={onClick} hiddenFrom="sm" size="sm" />
      </Flex>

      {/* Actions */}
      {action && action}
    </Flex>
  );
};

export default Header;
