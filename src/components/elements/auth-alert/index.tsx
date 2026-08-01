"use client";

import { Alert } from "@mantine/core";
import { useEffect, useState } from "react";

interface AuthAlertProps {
  title: string;
  color: string;
  onClose?: () => void;
}

const AuthAlert = ({ title, color, onClose }: AuthAlertProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.(); // Notify parent when alert disappears
    }, 3000);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [onClose]);

  return (
    <>
      {visible && (
        <Alert
          variant="filled"
          color={color}
          radius="md"
          styles={{
            label: {
              width: "100%",
              textAlign: "center",
              fontSize: "16px",
              fontWeight: 400,
            },
          }}
          title={title}
        />
      )}
    </>
  );
};

export default AuthAlert;
