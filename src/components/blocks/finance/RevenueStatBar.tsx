"use client";

import type { FinanceMarketView } from "@/hooks";
import { formatMoney } from "@/utils";
import StatBar from "../stat-bar";

const orDash = (value: number | null, currency: string) =>
  value == null ? "—" : formatMoney(value, currency);

/** The five numbers that answer "how much are we making?" for one market. */
const RevenueStatBar = ({ market }: { market: FinanceMarketView }) => {
  const { currency } = market;
  const estimate = market.estimatedTicketFee;

  return (
    <StatBar
      minCellWidth={190}
      items={[
        {
          label: "Customers paid",
          value: formatMoney(market.gross, currency),
          hint: "Gross, all streams",
        },
        {
          label: "Faajii revenue",
          value:
            market.platformRevenue != null
              ? formatMoney(market.platformRevenue, currency)
              : estimate
                ? `≈ ${formatMoney((estimate.min + estimate.max) / 2, currency)}`
                : "—",
          hint:
            market.platformRevenue != null
              ? "What Faajii keeps"
              : estimate
                ? "Estimate · ticket fee only"
                : "Not reported yet",
        },
        {
          label: "Processor fees",
          value: orDash(market.processorFees, currency),
          hint: "Absorbed by Faajii",
        },
        {
          label: "Promoter commission",
          value: orDash(market.promoterCommission, currency),
          hint: "Owed to promoters",
        },
        {
          label: "Net revenue",
          value: orDash(market.netRevenue, currency),
          hint: "Revenue − costs",
        },
      ]}
    />
  );
};

export default RevenueStatBar;
