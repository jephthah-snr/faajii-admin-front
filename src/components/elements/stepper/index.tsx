import { Box, Flex, Text } from "@mantine/core";

interface CustomStepperProps {
  step: number;
  totalSteps: number;
}

const CustomStepper = ({ step, totalSteps }: CustomStepperProps) => {
  return (
    <Box mt={20}>
      <Flex justify="center">
        <Box w="50%" className="h-1 bg-zinc-800 rounded-full ">
          <Box
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </Box>
      </Flex>
      <Text ta="center" fz={12} c="#fff" mt={10}>
        {step}/{totalSteps}
      </Text>
    </Box>
  );
};

export default CustomStepper;
