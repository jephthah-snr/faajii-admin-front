"use client";

import { Alert, Box, BoxProps, Code, Flex, List, Text } from "@mantine/core";

interface PendingBackendProps extends BoxProps {
  /** What this screen will show once the API is live. */
  feature: string;
  /** Routes the backend still has to expose, e.g. `GET /admin/check-ins`. */
  endpoints?: string[];
}

/**
 * Shown when a module's endpoints answer 404 — the screen is finished, the API
 * isn't deployed yet. Naming the exact routes keeps the handover explicit
 * instead of leaving an operator staring at an empty table.
 */
const PendingBackend = ({
  feature,
  endpoints = [],
  ...props
}: PendingBackendProps) => {
  return (
    <Box mt={20} {...props}>
      <Alert
        variant="light"
        color="yellow"
        radius="lg"
        title={`${feature} is awaiting backend support`}
      >
        <Flex direction="column" gap={10}>
          <Text fz={14} c="#D9D9D9B2">
            This screen is built and will populate as soon as the API is
            deployed. Nothing is broken on the admin side.
          </Text>

          {endpoints.length > 0 && (
            <Box>
              <Text fz={13} fw={700} c="#fff" mb={6}>
                Endpoints required
              </Text>
              <List spacing={4} size="sm" listStyleType="none">
                {endpoints.map((endpoint) => (
                  <List.Item key={endpoint}>
                    <Code>{endpoint}</Code>
                  </List.Item>
                ))}
              </List>
            </Box>
          )}
        </Flex>
      </Alert>
    </Box>
  );
};

export default PendingBackend;
