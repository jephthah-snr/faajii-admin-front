"use client";

import { ScrollArea, AppShell, Flex, Box } from "@mantine/core";
import classes from "@/styles/General.module.css";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/images";
import { NavLinks } from "@/components";
import { navLinks } from "@/utils";
import { useMediaQuery } from "@mantine/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const SideNav = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isMediumScreen = useMediaQuery("(max-width: 1366px)");

  const user = useSelector((state: RootState) => state.auth.user);
  const permission = user?.permission || "super";

  const filteredNavLinks = navLinks.filter((link) =>
    link.permissions.includes(permission!),
  );

  return (
    <>
      <AppShell.Section>
        <Flex justify={"space-between"} align={"center"} p={"md"}>
          <Link href="/dashboard">
            <Box py={20}>
              <Image
                src={Logo}
                width={140}
                height={50}
                alt="Faajii logo"
                priority
              />
            </Box>
          </Link>
        </Flex>

        <ScrollArea
          className={classes.links}
          h={isMobile ? 460 : isMediumScreen ? "75%" : "auto"}
          scrollbarSize={0}
          mt={20}
          mx={10}
        >
          <Flex direction={"column"} gap={4}>
            {filteredNavLinks.map((link) => (
              <div key={link.label}>
                <NavLinks {...link} />
              </div>
            ))}
          </Flex>
        </ScrollArea>
      </AppShell.Section>
    </>
  );
};

export default SideNav;
