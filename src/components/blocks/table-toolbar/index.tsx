"use client";

import { ActionIcon, Badge, Button, Flex, Indicator, TextInput, Tooltip } from "@mantine/core";
import { useState } from "react";
import { FilterPill } from "@/components/elements";
import type { FilterPillValue } from "@/components/elements/filter-pill";
import { IconClose, IconFilter, IconSearch } from "@/config/icons";
import classes from "@/styles/General.module.css";
import inputClasses from "@/styles/Input.module.css";
import { buildDefaultFilters, computeApiFilters, FilterItem } from "@/utils";
import { useSticky } from "@/hooks";

interface TableToolbarProps {
  /** Filter dimensions. Two or more collapse behind a filter button. */
  filters?: FilterItem[];
  onFilterChange?: (filters: Record<string, string>) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  searchPlaceholder?: string;
  /** Right-hand slot for a primary action. */
  action?: React.ReactNode;
  /** Distance from the top of the scroll container to pin at. */
  stickyOffset?: number;
}

/**
 * The single search + filter bar used above every table.
 *
 * A single dimension sits inline as one pill. Two or more collapse behind a
 * filter button — tables like Event Management and Transactions carry several,
 * and a row of pills would otherwise wrap and crowd out the search field. The
 * button shows how many filters are currently applied. Either way the bar stays
 * pinned while the rows scroll under it.
 */
const TableToolbar = ({
  filters = [],
  onFilterChange,
  query,
  onQueryChange,
  searchPlaceholder = "Search",
  action,
  stickyOffset = 72,
}: TableToolbarProps) => {
  const [selected, setSelected] = useState<Record<string, FilterPillValue>>({});
  const [expanded, setExpanded] = useState(false);
  const { stickyRef, sentinelRef, isStuck } = useSticky(stickyOffset);

  const isExpandable = filters.length >= 2;
  const activeCount = Object.values(selected).filter(Boolean).length;
  const showPills = filters.length > 0 && (!isExpandable || expanded);

  const apply = (next: Record<string, FilterPillValue>) => {
    setSelected(next);
    onFilterChange?.(computeApiFilters(next, filters));
  };

  const clearAll = () => {
    setSelected({});
    onFilterChange?.(buildDefaultFilters(filters));
  };

  return (
    <>
      <div ref={sentinelRef} style={{ height: 1 }} />

      <Flex
        ref={stickyRef}
        className={`${classes.toolbar} ${isStuck ? classes.toolbarStuck : ""}`}
        style={{ top: stickyOffset }}
      >
        <Flex align="center" gap={10} wrap="wrap">
          {isExpandable && (
            <Tooltip label={expanded ? "Hide filters" : "Show filters"}>
              <Indicator
                disabled={activeCount === 0 || expanded}
                label={activeCount}
                size={16}
                color="faajii"
                offset={4}
              >
                <ActionIcon
                  size={40}
                  radius={10}
                  variant="default"
                  aria-label="Toggle filters"
                  className={`${classes.filterPill} ${
                    expanded || activeCount > 0 ? classes.filterPillActive : ""
                  }`}
                  onClick={() => setExpanded((open) => !open)}
                >
                  <IconFilter
                    size={18}
                    color={
                      expanded || activeCount > 0
                        ? "var(--fj-accent)"
                        : "var(--fj-text-secondary)"
                    }
                    variant="Linear"
                  />
                </ActionIcon>
              </Indicator>
            </Tooltip>
          )}

          {showPills &&
            filters.map((filter) => (
              <FilterPill
                key={filter.title}
                label={filter.title}
                value={selected[filter.title] ?? filter.default ?? null}
                placeholder={filter.default || "All"}
                items={filter.items}
                isDate={filter.isDate}
                onChange={(value) =>
                  apply({ ...selected, [filter.title]: value })
                }
              />
            ))}

          {activeCount > 0 && showPills && (
            <Button
              variant="subtle"
              color="gray"
              size="compact-sm"
              radius="xl"
              styles={{ root: { minWidth: "auto" } }}
              rightSection={
                <IconClose size={14} color="currentColor" variant="Linear" />
              }
              onClick={clearAll}
            >
              Clear
            </Button>
          )}

          {isExpandable && !expanded && activeCount > 0 && (
            <Badge variant="light" color="faajii" radius="sm">
              {activeCount} active
            </Badge>
          )}
        </Flex>

        <Flex align="center" gap={10} wrap="wrap">
          {onQueryChange && (
            <TextInput
              placeholder={searchPlaceholder}
              variant="unstyled"
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              w={{ base: "100%", md: 300 }}
              classNames={{ input: inputClasses.searchInput }}
              leftSectionPointerEvents="none"
              leftSection={
                <IconSearch
                  size={16}
                  color="var(--fj-text-muted)"
                  variant="Linear"
                />
              }
            />
          )}
          {action}
        </Flex>
      </Flex>
    </>
  );
};

export default TableToolbar;
