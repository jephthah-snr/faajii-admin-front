import { ActionIcon, Box, Flex, Modal, Text } from "@mantine/core";
import classes from "@/styles/General.module.css";
import { IconClose, IconDanger, IconSuccess, IconWarning } from "@/config/icons";
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
        <IconClose size={20} color="currentColor" variant="Linear" />
      </ActionIcon>

      {type === "error" ? (
        <IconDanger size={48} color="var(--fj-danger)" variant="Bulk" />
      ) : type === "success" ? (
        <IconSuccess size={48} color="var(--fj-success)" variant="Bulk" />
      ) : (
        <IconWarning size={48} color="var(--fj-accent)" variant="Bulk" />
      )}

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
