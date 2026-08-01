import { useState } from "react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { Box, Flex, Text } from "@mantine/core";
import { IconPlusOutline } from "@/icons";
import classes from "@/styles/General.module.css";
import Image from "next/image";

interface CustomDropzoneProps {
  title: string;
  onFileUpload: (file: File) => void;
}

const CustomDropzone = ({ onFileUpload, title }: CustomDropzoneProps) => {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleDrop = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      setError("");
      onFileUpload(file); // Send file to parent component
    }
  };

  const handleReject = () => {
    setError("File too large! Max file size should be 1MB.");
    setFileName("");
  };

  return (
    <Box>
      <Text fz={14} mb={8} c="#969696">
        Upload {title} photo
      </Text>
      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
        maxSize={1024 * 1024} // 1MB limit
        accept={IMAGE_MIME_TYPE}
        multiple={false}
        className={classes.dropzoneRoot}
      >
        <Flex justify="center" align="center" direction="column" mih={120}>
          <Flex justify="center" align="center" direction="column" gap={10}>
            <Image src={IconPlusOutline} alt="icon" width={40} height={40} />
            <Text fz={14} c="#fff">
              Drop image here or tap to select from computer
            </Text>
          </Flex>
          {fileName && !error && (
            <Text fz={12} c="#ccc" mt={4}>
              {fileName}
            </Text>
          )}
          {error && (
            <Text fz={12} c="red" mt={4}>
              {error}
            </Text>
          )}
        </Flex>
      </Dropzone>
    </Box>
  );
};

export default CustomDropzone;
