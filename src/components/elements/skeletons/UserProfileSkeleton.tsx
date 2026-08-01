import { Flex, Skeleton } from "@mantine/core";

const UserProfileSkeleton = () => {
  return (
    <>
      <Flex justify="space-between" align="center" mb={20} gap={10}>
        <Skeleton radius={"xl"} width={"40%"} height={18} />
        <Skeleton radius={"xl"} width={"20%"} height={16} />
      </Flex>

      {/* Profile summary */}
      <Flex direction="column" gap={40}>
        <Flex direction="column" align="center" gap={18}>
          <Skeleton radius={"xl"} circle width={120} height={120} />
          <Flex direction="column" align="center">
            <Skeleton radius={"xl"} width={100} height={18} />
          </Flex>
        </Flex>

        <Flex direction="column" gap={10}>
          {[...Array(3)].map((_, rowIndex) => (
            <Flex
              key={rowIndex}
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              gap={10}
            >
              <Skeleton width={"30%"} height={15} radius="xl" />
              <Skeleton width={"70%"} height={15} radius="xl" />
            </Flex>
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export default UserProfileSkeleton;
