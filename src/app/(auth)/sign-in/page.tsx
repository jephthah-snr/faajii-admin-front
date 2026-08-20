"use client";

import { Logo } from "@/images";
import {
  Box,
  Button,
  Flex,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import Image from "next/image";
import classes from "@/styles/General.module.css";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import { loginSchema } from "@/utils";
import { setExpirationCookie, setToken, setUser } from "@/store/authSlice";
import { Login } from "@/services/api";
import { AuthAlert } from "@/components";
import { IconEmail, IconPassword } from "@/config/icons";
import { useRouter } from "nextjs-toploader/app";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState<React.ReactNode>(null);

  const router = useRouter();
  const dispatch = useDispatch();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: yupResolver(loginSchema),
    validateInputOnChange: ["email"],
    transformValues: (values) => ({ ...values }),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const res = await Login(values);

      const { token, permission, fullName, email, PhoneNumber, avatar } =
        res.data;
      const user = { permission, fullName, email, PhoneNumber, avatar };
      const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

      dispatch(setUser(user));
      dispatch(setToken(token));
      dispatch(setExpirationCookie(tokenExpiration));

      setAuthMessage(
        <AuthAlert
          title="Authentication successful"
          color="#1ED69E"
          onClose={() => setAuthMessage(null)}
        />,
      );

      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      setAuthMessage(
        <AuthAlert
          title="Invalid email or password"
          color="#FF5C66"
          onClose={() => setAuthMessage(null)}
        />,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      mih="100vh"
      bg="var(--fj-bg)"
      c="var(--fj-text-primary)"
      pos="relative"
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        mih="100vh"
        p="md"
        pos="relative"
        style={{ zIndex: 1 }}
      >
        <Stack align="center" gap={68} w="100%" maw={440}>
          <Image
            src={Logo}
            width={120}
            height={52}
            alt="Faajii logo"
            style={{ height: "auto", width: 120 }}
            priority
          />

          <Stack gap={24}>
            <Stack gap={6} align="center">
              <Text fz={26} fw={700} lh={1.2}>
                Sign in to continue
              </Text>
              <Text fz={14} c="var(--fj-text-muted)">
                Use your Faajii admin credentials to access the dashboard.
              </Text>
            </Stack>

            <form
              onSubmit={form.onSubmit(handleSubmit)}
              style={{ width: "100%" }}
            >
              <Stack gap={18}>
                {authMessage}

                <TextInput
                  label="Email address"
                  placeholder="you@faajii.app"
                  type="email"
                  autoComplete="email"
                  leftSection={
                    <IconEmail
                      size={18}
                      color="var(--fj-text-muted)"
                      variant="Linear"
                    />
                  }
                  {...form.getInputProps("email")}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  leftSection={
                    <IconPassword
                      size={18}
                      color="var(--fj-text-muted)"
                      variant="Linear"
                    />
                  }
                  {...form.getInputProps("password")}
                />

                <Button
                  type="submit"
                  size="lg"
                  radius="xl"
                  fullWidth
                  mt={6}
                  className={classes.btnWhite}
                  disabled={!form.isValid() || isSubmitting}
                  loading={isSubmitting}
                >
                  Sign In
                </Button>
              </Stack>
            </form>
          </Stack>

          <Text fz={12} c="var(--fj-text-muted)" ta="center">
            Forgot password? · Contact support
          </Text>
        </Stack>
      </Flex>
    </Box>
  );
};

export default SignIn;
