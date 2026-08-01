"use client";

import CustomModal from "./CustomModal";
import {
  Box,
  Button,
  Card,
  Flex,
  Group,
  ScrollArea,
  Text,
} from "@mantine/core";
import StatusBadge from "../status-badge";
import Image from "next/image";
import { NoImage } from "@/images";
import classes from "@/styles/General.module.css";
import { useQuery } from "@tanstack/react-query";
import { DeleteProduct, GetPartyBundleDetails } from "@/services/api";
import { ProductDetailsSkeleton } from "../skeletons";
import { formatStringAmount } from "@/utils";
import ConfirmationModal from "./ConfirmationModal";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

interface PartyBundleDetailsModalProps {
  opened: boolean;
  close: () => void;
  refetch: () => void;
  setConfirmationMessage: (message: string) => void;
  setConfirmationType: (type: "success" | "error") => void;
  openConfirmationModal: () => void;
  id: string;
}

const PartyBundleDetailsModal = ({
  opened,
  close,
  refetch,
  setConfirmationMessage,
  setConfirmationType,
  openConfirmationModal,
  id,
}: PartyBundleDetailsModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  const { data: bundleDetails, isFetching } = useQuery({
    queryKey: ["bundleDetails", id],
    queryFn: () => GetPartyBundleDetails(id),
  });

  const details = bundleDetails?.data;
  const total = (details?.quantity || 0) + (details?.unitsSold || 0);

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await DeleteProduct(id);
      setConfirmationMessage("Party bundle has been deleted successfully");
      setConfirmationType("success");
      refetch();
      closeDeleteModal();
      close();
      openConfirmationModal();
    } catch (error) {
      console.error("Error deleting event:", error);
      closeDeleteModal();
      close();
      setConfirmationMessage("Failed to delete party bundle");
      setConfirmationType("error");
      openConfirmationModal();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomModal opened={opened} close={close}>
      {isFetching ? (
        <ProductDetailsSkeleton />
      ) : (
        <Flex direction="column" gap={30}>
          <Flex gap={20}>
            <Text c="#D9D9D9B2">
              Bundle ID:{" "}
              <span className="text-white">#{details?.productId}</span>
            </Text>

            <StatusBadge status={details?.status || "Unknown"} />
          </Flex>

          {/* Bundle Details */}
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "start", md: "center" }}
            gap={20}
          >
            <Box className="relative w-[45%] h-[120px] md:h-[210px] border-4 border-[#363636] rounded-3xl bg-white overflow-hidden">
              <Image
                src={details?.images?.length ? details.images[0] : NoImage}
                alt="image"
                fill
              />
            </Box>
            <Flex direction="column" className="md:w-[55%]" gap={20}>
              <Flex direction="column" gap={4}>
                <Text fz={14} c="#D9D9D9B2">
                  Bundle Name
                </Text>
                <Text c="white">{details?.name || "N/A"}</Text>
              </Flex>
              <Flex direction="column" gap={4}>
                <Text fz={14} c="#D9D9D9B2">
                  Price
                </Text>
                <Text c="white">
                  ₦{formatStringAmount(details?.amount || "0.00")}
                </Text>
              </Flex>
              <Group gap={20}>
                <Flex direction="column" gap={4}>
                  <Text fz={14} c="#D9D9D9B2">
                    In stock
                  </Text>
                  <Text c="white">
                    {details?.quantity !== null ? details?.quantity : 0}
                  </Text>
                </Flex>
                <Flex direction="column" gap={4}>
                  <Text fz={14} c="#D9D9D9B2">
                    Processed
                  </Text>
                  <Text c="white">
                    {details?.unitsSold !== null ? details?.unitsSold : 0}
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

            <Card radius="md" bg="#131313">
              <ScrollArea.Autosize mah={250} scrollbarSize={7} offsetScrollbars>
                <Text c="#969696">{details?.description || "N/A"}</Text>
              </ScrollArea.Autosize>
            </Card>
          </Flex>

          {/* Buttons */}
          <Flex gap="sm">
            <Button
              onClick={openDeleteModal}
              radius="xl"
              className={classes.btnDanger}
              fullWidth
            >
              Delete
            </Button>
            <Button radius="xl" className={classes.btnWhite} fullWidth>
              Edit
            </Button>
          </Flex>
        </Flex>
      )}

      <ConfirmationModal
        type="error"
        opened={deleteModalOpened}
        close={closeDeleteModal}
        title="Delete Bundle?"
        message="Do you really want to delete this party bundle?"
        actions={
          <Flex justify="center" gap={14}>
            <Button
              radius="xl"
              className={classes.btnNeutral}
              onClick={closeDeleteModal}
              disabled={isLoading}
              miw="50%"
            >
              Cancel
            </Button>
            <Button
              radius="xl"
              className={classes.btnDanger}
              onClick={handleDelete}
              loading={isLoading}
              miw="50%"
            >
              Delete Bundle
            </Button>
          </Flex>
        }
      />
    </CustomModal>
  );
};

export default PartyBundleDetailsModal;
