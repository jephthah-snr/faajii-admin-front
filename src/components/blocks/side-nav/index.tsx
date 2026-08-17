"use client";

import { AppShell, Box, Divider, Flex, ScrollArea, Text } from "@mantine/core";
import classes from "@/styles/General.module.css";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/images";
import NavLinks from "../../elements/nav-links";
import { logoutLink, navSections } from "@/utils";
import { canAccessRoute } from "@/config/access";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useMemo } from "react";

const SideNav = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const permission = user?.permission;

  // Filtered against the same access map the proxy enforces, so the sidebar
  // never offers a route the user would just be redirected away from.
  const visibleSections = useMemo(
    () =>
      navSections
        .map((section) => ({
          ...section,
          links: section.links.filter((link) =>
            canAccessRoute(link.navLink, permission),
          ),
        }))
        .filter((section) => section.links.length > 0),
    [permission],
  );

  return (
    <>
      {/* Brand — fixed height, never scrolls away. */}
      <AppShell.Section px="md" pt="md" pb="xs">
        <Link href="/dashboard">
          <Box py={12}>
            <Image
              src={Logo}
              width={96}
              height={40}
              alt="Faajii logo"
              style={{ height: "auto", width: 96 }}
              priority
            />
          </Box>
        </Link>
      </AppShell.Section>

      {/*
        `grow` + ScrollArea is what actually bounds the scroll region to the
        leftover space. The previous fixed/percentage heights let the list run
        past the viewport, so the last sections were unreachable.
      */}
      <AppShell.Section
        grow
        component={ScrollArea}
        scrollbarSize={4}
        type="hover"
        px={10}
        className={classes.navScroll}
      >
        <Flex direction="column" gap={2} pb="md">
          {visibleSections.map((section) => (
            <Box key={section.title ?? "root"}>
              {section.title && (
                <Text className={classes.navGroupLabel}>{section.title}</Text>
              )}
              <Flex direction="column" gap={2}>
                {section.links.map((link) => (
                  <NavLinks key={link.navLink} {...link} />
                ))}
              </Flex>
            </Box>
          ))}
        </Flex>
      </AppShell.Section>

      {/* Logout stays pinned to the bottom, outside the scroll region. */}
      <AppShell.Section px={10} pb="md">
        <Divider mb={10} color="var(--fj-border)" />
        <NavLinks {...logoutLink} />
      </AppShell.Section>
    </>
  );
};

export default SideNav;
