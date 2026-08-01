"use client";

import { Box, Flex, Modal, Text } from "@mantine/core";

interface CustomModalProps {
  opened: boolean;
  close: () => void;
  title?: string;
  hasTitle?: boolean;
  children: React.ReactNode;
  size?: number;
  stepper?: React.ReactNode;
}

const CustomModal = ({
  opened,
  close,
  title,
  hasTitle = true,
  children,
  size = 510,
  stepper,
}: CustomModalProps) => {
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        transitionProps={{ transition: "fade-up" }}
        size={size}
        centered
        withCloseButton={stepper ? false : true}
        title={
          <>
            {hasTitle && (
              <Flex>
                <Box w="100%">
                  <Text ta="center" fz={18} fw={700}>
                    {title}
                  </Text>

                  {stepper && stepper}
                </Box>

                {stepper && <Modal.CloseButton />}
              </Flex>
            )}
          </>
        }
      >
        <Box px={10} pb={10}>
          {children}
        </Box>
      </Modal>
    </>
  );
};

export default CustomModal;
