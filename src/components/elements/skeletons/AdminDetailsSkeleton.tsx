import { Flex, Skeleton } from "@mantine/core";

const AdminDetailsSkeleton = () => {
  return (
    <>
      <Flex align={"flex-end"} direction="column" gap={8}>
        <Skeleton radius="xl" w={60} h={10} />
        <Skeleton radius="xl" w={120} h={10} />
      </Flex>

      <Flex direction="column" align="center" mt={80} gap={30}>
        <Skeleton radius="xl" circle w={105} h={105} />

        {/* Form */}
        <Flex direction="column" gap={16} w="100%">
          {[...Array(4)].map((_, rowIndex) => (
            <Skeleton key={rowIndex} width={"100%"} height={40} radius="lg" />
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export default AdminDetailsSkeleton;
