"use client";

import {
  ActionIcon,
  Avatar,
  BackgroundImage,
  Box,
  Card,
  Center,
  Flex,
  ScrollArea,
  Text,
} from "@mantine/core";
import classes from "@/styles/General.module.css";
import { FormatDate, StatusBadge } from "@/components/elements";
import { extractDocId, formatStringAmount, initialsColors } from "@/utils";
import { IconDocument, IconEye } from "@/config/icons";
import { NoImage } from "@/images";
import { VendorDetails } from "@/services/api/vendor-management/vendor.types";
import Link from "next/link";

interface VendorOverviewPanelProps {
  vendorOverview: VendorDetails | null;
}

const validSocial = (val?: string) => (val && val !== "N/A" ? val : undefined);

const viewCacDocument = (url: string) => {
  if (!url) return;
  window.open(url, "_blank");
};

const VendorOverviewPanel = ({ vendorOverview }: VendorOverviewPanelProps) => {
  return (
    <Flex direction={{ base: "column", md: "row" }} gap={20}>
      <Flex direction="column" gap={20} flex={{ base: 1, md: "0 40%" }}>
        {/* Profile */}
        <Card radius={16} p={20} bg="transparent">
          <Flex direction="column" gap={30}>
            {/* Details */}
            <Flex align="flex-start" gap={20}>
              <Box>
                <BackgroundImage
                  src={vendorOverview?.vendor?.avatar || NoImage.src}
                  w={120}
                  h={120}
                  radius={14}
                />
              </Box>

              <Flex direction="column" gap={10}>
                <Flex direction="column" gap={2}>
                  <Text fw={500} fz={18} c="#FFFFFF" tt="capitalize">
                    {vendorOverview?.vendor?.name || "N/A"}
                  </Text>
                  <Text fw={500} c="#D9D9D9B2">
                    {vendorOverview?.vendor?.title || "N/A"}
                  </Text>
                </Flex>

                <StatusBadge
                  status={vendorOverview?.vendor?.status || "Unknown"}
                  px={0}
                />
              </Flex>
            </Flex>

            {/* Contact */}
            <Flex direction="column" gap={10}>
              <ProfileDetail
                title="Email:"
                value={vendorOverview?.vendor?.email || "N/A"}
                hyperLink={`mailto:${vendorOverview?.vendor?.email}`}
              />
              <ProfileDetail
                title="Phone:"
                value={vendorOverview?.vendor?.phone || "N/A"}
                hyperLink={`tel:${vendorOverview?.vendor?.phone}`}
              />
              <ProfileDetail
                title="Location:"
                value={vendorOverview?.vendor?.location || "N/A"}
                align="flex-start"
              />
            </Flex>

            {/* Description */}
            <Flex direction="column" gap={10}>
              <Text fw={500} fz={14} c="#5E5E5E">
                Description:
              </Text>
              <Text fz={13} c="#fff">
                {vendorOverview?.vendor?.description || "N/A"}
              </Text>
            </Flex>

            {/* Socials */}
            <Flex direction="column" gap={10}>
              <ProfileDetail
                title="Website:"
                value={vendorOverview?.socials?.website || "N/A"}
                hyperLink={vendorOverview?.socials?.website}
                isWebsite
              />
              <ProfileDetail
                title="Instagram:"
                value={
                  validSocial(vendorOverview?.socials?.instagram)
                    ? `@${vendorOverview!.socials.instagram}`
                    : "N/A"
                }
                hyperLink={
                  validSocial(vendorOverview?.socials?.instagram)
                    ? `https://instagram.com/${vendorOverview!.socials.instagram}`
                    : undefined
                }
              />
              <ProfileDetail
                title="X (Twitter):"
                value={
                  validSocial(vendorOverview?.socials?.twitter)
                    ? `@${vendorOverview!.socials.twitter}`
                    : "N/A"
                }
                hyperLink={
                  validSocial(vendorOverview?.socials?.twitter)
                    ? `https://x.com/${vendorOverview!.socials.twitter}`
                    : undefined
                }
              />
              <ProfileDetail
                title="Facebook:"
                value={vendorOverview?.socials?.facebook || "N/A"}
                hyperLink={
                  validSocial(vendorOverview?.socials?.facebook)
                    ? `https://facebook.com/${vendorOverview!.socials.facebook}`
                    : undefined
                }
              />
            </Flex>

            {/* Date */}
            <ProfileDetail
              title="Date joined:"
              value={
                <Text c="#fff">
                  <FormatDate
                    data={vendorOverview?.vendor?.dateJoined || ""}
                    formatType="fullDate"
                  />
                </Text>
              }
            />

            {/* OG Account */}
            <ProfileDetail
              title="OG Account:"
              value={
                <Flex align="center" gap={8}>
                  <Avatar
                    size="sm"
                    src={
                      vendorOverview?.vendor?.ownerAccount?.avatar || undefined
                    }
                    name={vendorOverview?.vendor?.ownerAccount?.name || ""}
                    color="initials"
                    allowedInitialsColors={initialsColors}
                    alt="avatar"
                  />
                  <Text c="#E1E1E1" fw={500} fz={14} tt="capitalize">
                    {vendorOverview?.vendor?.ownerAccount?.name || "N/A"}
                  </Text>
                </Flex>
              }
            />
          </Flex>
        </Card>
      </Flex>

      <Flex flex={{ base: 1, md: "0 60%" }} direction="column" gap={20}>
        {/* Products & Services */}
        <Card radius={16} p={20} bg="transparent">
          <Flex direction="column" gap={20}>
            <Text fw={700} c="#fff">
              Products & Services
            </Text>

            <ScrollArea.Autosize
              mah={{ base: 300, md: "60vh" }}
              scrollbarSize={0}
            >
              <Flex direction="column" gap={20}>
                {vendorOverview?.services &&
                vendorOverview?.services?.length > 0 ? (
                  vendorOverview.services.map((service, index) => (
                    <Card key={index} p={0} radius={16} bg="var(--fj-surface)">
                      <Flex>
                        <BackgroundImage
                          src={service?.imageUrl || NoImage.src}
                          w={{ base: 120, md: 120 }}
                          bgsz="cover"
                        />
                        <Flex direction="column" gap={10} p={14} w="100%">
                          <Flex direction="column" gap={6}>
                            <Text c="#FFFFFF">{service?.name || "N/A"}</Text>
                            <Text fz={14} c="#5E5E5E" fw={500} lineClamp={1}>
                              {service?.description || "N/A"}
                            </Text>
                          </Flex>
                          <Text c="#F5C912" fw={500}>
                            ₦ {formatStringAmount(service?.price || "0.00")}
                          </Text>
                        </Flex>
                      </Flex>
                    </Card>
                  ))
                ) : (
                  <Card bg="var(--fj-surface)" radius={10} h={100}>
                    <Center h="100%">
                      <Text fz={13} c="#D9D9D9B2" ta="center">
                        No services found for this vendor
                      </Text>
                    </Center>
                  </Card>
                )}
              </Flex>
            </ScrollArea.Autosize>
          </Flex>
        </Card>

        {/* Documents */}
        <Card radius={16} p={20} bg="transparent">
          <Flex direction="column" gap={20}>
            <Text fw={700} c="#fff">
              Documents
            </Text>

            <ScrollArea.Autosize mah={240} scrollbarSize={0}>
              <Flex direction="column" gap={16}>
                {vendorOverview?.vendor?.documents &&
                vendorOverview?.vendor?.documents?.length > 0
                  ? vendorOverview.vendor.documents.map((doc, index) => (
                      <Flex
                        key={index}
                        align="center"
                        justify="space-between"
                        gap={14}
                      >
                        <Flex align="center" gap={8}>
                          <IconDocument size={26} color="currentColor" variant="Linear" />
                          <Flex direction="column" gap={2}>
                            <Text c="#fff" fw={500} fz={14}>
                              Registration Doc-{extractDocId(doc)}.pdf
                            </Text>
                          </Flex>
                        </Flex>

                        <ActionIcon
                          variant="transparent"
                          onClick={() => viewCacDocument(doc)}
                        >
                          <IconEye size={24} color="currentColor" variant="Linear" />
                        </ActionIcon>
                      </Flex>
                    ))
                  : "N/A"}
              </Flex>
            </ScrollArea.Autosize>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
};

export default VendorOverviewPanel;

export const ProfileDetail = ({
  title,
  value,
  align,
  hyperLink,
  isWebsite,
}: {
  title: string;
  value: string | React.ReactNode;
  align?: "center" | "flex-start" | "flex-end";
  hyperLink?: string;
  isWebsite?: boolean;
}) => {
  const normalizeUrl = (url: string) => {
    if (!url) return url;
    return url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
  };

  const resolvedHref = isWebsite ? normalizeUrl(hyperLink!) : hyperLink!;

  const isValidLink =
    typeof value === "string" && hyperLink && value !== "N/A" && value;

  return (
    <Flex align={align || "center"} gap={16}>
      <Text fz={14} fw={500} c="#5E5E5E" flex="25% 0">
        {title}
      </Text>
      <Box flex="75% 0">
        {isValidLink ? (
          <Link
            href={resolvedHref}
            target="_blank"
            className={classes.hoverUnderline}
          >
            <Text c="#fff" className="hover-underline">
              {value}
            </Text>
          </Link>
        ) : typeof value === "string" ? (
          <Text c="#fff">{value || "N/A"}</Text>
        ) : (
          value
        )}
      </Box>
    </Flex>
  );
};
