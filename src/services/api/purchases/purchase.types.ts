import { Pagination } from "../utils/utils.types";

export type PurchaseChannel = "mobile" | "web" | "integration";

export interface TicketPurchase {
  id: number;
  reference: string;
  status: "pending" | "paid" | "cancelled" | "failed";
  amount: number;
  currency: "NGN" | "XOF";
  paymentMethod?: string | null;
  paymentProviderReference?: string | null;
  channel: PurchaseChannel;
  ticketCount: number;
  orderCount: number;
  buyer: {
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  event: {
    id: number;
    eventId: string;
    name: string;
    image?: string | null;
  };
  paidAt?: string | null;
  fulfilledAt?: string | null;
  createdAt: string;
}

export interface PurchasesPage {
  data: TicketPurchase[];
  pagination: Pagination;
}

export interface PurchaseStatistics {
  totals: Array<{
    status: string;
    currency: string;
    amount: number;
    purchases: number;
  }>;
  totalTickets: number;
}
