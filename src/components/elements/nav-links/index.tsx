"use client";

import {
  Group,
  Box,
  UnstyledButton,
  rem,
  Text,
  Flex,
  Button,
} from "@mantine/core";
import classes from "@/styles/General.module.css";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { AdminLogout } from "@/services/api/admin";
import ConfirmationModal from "../modals/ConfirmationModal";
import { useDisclosure } from "@mantine/hooks";

interface NavLinksProps {
  icon?: string | StaticImageData;
  label: string;
  navLink: string;
}

const NavLinks = ({ icon, label, navLink }: NavLinksProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const currentPath = usePathname();
  const isActive = currentPath.startsWith(navLink);
  const router = useRouter();
  const dispatch = useDispatch();

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
        href={navLink !== "/logout" ? navLink : "#"}
        onClick={navLink === "/logout" ? open : undefined}
      >
        <UnstyledButton
          className={`${classes.control} ${isActive && classes.active}`}
        >
          <Group justify="space-between" gap={0}>
            <Box style={{ display: "flex", alignItems: "center" }}>
              {icon && (
                <Image
                  src={icon}
                  alt="icon"
                  style={{ width: rem(24), height: rem(24) }}
                />
              )}
              <Text ml="xs">{label}</Text>
            </Box>

            <Box
              w={5}
              h={18}
              className="rounded-full"
              bg={isActive ? "#5769E9" : "transparent"}
            ></Box>
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
