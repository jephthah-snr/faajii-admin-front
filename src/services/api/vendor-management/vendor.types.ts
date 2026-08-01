import { Pagination } from "../utils/utils.types";

export interface VendorsData {
  activeVendors: IVendor[];
  inactiveVendors: IVendor[];
  rejectedVendors: IVendor[];
  totalActiveVendors: number;
  totalInactiveVendors: number;
  totalRejectedVendors: number;
  pagination: {
    active: Pagination;
    inactive: Pagination;
    rejected: Pagination;
  };
}

export interface IVendor {
  id: number;
  name: string;
  title: string;
  description: string;
  avatar: string;
  phone: string;
  email: string;
  categorySlug: string;
  userId: number;
  isApproved: number;
  created_at: string;
  ratingCount: number;
  ratingValue: string;
  user: {
    id: number;
    phoneNumber: string;
    name: string;
    avatar: string;
  };
}

export interface VendorDetails {
  statistics: IStatistics;
  vendor: IVendorDetails;
  services: IVendorService[];
  teamMembers: IVendorTeamMember[];
  socials: {
    email: string;
    website: string;
    instagram: string;
    twitter: string;
    facebook: string;
  };
}

export interface IStatistics {
  totalOrdersCompleted: number;
  averageRating: number;
  totalAmountMade: string;
}

export interface IOwnerAccount {
  name: string;
  avatar: string;
}

export interface IVendorDetails {
  id: number;
  name: string;
  title: string;
  description: string;
  avatar: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  dateJoined: string;
  ownerAccount: IOwnerAccount;
  documents: string[];
}

export interface IVendorService {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  type: string;
}

export interface IVendorTeamMember {
  id: number;
  name: string;
  phoneNumber: string;
  avatar: string | null;
  email: string;
  status: string;
  countryCode: string;
}

export interface VendorOrders {
  orders: IVendorOrder[];
  totalOrders: number;
  vendorId: number;
  vendorName: string;
}

export interface VendorTransaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  category: string;
  narration?: string | null;
  recipientName?: string | null;
  createdAt: string;
  event?: {
    id: number;
    name: string;
  } | null;
}

export interface IVendorOrder {
  id: number;
  event: IEvent;
  host: IHost;
  payment: IPayment;
  status: string;
  bookingDate: string;
  rating: number;
}

export interface IPayment {
  status: string;
  budget: string;
  amountPaid: string;
  budgetedAmount: string;
  remainingAmount: number;
  progressPercentage: number;
  currency: string;
  formattedTotal: string;
  formattedPaid: string;
  formattedRemaining: string;
}

export interface IHost {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

export interface IEvent {
  id: number;
  name: string;
  description: string;
  address: string;
  type: string;
  startDate: string;
  endDate: string;
}
