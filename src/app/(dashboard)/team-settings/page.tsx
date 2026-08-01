"use client";

import { Administrators, AuditLog, RolesPermissions } from "@/components";
import { AppLayout } from "@/layout";
import { Box, Tabs, Text } from "@mantine/core";
import classes from "@/styles/General.module.css";
import { useState } from "react";

const TeamSettings = () => {
  const [activeTab, setActiveTab] = useState<string | null>("administrators");

  return (
    <AppLayout title="Settings">
      <Box pos="relative">
        {activeTab === "audit" && (
          <Text
            pos={{ base: "relative", md: "absolute" }}
            mb={{ base: 20, md: 0 }}
            right={0}
            top={10}
            fz={13}
            c="#868686"
          >
            *This is a view-only page
          </Text>
        )}

        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
          classNames={{
            list: classes.tabPillList,
            tab: classes.tabPill,
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="administrators">Administrators</Tabs.Tab>
            <Tabs.Tab value="roles">Roles & Permissions</Tabs.Tab>
            <Tabs.Tab value="audit">Audit Log</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="administrators">
            <Administrators />
          </Tabs.Panel>
          <Tabs.Panel value="roles">
            <RolesPermissions />
          </Tabs.Panel>
          <Tabs.Panel value="audit">
            <AuditLog />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </AppLayout>
  );
};

export default TeamSettings;
