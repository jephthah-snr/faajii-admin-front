"use client";

import { AppLayout } from "@/layout";
import { Box, Button, Flex } from "@mantine/core";
import classes from "@/styles/General.module.css";
import {
  ConfirmationModal,
  VendorDetailsSkeleton,
  VendorOverviewPanel,
} from "@/components";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useQuery } from "@tanstack/react-query";
import { VendorDetails } from "@/services/api/vendor-management/vendor.types";
import { ApproveVendor, GetVendorDetails, RejectVendor } from "@/services/api";

const VendorDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");

  const [modalState, setModalState] = useState({
    open: false,
    type: "", // 'approve' | 'reject' | 'error' | 'success'
    title: "",
    message: "",
    actionLabel: "",
    cancelLabel: "Cancel",
    action: () => {},
  });

  //Fetching vendor details
  const {
    data: vendorDetails,
    isFetching: isFetchingDetails,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["vendor-details", id],
    queryFn: () => GetVendorDetails(id, "overview"),
  });

  const vendorOverview = (vendorDetails?.data as VendorDetails) || null;

  // Set vendor title
  useEffect(() => {
    if (vendorOverview) {
      setTitle(vendorOverview?.vendor?.name);
    }
  }, [vendorOverview]);

  const openModal = (type: string, options: any = {}) => {
    switch (type) {
      case "approve":
        setModalState({
          open: true,
          type,
          title: "Approve Vendor?",
          message: "Do you really want to approve this vendor?",
          actionLabel: "Approve",
          cancelLabel: "Cancel",
          action: handleApprove,
        });
        break;

      case "reject":
        setModalState({
          open: true,
          type,
          title: "Reject Vendor?",
          message: "Do you really want to reject this vendor?",
          actionLabel: "Reject",
          cancelLabel: "Cancel",
          action: handleReject,
        });
        break;

      case "error":
        setModalState({
          open: true,
          type,
          title: "Error",
          message: options.message || "Something went wrong",
          actionLabel: "Close",
          cancelLabel: "",
          action: () =>
            setModalState((prev) => ({
              ...prev,
              open: false,
            })),
        });
        break;

      case "success":
        setModalState({
          open: true,
          type,
          title: "Successful",
          message: options.message || "Operation completed successfully",
          actionLabel: "Done",
          cancelLabel: "",
          action: () =>
            setModalState((prev) => ({
              ...prev,
              open: false,
            })),
        });
        break;

      default:
        break;
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await RejectVendor(String(id));
      setModalState((prev) => ({ ...prev, open: false }));
      openModal("success", {
        message: "Vendor has been rejected successfully",
      });

      setTimeout(() => {
        router.push("/vendor-management/pending");
      }, 1000);
    } catch (error: any) {
      console.error("Error rejecting vendor:", error);
      openModal("error", {
        message: error?.response?.data?.message || "Error rejecting vendor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await ApproveVendor(String(id));
      setModalState((prev) => ({ ...prev, open: false }));
      openModal("success", {
        message: "Vendor has been approved successfully",
      });

      refetchProfile();

      setTimeout(() => {
        router.push("/vendor-management");
      }, 1000);
    } catch (error: any) {
      console.error("Error approving vendor:", error);
      openModal("error", {
        message: error?.response?.data?.message || "Error approving vendor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      title="Pending vendors"
      subTitle={title || "N/A"}
      hasBackButton
      action={
        <Flex gap={10}>
          <Button
            color="#FF6464"
            c="#000000"
            onClick={() => openModal("reject")}
            radius="xl"
            fz={{ base: 14, md: 16 }}
          >
            Reject Vendor
          </Button>
          <Button
            color="#32B232"
            onClick={() => openModal("approve")}
            radius="xl"
            fz={{ base: 14, md: 16 }}
          >
            Accept Vendor
          </Button>
        </Flex>
      }
    >
      <Box pos="relative">
        {isFetchingDetails ? (
          <VendorDetailsSkeleton />
        ) : (
          <VendorOverviewPanel vendorOverview={vendorOverview} />
        )}
      </Box>

      {/* Confirmation modal */}
      <ConfirmationModal
        type={
          modalState.type === "approve"
            ? "warning"
            : modalState.type === "reject" || modalState.type === "error"
              ? "error"
              : "success"
        }
        opened={modalState.open}
        close={() => setModalState((prev) => ({ ...prev, open: false }))}
        title={modalState.title}
        message={modalState.message}
        actions={
          modalState.type === "success" || modalState.type === "error" ? (
            <Flex justify="center">
              <Button
                radius="xl"
                w="50%"
                className={classes.btnWhite}
                onClick={modalState.action}
              >
                {modalState.actionLabel}
              </Button>
            </Flex>
          ) : (
            <Flex justify="center" gap={14}>
              <Button
                radius="xl"
                className={classes.btnNeutral}
                onClick={() =>
                  setModalState((prev) => ({ ...prev, open: false }))
                }
                disabled={isLoading}
                miw="50%"
              >
                {modalState.cancelLabel}
              </Button>

              <Button
                radius="xl"
                className={
                  modalState.type === "reject"
                    ? classes.btnDanger
                    : modalState.type === "approve"
                      ? classes.btnWarning
                      : classes.btnWhite
                }
                onClick={modalState.action}
                loading={isLoading}
                miw="50%"
              >
                {modalState.actionLabel}
              </Button>
            </Flex>
          )
        }
      />
    </AppLayout>
  );
};

export default VendorDetailsPage;
