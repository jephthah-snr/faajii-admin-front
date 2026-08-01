"use client";

import { IconArrowLeft } from "@/icons";
import { ActionIcon } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";

const BackButton = () => {
  const router = useRouter();
  return (
    <ActionIcon size="md" variant="transparent" onClick={() => router.back()}>
      <Image src={IconArrowLeft} alt="icon" width={20} height={20} />
    </ActionIcon>
  );
};

export default BackButton;
