"use client";

import { AppShell, Box, BoxProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "@/styles/General.module.css";
import { disableLogsInProduction } from "@/utils";
import { Header, SideNav } from "@/components";

interface AppLayoutProps extends BoxProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  subTitle?: string;
  hasBackButton?: boolean;
  isDashboard?: boolean;
  isAdmin?: boolean;
  adminChildren?: React.ReactNode;
  action?: React.ReactNode;
}

const AppLayout = ({
  children,
  title,
  subTitle,
  hasBackButton = false,
  isDashboard = false,
  isAdmin = false,
  adminChildren,
  action,
  ...props
}: AppLayoutProps) => {
  const [opened, { toggle }] = useDisclosure();
  disableLogsInProduction();

  return (
    <AppShell
      navbar={{
        width: 248,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      aside={
        isAdmin
          ? { width: 240, breakpoint: "md", collapsed: { mobile: true } }
          : undefined
      }
    >
      <AppShell.Navbar className={classes.navbar}>
        <SideNav />
      </AppShell.Navbar>

      {/* `mih` rather than a hard `h`: pages taller than the viewport should
          extend the main column, not spill out of a clipped one. */}
      <AppShell.Main mih="100vh" pos="relative">
        <Box className={classes.main}>
          <Box {...props}>
            <Header
              openNav={opened}
              title={title}
              subTitle={subTitle}
              onClick={toggle}
              hasBackButton={hasBackButton}
              isDashboard={isDashboard}
              action={action}
            />
            <Box px={{ base: "md", md: "xl" }} pt="lg" pb={48}>
              {children}
            </Box>
          </Box>
        </Box>
      </AppShell.Main>

      {isAdmin && (
        <AppShell.Aside>
          <Box visibleFrom="md" className={classes.adminAside}>
            {adminChildren}
          </Box>
        </AppShell.Aside>
      )}
    </AppShell>
  );
};

export default AppLayout;
