import { CustomModal, ProductDetailsSkeleton, StatusBadge } from "@/components";
import { Box, Button, Flex, Group, Text } from "@mantine/core";
import Image from "next/image";
import classes from "@/styles/General.module.css";
import { NoImage } from "@/images";
import { useQuery } from "@tanstack/react-query";
import { GetProductDetails } from "@/services/api";
import { formatStringAmount } from "@/utils";

interface ProductDetailsModalProps {
  opened: boolean;
  close: () => void;
  type: "gift" | "drink";
  id: string;
}

const ProductDetailsModal = ({
  opened,
  close,
  type,
  id,
}: ProductDetailsModalProps) => {
  const { data: product, isFetching } = useQuery({
    queryKey: ["product", id],
    queryFn: () => GetProductDetails(id),
  });
  const productData = product?.data;

  const total = (productData?.quantity || 0) + (productData?.unitsSold || 0);

  return (
    <CustomModal opened={opened} close={close}>
      {isFetching ? (
        <ProductDetailsSkeleton />
      ) : (
        <Flex direction="column" gap={30}>
          <Flex gap={20}>
            <Text c="#D9D9D9B2">
              {type === "gift" ? "Gift ID" : "Drink ID"}:{" "}
              <span className="text-white">
                #{productData?.productId || "N/A"}
              </span>
            </Text>

            <StatusBadge status={productData?.status || "Unknown"} />
          </Flex>

          {/* Gift Details */}
          <Flex direction={{ base: "column", md: "row" }} gap={20}>
            <Box className="relative w-[45%] h-[120px] md:h-[200px] border-4 border-[#363636] rounded-3xl bg-white overflow-hidden">
              <Image
                src={
                  productData?.images?.length ? productData.images[0] : NoImage
                }
                alt="image"
                fill
              />
            </Box>
            <Flex direction="column" gap={20}>
              <Flex direction="column" gap={4}>
                <Text fz={14} c="#D9D9D9B2">
                  {type === "gift" ? "Gift Name" : "Drink Name"}
                </Text>
                <Text c="white">{productData?.name || ""}</Text>
              </Flex>
              <Flex direction="column" gap={4}>
                <Text fz={14} c="#D9D9D9B2">
                  Price
                </Text>
                <Text c="white">
                  ₦{formatStringAmount(productData?.amount || 0.0)}
                </Text>
              </Flex>
              <Group gap={20}>
                <Flex direction="column" gap={4}>
                  <Text fz={14} c="#D9D9D9B2">
                    In stock
                  </Text>
                  <Text c="white">
                    {productData?.quantity !== null ? productData?.quantity : 0}
                  </Text>
                </Flex>
                <Flex direction="column" gap={4}>
                  <Text fz={14} c="#D9D9D9B2">
                    Processed
                  </Text>
                  <Text c="white">
                    {productData?.unitsSold !== null
                      ? productData?.unitsSold
                      : 0}
                  </Text>
                </Flex>
                <Flex direction="column" gap={4}>
                  <Text fz={14} c="#D9D9D9B2">
                    Total
                  </Text>
                  <Text c="white">{total}</Text>
                </Flex>
              </Group>
            </Flex>
          </Flex>

          {/* Description */}
          <Flex direction="column" gap={4}>
            <Text fz={14} c="#D9D9D9B2">
              Description
            </Text>
            <Text c="white">{productData?.description || ""}</Text>
          </Flex>

          {/* Buttons */}
          <Flex gap="sm">
            <Button radius="xl" className={classes.btnDanger} fullWidth>
              Delete
            </Button>
            <Button radius="xl" className={classes.btnWhite} fullWidth>
              Edit
            </Button>
          </Flex>
        </Flex>
      )}
    </CustomModal>
  );
};

export default ProductDetailsModal;
