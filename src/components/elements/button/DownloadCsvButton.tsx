"use client";

import { Button } from "@mantine/core";
import { IconDownload } from "@/config/icons";

interface DownloadCsvButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}

/** Export action for a table toolbar. Sized to sit level with the filter pills. */
const DownloadCsvButton = ({
  onClick,
  loading = false,
  label = "Export CSV",
}: DownloadCsvButtonProps) => (
  <Button
    h={40}
    radius={10}
    variant="light"
    color="faajii"
    onClick={onClick}
    loading={loading}
    disabled={loading}
    styles={{ root: { minWidth: "auto" } }}
    leftSection={
      !loading ? (
        <IconDownload size={18} color="currentColor" variant="Linear" />
      ) : undefined
    }
  >
    {loading ? "Exporting…" : label}
  </Button>
);

export default DownloadCsvButton;
