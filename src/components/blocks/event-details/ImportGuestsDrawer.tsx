"use client";

import { useState } from "react";
import {
  ActionIcon,
  alpha,
  Box,
  Button,
  Drawer,
  Flex,
  Switch,
  Table,
  Text,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImportEventGuestsCsv } from "@/services/api";
import { ImportGuestsCsvResult } from "@/services/api/event/event.types";
import { getApiErrorMessage, STATUS_PALETTE } from "@/utils";
import { IconClose, IconDocument, IconUpload } from "@/config/icons";
import classes from "@/styles/General.module.css";
import PpTable from "../table";
import StatBar from "../stat-bar";

/** Matches the server's multer limit, so an oversize file fails before upload. */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Windows reports .csv files as the Excel MIME type, so both are accepted.
const CSV_MIME_TYPES = [MIME_TYPES.csv, "application/vnd.ms-excel"];

const issueHeaders = ["Row", "Email", "Outcome", "Reason"];

// Same tint and border strengths as StatusBadge, so a valid drag reads as
// "Confirmed" and an invalid one as "Failed".
const dropzoneTones = {
  "--dropzone-accept-bg": alpha(STATUS_PALETTE.success, 0.14),
  "--dropzone-accept-bd": alpha(STATUS_PALETTE.success, 0.32),
  "--dropzone-accept-color": STATUS_PALETTE.success,
  "--dropzone-reject-bg": alpha(STATUS_PALETTE.danger, 0.14),
  "--dropzone-reject-bd": alpha(STATUS_PALETTE.danger, 0.32),
  "--dropzone-reject-color": STATUS_PALETTE.danger,
} as React.CSSProperties;

interface ImportGuestsDrawerProps {
  opened: boolean;
  close: () => void;
  eventId: string;
}

const ImportGuestsDrawer = ({
  opened,
  close,
  eventId,
}: ImportGuestsDrawerProps) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [sendInviteEmails, setSendInviteEmails] = useState(true);
  const [result, setResult] = useState<ImportGuestsCsvResult | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const importGuests = useMutation({
    mutationFn: (csv: File) =>
      ImportEventGuestsCsv({ file: csv, eventId, sendInviteEmails }),
    onSuccess: (response) => {
      setResult(response.data);
      notifications.show({
        color: "teal",
        message: `${response.data.summary.created} guest(s) imported`,
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-event-guests", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-event-tickets", eventId],
      });
    },
    onError: (error) =>
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Failed to import guest list"),
      }),
  });

  const reset = () => {
    setFile(null);
    setResult(null);
    setSendInviteEmails(true);
    importGuests.reset();
  };

  const handleClose = () => {
    // Closing mid-upload would hide the outcome of an import still running.
    if (importGuests.isPending) return;
    reset();
    close();
  };

  const issues = result
    ? [
        ...result.skipped.map((issue) => ({ ...issue, outcome: "Skipped" })),
        ...result.failed.map((issue) => ({ ...issue, outcome: "Failed" })),
      ].sort((a, b) => a.row - b.row)
    : [];

  const issueRows = issues.map((issue) => (
    <Table.Tr key={`${issue.outcome}-${issue.row}`}>
      <Table.Td>{issue.row}</Table.Td>
      <Table.Td>{issue.email || "N/A"}</Table.Td>
      <Table.Td>
        <Text
          fz="sm"
          c={issue.outcome === "Failed" ? "red" : "var(--fj-accent)"}
        >
          {issue.outcome}
        </Text>
      </Table.Td>
      <Table.Td>{issue.reason}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      size={isMobile ? "100%" : "lg"}
      title="Import Guest List"
    >
      {result ? (
        <Flex direction="column" gap={20} mt={20}>
          <StatBar
            minCellWidth={110}
            items={[
              { label: "Rows", value: result.summary.totalRows },
              { label: "Created", value: result.summary.created },
              { label: "Skipped", value: result.summary.skipped },
              { label: "Failed", value: result.summary.failed },
            ]}
          />

          {issues.length > 0 && (
            <Flex direction="column" gap={8}>
              <Text fw={700}>Rows not imported</Text>
              <PpTable
                headers={issueHeaders}
                rowData={issueRows}
                showPagination={false}
              />
            </Flex>
          )}

          <Flex direction={{ base: "column", xs: "row" }} gap={14}>
            <Button
              radius="xl"
              className={classes.btnNeutral}
              onClick={reset}
              flex={1}
            >
              Import another file
            </Button>
            <Button
              radius="xl"
              className={classes.btnWhite}
              onClick={handleClose}
              flex={1}
            >
              Done
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Flex direction="column" gap={20} mt={20}>
          <Text fz="sm" c="var(--fj-text-muted)">
            Upload a CSV with a header row of <b>fullName</b>, <b>email</b> and
            an optional <b>phoneNumber</b> column. Each row is invited with one
            ticket. Duplicate emails are skipped. Maximum 2,000 rows.
          </Text>

          {file ? (
            <Flex
              align="center"
              justify="space-between"
              gap={10}
              p={14}
              className={classes.dropzoneRoot}
            >
              <Flex align="center" gap={10} miw={0}>
                <IconDocument size={24} color="currentColor" variant="Linear" />
                <Box miw={0} ta="left">
                  <Text fz="sm" truncate>
                    {file.name}
                  </Text>
                  <Text fz="xs" c="var(--fj-text-muted)">
                    {(file.size / 1024).toFixed(1)} KB
                  </Text>
                </Box>
              </Flex>
              <ActionIcon
                variant="transparent"
                aria-label="Remove file"
                onClick={() => setFile(null)}
                disabled={importGuests.isPending}
              >
                <IconClose size={20} color="currentColor" variant="Linear" />
              </ActionIcon>
            </Flex>
          ) : (
            <Dropzone
              onDrop={(files) => setFile(files[0] ?? null)}
              onReject={(rejections) =>
                notifications.show({
                  color: "red",
                  message:
                    rejections[0]?.errors[0]?.code === "file-too-large"
                      ? "The file is larger than 50 MB"
                      : "Only a single .csv file can be uploaded",
                })
              }
              accept={CSV_MIME_TYPES}
              maxSize={MAX_FILE_SIZE}
              multiple={false}
              classNames={{ root: classes.dropzoneRoot }}
              style={dropzoneTones}
            >
              <Flex direction="column" align="center" gap={8} py={30}>
                <IconUpload size={32} color="currentColor" variant="Linear" />
                <Dropzone.Accept>
                  <Text fz="sm" fw={500} c="inherit">
                    Drop file here
                  </Text>
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <Text fz="sm" fw={500} c="inherit">
                    Only a single .csv file can be uploaded
                  </Text>
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <Text fz="sm">Drag a CSV here or click to browse</Text>
                  <Text fz="xs" c="var(--fj-text-muted)">
                    .csv only, up to 50 MB
                  </Text>
                </Dropzone.Idle>
              </Flex>
            </Dropzone>
          )}

          <Switch
            label="Send invitation emails"
            description="Email each imported guest their RSVP invitation."
            checked={sendInviteEmails}
            onChange={(event) =>
              setSendInviteEmails(event.currentTarget.checked)
            }
            disabled={importGuests.isPending}
          />

          <Button
            radius="xl"
            className={classes.btnWhite}
            fw={500}
            fullWidth
            disabled={!file}
            loading={importGuests.isPending}
            onClick={() => file && importGuests.mutate(file)}
          >
            Import Guests
          </Button>
        </Flex>
      )}
    </Drawer>
  );
};

export default ImportGuestsDrawer;
