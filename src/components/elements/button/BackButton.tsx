"use client";

import { IconArrowLeft } from "@/config/icons";
import { ActionIcon } from "@mantine/core";
import { useRouter } from "nextjs-toploader/app";

const BackButton = () => {
  const router = useRouter();

  return (
    <ActionIcon
      size={34}
      radius="md"
      variant="default"
      aria-label="Go back"
      onClick={() => router.back()}
      styles={{
        root: {
          background: "var(--fj-surface-card)",
          border: "1px solid var(--fj-border)",
          color: "var(--fj-text-primary)",
        },
      }}
    >
      <IconArrowLeft size={18} color="currentColor" variant="Linear" />
    </ActionIcon>
  );
};

export default BackButton;
