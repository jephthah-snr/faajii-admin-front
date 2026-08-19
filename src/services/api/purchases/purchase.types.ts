import { Pagination } from "../utils/utils.types";

export type PurchaseChannel = "mobile" | "web" | "integration";

export interface TicketPurchase {
  id: number;
  reference: string;
  status: "pending" | "paid" | "cancelled" | "failed";
  amount: number;
  currency: "NGN" | "XOF";
  countryCode?: "NG" | "BJ" | "CI" | null;
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
  market?: {
    countryCode?: string | null;
    currency: string;
    eventCountryCode?: string | null;
    eventCurrency?: string | null;
    walletCountryCode?: string | null;
    walletCurrency?: string | null;
    consistent: boolean;
  };
  paymentEvidence?: {
    received: boolean;
    status: string;
    providerReference?: string | null;
    webhookProcessedAt?: string | null;
    paidAt?: string | null;
  };
  fulfillmentEvidence?: {
    status: "issued" | "missing" | "not_paid";
    fulfilledAt?: string | null;
    orders: Array<{
      id: number;
      orderReference: string;
      status: string;
      items: Array<{ itemId: number; quantity: number; name?: string }>;
      guestName: string;
      guestEmail?: string | null;
      guestPhone?: string | null;
    }>;
    tickets: Array<{
      id: number;
      ticketRef: string;
      status: string;
      orderReference: string;
      guestName: string;
      guestEmail?: string | null;
      guestPhone?: string | null;
      offerTitle?: string | null;
    }>;
  };
  walletCredit?: {
    reference: string;
    providerReference?: string | null;
    status: string;
    amount: number;
    currency: string;
    walletId: number;
    walletBalance: number;
    walletCurrency: string;
    walletCountryCode: string;
    createdAt: string;
  } | null;
  reconciliations?: Array<{
    id: number;
    kind: string;
    status: string;
    provider: string;
    providerReference: string;
    expectedAmount: number;
    receivedAmount: number;
    differenceAmount: number;
    currency: string;
    createdAt: string;
  }>;
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
