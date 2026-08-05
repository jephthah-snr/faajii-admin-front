"use client";

import { Logo } from "@/images";
import {
  Box,
  Button,
  Flex,
  PasswordInput,
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
    transformValues: (values) => ({
      ...values,
    }),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const res = await Login(values);

      const { token, permission, fullName, email, PhoneNumber, avatar } =
        res.data;
      const user = { permission, fullName, email, PhoneNumber, avatar };
      const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000; // Token expiration (24 hours)

      // Store user data and token in Redux
      dispatch(setUser(user));
      dispatch(setToken(token));
      dispatch(setExpirationCookie(tokenExpiration));

      console.log("User logged in successfully");

      setAuthMessage(
        <AuthAlert
          title="Authentication successful"
          color="#4AA785"
          onClose={() => setAuthMessage(null)}
        />
      );

      // Log user in
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      setAuthMessage(
        <AuthAlert
          title="Invalid email or password"
          color="#ED4245"
          onClose={() => setAuthMessage(null)}
        />
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg="#1E1E1E" c="#fff" h="100vh">
      <Flex
        direction="column"
        align="center"
        gap={30}
        p="md"
        m="0 auto"
        w={{ base: "100%", md: "30%" }}
        className="relative z-10"
      >
        <Flex pt={60}>
          <Image
            src={Logo}
            width={180}
            height={64}
            alt="Faajii logo"
            priority
          />
        </Flex>

        <Flex direction="column" align="center">
          <Text fz={34} fw={700}>
            Sign in to Continue.
          </Text>
        </Flex>

        <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: "100%" }}>
          <Flex direction="column" gap={20}>
            {authMessage}

            <TextInput placeholder="Email" {...form.getInputProps("email")} />
            <PasswordInput
              placeholder="Password"
              rightSection={<></>}
              {...form.getInputProps("password")}
            />

            <Button
              type="submit"
              radius="xl"
              mt={10}
              className={classes.btnWhite}
              disabled={!form.isValid() || isSubmitting}
              loading={isSubmitting}
            >
              Sign In
            </Button>
          </Flex>
        </form>
      </Flex>
    </Box>
  );
};

export default SignIn;
