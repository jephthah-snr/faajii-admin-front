"use client";

import {
  ActionIcon,
  Button,
  Checkbox,
  Divider,
  Flex,
  Indicator,
  Menu,
  Text,
} from "@mantine/core";
import Image from "next/image";
import { useState } from "react";
import { IconCaretDown, IconClose } from "@/icons";
import { orderStatuses } from "@/utils";

interface StatusFilterProps {
  value: string[];
  onApply: (value: string[]) => void;
}

export default function StatusFilter({ value, onApply }: StatusFilterProps) {
  const [opened, setOpened] = useState(false);
  const [tempStatuses, setTempStatuses] = useState<string[]>(value);

  const handleApply = () => {
    onApply(tempStatuses);
    setOpened(false);
  };

  const handleClear = () => {
    setTempStatuses([]);
    onApply([]);
  };

  return (
    <Menu opened={opened} onChange={setOpened} shadow="md">
      <Menu.Target>
        <Indicator
          color="#5769E9"
          size={20}
          offset={4}
          disabled={value.length < 2}
          label={value.length > 1 ? `+${value.length - 1}` : ""}
          processing
        >
          <Button
            size="sm"
            h={40}
            style={{ border: "1px solid #181818" }}
            color="#0D0D0D"
            radius={8}
            miw="fit-content"
            onClick={() => setOpened(true)}
          >
            <Flex align="center" justify="space-between" gap={10}>
              <Text fz={14} c="#868686">
                Status:
              </Text>
              <Flex align="center" gap={4}>
                <Text>{value[0] || "All"}</Text>
                <Image src={IconCaretDown} width={20} height={20} alt="icon" />
              </Flex>
            </Flex>
          </Button>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown
        bg="#141414"
        style={{ border: "1px solid #1B1B1B" }}
        miw={300}
      >
        <Flex direction="column" p={4} gap={12}>
          <Flex align="center" justify="space-between" gap={12}>
            <Text fz={14}>Status</Text>
            <ActionIcon
              variant="transparent"
              p={0}
              onClick={() => setOpened(false)}
            >
              <Image src={IconClose} width={20} height={20} alt="icon" />
            </ActionIcon>
          </Flex>

          <Divider color="#39393980" />

          <Checkbox.Group value={tempStatuses} onChange={setTempStatuses}>
            <Flex direction="column" gap={16} my={4}>
              {orderStatuses.map((status) => (
                <Checkbox
                  color="#5769E9"
                  radius={100}
                  key={status}
                  value={status}
                  label={status}
                />
              ))}
            </Flex>
          </Checkbox.Group>

          <Divider color="#39393980" />

          <Flex gap={10}>
            <Button
              size="sm"
              miw="fit-content"
              h={34}
              variant="default"
              radius={8}
              onClick={handleClear}
            >
              Clear filters
            </Button>
            <Button
              size="sm"
              miw="fit-content"
              h={34}
              color="#5769E9"
              radius={8}
              style={{ border: "1px solid #3C4CBD" }}
              onClick={handleApply}
            >
              Apply
            </Button>
          </Flex>
        </Flex>
      </Menu.Dropdown>
    </Menu>
  );
}
