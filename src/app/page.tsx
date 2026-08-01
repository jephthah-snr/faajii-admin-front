"use client";

import { Box } from "@mantine/core";
import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  // Redirect to /sign-in on component mount
  useEffect(() => {
    router.push("/sign-in");
  }, [router]);
  return <Box bg="#000" h="100vh"></Box>;
}
