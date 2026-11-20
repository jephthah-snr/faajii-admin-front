"use client";

import { Select } from "@mantine/core";
import { marketOptions } from "@/utils";

interface MarketSelectProps {
  value: string;
  onChange: (currency: string) => void;
  /** Currencies the data actually contains, added to the known regions. */
  currencies?: string[];
}

/**
 * Region switcher for the finance screens. A dropdown rather than a segmented
 * control so adding a region is one line in `marketLabels` — the control never
 * needs redesigning as markets are added.
 */
const MarketSelect = ({ value, onChange, currencies }: MarketSelectProps) => (
  <Select
    aria-label="Region"
    size="sm"
    w={{ base: "100%", sm: 220 }}
    allowDeselect={false}
    checkIconPosition="right"
    data={marketOptions(currencies)}
    value={value}
    onChange={(next) => next && onChange(next)}
  />
);

export default MarketSelect;
