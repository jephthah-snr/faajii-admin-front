export interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  eventLocation: string | EventLocation;
  eventImageUrl: string | null;
  themeColor: string | null;
  accentColor: string | null;
  capacity: number;
  eventBudget: number;
  isActive: number;
  eventTypeId: number;
  allowPlannersInvite: number;
  eventSlug: string;
  createdBy: number;
  isWishlistShareable: number;
  created_at: string;
  updated_at: string;
  eventId: string;
  isConfirmationRequired: number;
  role: string;
  creatorId: number;
  creatorName: string | null;
  creatorAvatar: string | null;
  invitedCount: number;
  vendorsCount: number;
  status: string;
}

// -----------------------------
// Subtypes
// -----------------------------

export interface EventLocation {
  formattedAddress: string;
  mapAddress: string;
  latitude: number;
  longitude: number;
}

export interface EventPreMedia {
  url: string;
  type: "image" | "video";
}

export interface EventBudgetItem {
  id: number;
  amount: number;
  itemColor: string;
  amountSpent: number;
  item: string;
}

export interface EventPartyBank {
  amount: number;
  thirdPartyReference: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface EventVendor {
  id: number;
  businessName: string;
  businessService: string;
  shortBio: string;
  userId: string;
  phoneNumber: string;
  isDeleted: number;
  deletedAt: string | null;
  rating: number;
  plannerComment: string | null;
  eventId: number;
  jobsCompleted: number;
  bankCode: string | null;
  accountNumber: string | null;
  promoteVendor: number;
  profileId: number;
  amountPaid: string;
  budgetedAmount: string;
  budgetId: number | null;
  created_at: string;
  updated_at: string;
  merchantStatus: string;
  proofOfWork: any[];
}

export interface EventPlannerMeta {
  addedAt?: string;
  isCreator?: boolean;
  name?: string;
  reason?: string;
  invitedAt?: string;
  invitedBy?: number;
  autoAccepted?: boolean;
  autoAcceptedAt?: string;
}

export interface EventPlannerUser {
  id: number;
  email: string;
  name: string;
  avatar: string;
}

export interface EventPlanner {
  id: number;
  ref: string | null;
  email: string | null;
  phone: string;
  permission: "full_access" | "view_only";
  status: string;
  eventId: number;
  userId: number;
  meta: EventPlannerMeta;
  last_seen_activities_at: string;
  is_public: number;
  created_at: string;
  updated_at: string;
  userById: EventPlannerUser;
}

export interface EventType {
  id: number;
  name: string;
}

export interface EventOwner {
  name: string;
}

export interface EventMeta {
  guestNote: string;
}

// -----------------------------
// Root EventDetails Interface
// -----------------------------

export interface EventDetails {
  id: number;
  eventId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  eventLocation: EventLocation;
  capacity: number;
  eventImageUrl: string;
  eventBudget: number;
  eventSlug: string;
  themeId: string;
  eventTypeId: number;
  createdBy: number;
  isActive: number;
  allowPlannersInvite: number;
  isWishlistShareable: number;
  isConfirmationRequired: number;
  status: string;
  meta: EventMeta;
  eventBlockMeta: string;
  eventPreMedia: EventPreMedia[];
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  visibility: string;
  isPromoted: number;
  promotedAt: string | null;
  promotedUntil: string | null;
  guestGroups: any[];
  wishlistReference: string;
  eventType: EventType;
  budget: EventBudgetItem[];
  partyBank: EventPartyBank[];
  vendors: EventVendor[];
  planners: EventPlanner[];
  owner: EventOwner;
}

export interface Guest {
  id: number;
  ref: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  guestGroup: string;
  eventId: number;
  userId: string;
  note: string;
  meta: {
    selectedItems: string[];
    selectedTickets: string[];
  };
  created_at: string;
  updated_at: string;
  totalStorePurchases: string;
  user: {
    id: number;
    email: string;
    phoneNumber: string;
    name: string;
    avatar: string;
  };
  rsvpSubmission: RSVP;
}

export interface Store {
  id: number;
  eventId: number;
  name: string;
  category: string;
  theme: string | null;
  description: string;
  price: string;
  quantityAvailable: number;
  allowMultiple: number;
  expiryDate: string;
  images: string[];
  isActive: number;
  createdAt: string;
  updatedAt: string;
  itemsPurchased: number;
  quantityPurchased?: number;
  itemsLeft: number;
  totalQuantity: number;
}

// -----------------------------
// Subtypes
// -----------------------------

export interface WishlistCashbox {
  balance: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
  walletName: string;
  thirdPartyReference: string;
}

export interface WishlistContributor {
  id: number;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  amountContributed: number;
  isAnonymous: number;
  contributedAt: string;
}

export interface WishlistItem {
  id: number;
  ref: string;
  item: string;
  itemName?: string;
  itemImage: string;
  images?: string[];
  price: string;
  contributedAmount: number;
  progress: number;
  contributors: number;
  contributorsList: WishlistContributor[];
  status: string;
  contributionComplete: number;
  totalContributions: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------
// Root Interface
// -----------------------------

export interface IWishlist {
  wishlistId: number;
  wishlistName: string;
  reference: string;
  wishlistStatus: string;
  wishlistNote: string;
  cashbox: WishlistCashbox;
  items: WishlistItem[];
  itemCount: number;
}

/* Guest Details */
export interface GuestDetails {
  guest: Guest;
  event: EventSummary;
  rsvp: RSVP;
  qrCode: QRCode;
  purchases: Purchases;
}

export interface EventSummary {
  id: number;
  name: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  location: EventLocation;
}

export interface RSVP {
  reference: string;
  submittedAt: string;
  email: string;
  phoneNumber: string;
}

export interface QRCode {
  guestId: number;
  guestRef: string;
  guestName: string;
  eventId: number;
  eventName: string;
  rsvpReference: string;
  status: string;
}

export interface Purchases {
  tickets: Ticket[];
  totalItems: number;
  totalAmount: string;
  orderCount: number;
}

export interface Ticket {
  orderId: number;
  category: string;
  itemId: number;
  itemName: string;
  itemImage: string;
  quantity: number;
  price: string;
  totalPrice: string;
  deliveryStatus: string;
  orderReference: number;
  purchasedAt: string;
}

/* Store Details */
export interface StoreDetails {
  item: Store;
  statistics: StoreStatistics;
  guestOrders: GuestOrder[];
}

export interface StoreStatistics {
  totalOrders: number;
  totalGuestsPurchased: number;
  totalQuantityPurchased: number;
  totalRevenue: string;
  averageQuantityPerGuest: number;
}

export interface GuestOrder {
  guestId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  avatar: string;
  numberOfItemsPurchased: number;
  totalSpent: string;
  orders: Order[];
}

export interface Order {
  orderId: number;
  quantity: number;
  totalPrice: string;
  deliveryStatus: string;
  purchasedAt: string;
}

/* Wishlist Details */
export interface WishlistDetails {
  item: WishlistItem;
  contribution: ContributionStats;
  contributors: Contributor[];
}

export interface ContributionStats {
  status: string;
  progress: number;
  totalContributed: number;
  remainingAmount: number;
  contributorCount: number;
  isComplete: boolean;
}

export interface Contributor {
  contributorId: number;
  name: string;
  email: string | null;
  phoneNumber: string;
  avatar: string | null;
  amountContributed: number;
  percentageContributed: string;
  isAnonymous: number;
  contributedAt: string;
  note: string | null;
}

export interface EventTrxDetails {
  edges: Edges[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
    previousCursor: string;
  };
}

export interface Edges {
  id: string;
  business_id: string;
  branch_id: string;
  wallet_id: string;
  account_number: string;
  schedule_transfer_id: string;
  paypoint_id: string;
  auto_payout_id: string;
  peer_reference_id: string;
  third_party_reference: string;
  provider_reference: string;
  safe_lock_id: string;
  order_id: string;
  api_customer_id: string;
  invoice_id: string;
  amount: number;
  is_restricted: boolean;
  amount_plus_fees: number;
  status: string;
  type: string;
  category: string;
  provider: string;
  wallet_type: string;
  debited_ledger: boolean;
  balance: number;
  charge: number;
  provider_charge: number;
  session_id: string;
  meta: {
    source_name: string;
    source_number: string;
    source_bank_name: string;
    destination_name: string;
    destination_number: string;
    destination_bank_name: string;
  };
  description: string;
  reason: string;
  currency: string;
  is_eod_withdrawal: boolean;
  batch_transaction_id: string;
  accrued_interest_wallet: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  provider_payload: any;
  failure_reason: string;
  investment_type: string;
  bank_code: string;
  titleText: string;
  subtitleText: string;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface AddGuestPayload {
  guestName: string;
  email: string;
  phoneNumber: string;
  tickets: [{ ticketId?: number; quantity?: number }];
  generateMultipleRsvpCodes?: boolean;
}
