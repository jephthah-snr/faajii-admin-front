interface User {
  ref: string;
  avatar: string | null;
  name: string | null;
}

interface Wallet {
  ref: string;
  partyBankName: string;
}

export interface Transaction {
  ref: string;
  transactionId: number;
  transactionRef: string;
  reference: string;
  transactionAmount: string | number;
  narration: string;
  direction: "DEBIT" | "CREDIT";
  transactionStatus: "pending" | "completed" | "failed";
  created_at: string;
  user?: User;
  wallet?: Wallet;
  walletId?: number;
}

export interface TransactionData {
  transactions: Transaction[];
  currentPage?: number;
  numberOfItems?: number;
}

export interface TransactionDetails {
  ref: string;
  transactionId: number;
  transactionRef: string;
  reference: string;
  thirdPartyTransactionReference: string | null;
  userId: string;
  walletId: number;
  wallet?: {
    ref: string;
    partyBankName: string;
  };
  transactionAmount: number;
  partyDiscount: number;
  quantity: number;
  narration: string;
  paymentTagId: number | null;
  destination: {
    bankCode: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  direction: "DEBIT" | "CREDIT";
  transactionType: string;
  metaData: {
    id: string;
    fee: number;
    ref: string;
    type: string;
    amount: number;
    reason: string | null;
    status: string;
    batch_id: string | null;
    category: string;
    currency: string;
    provider: string;
    narration: string;
    reference: string;
    timestamp: string;
    ip_address: string;
    session_id: string;
    customer_id: string;
    batch_number: string | null;
    provider_fee: number | null;
    webhook_data: any;
    lock_funds_id: string | null;
    response_code: string | null;
    execution_mode: string | null;
    recipient_name: string | null;
    transaction_id: string;
    response_message: string | null;
    restriction_data: any;
    source_wallet_id: string;
    internal_reference: string;
    is_withholding_tax: boolean;
    last_retry_attempt: string | null;
    initiator_reference: string;
    pay_withholding_tax: boolean;
    recipient_bank_code: string;
    recipient_bank_name: string | null;
    withholding_tax_paid: boolean;
    withholding_tax_type: string | null;
    source_wallet_balance: string;
    third_party_reference: string;
    accrued_interest_wallet: string | null;
    recipient_bank_account_name: string | null;
    withholding_tax_destination: string | null;
    source_wallet_ledger_balance: string;
    recipient_bank_account_number: string;
  };
  transactionStatus: string;
  transactionCompletedAt: string;
  isStoreTransfer: boolean | null;
  storeId: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerifiedTransaction {
  id: string;
  available_balance: number;
  amount: number;
  fee: number;
  reference: string;
  category: string;
  third_party_reference: string;
  customer_id: string;
  source_wallet: string;
  destination_wallet: string;
  narration: string;
  internal_reference: string;
  status: string;
  session_id: string;
  meta: {
    source_name: string;
    source_number: string;
    source_bank_name: string;
    destination_name: string;
    destination_number: string;
    destination_bank_name: string;
  };
  created_at: string;
  updated_at: string;
  source_wallet_balance: number;
}
