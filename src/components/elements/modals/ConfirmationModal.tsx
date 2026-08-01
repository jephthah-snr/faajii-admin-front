import { ActionIcon, Box, Flex, Modal, Text } from "@mantine/core";
import classes from "@/styles/General.module.css";
import { IconClose, IconDanger, IconSuccess, IconWarning } from "@/icons";
import Image from "next/image";
import { ConfirmationModalTypes } from "@/services/api/utils/utils.types";

interface ConfirmationModalProps {
  opened: boolean;
  close: () => void;
  title?: string;
  message?: string;
  actions?: React.ReactNode;
  type?: ConfirmationModalTypes;
}

const ConfirmationModal = ({
  opened,
  close,
  title,
  message,
  actions,
  type = "default",
}: ConfirmationModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      className="relative"
      transitionProps={{ transition: "fade-up" }}
      classNames={{
        content: `${classes.modalContent} ${classes["confirmation-modal"]}`,
      }}
      centered
      size="sm"
    >
      <ActionIcon
        pos="absolute"
        variant="transparent"
        right={10}
        top={10}
        onClick={close}
      >
        <Image src={IconClose} width={20} height={20} alt="icon" />
      </ActionIcon>

      <Image
        src={
          type === "error"
            ? IconDanger
            : type === "success"
            ? IconSuccess
            : IconWarning
        }
        width={50}
        height={50}
        alt="icon"
      />

      <Flex direction="column" gap={6} mt={10} px="sm">
        <Text fw={500}>{title}</Text>
        <Text fw={400} fz={14}>
          {message}
        </Text>
      </Flex>

      <Box mt={30}>{actions}</Box>
    </Modal>
  );
};

export default ConfirmationModal;
