"use client";

import { Box, Button, Flex, Group, Text, UnstyledButton } from "@mantine/core";
import classes from "@/styles/General.module.css";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { AdminLogout } from "@/services/api/admin";
import ConfirmationModal from "../modals/ConfirmationModal";
import { useDisclosure } from "@mantine/hooks";
import type { Icon } from "@/config/icons";

interface NavLinksProps {
  icon?: Icon;
  label: string;
  navLink: string;
}

const NavLinks = ({ icon: IconComponent, label, navLink }: NavLinksProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const currentPath = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const isLogout = navLink === "/logout";
  // Exact match or a true child segment — without the `/` guard, `/wallets`
  // would light up while you're on `/wallets-something-else`.
  const isActive =
    !isLogout &&
    (currentPath === navLink || currentPath.startsWith(`${navLink}/`));

  const handleLogout = async () => {
    close();
    await AdminLogout();
    dispatch(logout());
    router.push("/sign-in");
    window.location.reload();
  };

  return (
    <>
      <Link
        href={isLogout ? "#" : navLink}
        onClick={isLogout ? open : undefined}
      >
        <UnstyledButton
          className={`${classes.control} ${isActive ? classes.active : ""}`}
        >
          <Group justify="space-between" gap={0} wrap="nowrap">
            <Flex align="center" gap={12} style={{ minWidth: 0 }}>
              {IconComponent && (
                <IconComponent
                  size={20}
                  color="currentColor"
                  // Filled treatment on the active item reads as selected
                  // without needing a second colour.
                  variant={isActive ? "Bold" : "Linear"}
                  style={{ flexShrink: 0 }}
                />
              )}
              <Text fz={14} fw={isActive ? 600 : 400} truncate="end">
                {label}
              </Text>
            </Flex>

            <Box
              w={4}
              h={16}
              className="rounded-full"
              bg={isActive ? "var(--fj-accent)" : "transparent"}
              style={{ flexShrink: 0 }}
            />
          </Group>
        </UnstyledButton>
      </Link>

      <ConfirmationModal
        type="warning"
        opened={opened}
        close={close}
        title="Logout?"
        message="Are you sure you want to log out?"
        actions={
          <Flex gap={14} justify="center">
            <Button
              radius="xl"
              className={classes.btnNeutral}
              onClick={close}
              miw="50%"
            >
              Cancel
            </Button>
            <Button
              radius="xl"
              className={classes.btnWhite}
              onClick={handleLogout}
              miw="50%"
            >
              Logout
            </Button>
          </Flex>
        }
      />
    </>
  );
};

export default NavLinks;
