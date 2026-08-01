export interface PaymentTracking {
  id: number;
  reference: string;
  accountNumber: string;
  bankName: string;
  accountName: string;
  expectedAmount: number;
  actualAmount?: number;
  senderName?: string;
  senderAccountNumber?: string;
  senderBankName?: string;
  transactionReference?: string;
  description?: string;
  metadata?: PaymentTrackingMetadata;
  paymentType: PaymentTrackingType;
  status: PaymentTrackingStatus;
  serviceId?: string;
  paidAt?: string;
  expiresAt?: string;
  webhookPayload?: string;
  isProcessed: boolean;
  processingResult?: ProcessingResult;
  created_at: string;
  updated_at: string;
}

export type PaymentTrackingStatus =
  | "pending"
  | "confirmed"
  | "failed"
  | "expired"
  | "partial"
  | "escalated";

export type PaymentTrackingType =
  | "bank_transfer"
  | "card_payment"
  | "wallet_transfer";

export interface PaymentTrackingMetadata {
  meta?: string;
  serviceId?: string;
  generatedAt?: string;
  lastPaymentAt?: string;
  totalReceived?: number;
  originalAmount?: number;
  paymentAttempts?: PaymentAttempt[];
  eventId?: number;
  submitter?: {
    name: string;
    email: string;
    phone: string;
  };
  items?: {
    itemId: number;
    name: string;
    quantity: number;
  }[];
  guests?: {
    name: string;
    phone: string;
    email: string;
    selectedTickets?: string[];
    selectedItems?: string[];
  }[];
  // Fees
  fixedFee: number;
  feeAmount: number;
  percentageFee: number;
  // Duplicate payment fields
  isDuplicate?: boolean;
  originalReference?: string;
  matchedTicketId?: number;
  matchedTicketName?: string;
  duplicateDetectedAt?: string;
  // Escalation fields
  escalatedAt?: string;
  escalatedTo?: string;
  // Paystack
  source?: string;
  paystackCharge?: {
    appliedAt?: string;
    percentage?: number;
    chargeAmount?: number;
    amountToCharge?: number;
    originalAmount?: number;
  };
}

export interface PaymentAttempt {
  amount: number;
  createdAt: string;
  narration: string;
  timestamp: string;
  senderName: string;
  attemptNumber: number;
  senderBankName: string;
  senderAccountNumber: string;
  transactionReference: string;
}

export interface ProcessingResult {
  message?: string;
  processed?: boolean;
  reference?: string;
  processedData?: {
    guests?: ProcessedGuest[];
    orders?: ProcessedOrder[];
    summary?: {
      totalItems: number;
      totalAmount: number;
      totalGuests: number;
      paymentStatus: string;
      totalQuantity: number;
      orderReferences: string[];
    };
    guestRsvpCodes?: Record<string, string>;
    guestAssignments?: {
      guestId: number;
      guestName: string;
      assignedItems: string[];
      assignedTickets: string[];
    }[];
  };

  // failed
  pvbStatus?: string;
  permanentFailReason?: string;
  permanentlyFailedAt?: string;
}

export interface ProcessedGuest {
  id: number;
  ref: string;
  meta?: {
    selectedItems?: string[];
    selectedTickets?: string[];
  };
  name: string;
  email: string;
  phone: string;
  status: string;
  eventId: number;
}

export interface ProcessedOrder {
  orders: {
    id: number;
    eventId: number;
    guestId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    totalPrice: number;
    deliveryStatus: string;
    eventShopItemId: number;
    orderReferenceId: number;
  }[];
  orderReference: {
    id: number;
    paidAt: string;
    eventId: number;
    guestId: number;
    createdAt: string;
    reference: string;
    updatedAt: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
  };
}

export interface PaymentTrackingStats {
  total: number;
  pending: number;
  confirmed: number;
  failed: number;
  expired: number;
  totalAmount: number;
  confirmedAmount: number;
}

export const SERVICE_ID_LABELS: Record<string, string> = {
  rsvp: "RSVP",
  "gift-registry": "Gift Registry",
  "cash-gift": "Cash Gift",
  "gift-box": "Gift Box",
  "guest-purchase": "Guest Purchase",
  "point-of-sale": "POS",
  "third-party-purchase": "3rd Party",
  "gift-purchase": "Gift Purchase",
};

export const STATUS_COLORS: Record<PaymentTrackingStatus, string> = {
  pending: "#FF9801",
  confirmed: "#4CAF50",
  failed: "#F44336",
  expired: "#9E9E9E",
  partial: "#2196F3",
  escalated: "#E91E63",
};
