"use client";

import { ActionIcon, CopyButton, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@/config/icons";

interface CopyIconButtonProps {
  /** What lands on the clipboard. Renders nothing when empty. */
  value?: string | number | null;
  label?: string;
  size?: number;
}

/**
 * Small copy-to-clipboard icon that sits beside a reference, so an admin can
 * lift it into a support chat or a provider dashboard without selecting text.
 * Clicks don't bubble, so it is safe inside a clickable card or drawer title.
 */
const CopyIconButton = ({
  value,
  label = "Copy",
  size = 16,
}: CopyIconButtonProps) => {
  if (value === undefined || value === null || value === "") return null;

  return (
    <CopyButton value={String(value)} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip
          label={copied ? "Copied" : label}
          opened={copied ? true : undefined}
          color={copied ? "#24A181" : undefined}
          withArrow
          position="top"
        >
          <ActionIcon
            variant="transparent"
            size="sm"
            aria-label={label}
            onClick={(event) => {
              event.stopPropagation();
              copy();
            }}
          >
            {copied ? (
              <IconCheck size={size} color="currentColor" variant="Linear" />
            ) : (
              <IconCopy size={size} color="currentColor" variant="Linear" />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
};

export default CopyIconButton;
