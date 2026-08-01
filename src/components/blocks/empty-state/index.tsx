import { NoDataIllustration } from "@/images/svg";
import { Box, BoxProps, Flex, Text } from "@mantine/core";
import Image from "next/image";

interface EmptyStateProps extends BoxProps {
  title?: string;
  description?: string;
}

const EmptyState = ({
  title = "No Data Yet",
  description = "When data is available, you'll see it here",
  ...props
}: EmptyStateProps) => {
  return (
    <Box mt={40} {...props}>
      <Flex direction={"column"} gap={10} align={"center"} justify={"center"}>
        {/* Icon */}
        <Image
          src={NoDataIllustration}
          width={140}
          height={140}
          alt="no data"
        />
        <Flex
          w={{ base: "60%", md: "40%" }}
          direction="column"
          align="center"
          justify="center"
          gap={4}
        >
          <Text c="#fff" ta="center" fw={700}>
            {title}
          </Text>
          <Text c="#757575" ta="center">
            {description}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default EmptyState;
