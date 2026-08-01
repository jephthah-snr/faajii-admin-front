import { EventDetails } from "./event.types";

export type AdminEventOverview = EventDetails;

export interface AdminEventGuest {
  id: number;
  ref: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  group?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface AdminEventTransaction {
  id: number;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  createdAt: string;
  buyer?: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
}

export interface AdminEventPlanner {
  id: number;
  name: string;
  phone: string;
  status: string;
  permissions: Array<{ id: string; access: boolean }>;
  createdAt: string;
  invitedBy?: {
    id: number;
    name: string;
    avatar?: string | null;
  } | null;
}

export interface AdminEventVendor {
  id: number;
  name: string;
  serviceType: string;
  description?: string | null;
  phone?: string | null;
  logo?: string | null;
  rating: number;
  source: string;
  createdAt: string;
}

export interface AdminEventTicket {
  id: number;
  ticketRef: string;
  status: "active" | "used" | "cancelled";
  assignmentKey: string;
  createdAt: string;
  guestTicketCount: number;
  guest: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  ticket: {
    id: number;
    name: string;
    type: string;
    price: number;
    currency: string;
  };
  order: {
    id: number;
    reference: string;
    status: string;
  };
}

export interface AdminEventTicketTracking {
  summary: {
    issued: number;
    active: number;
    used: number;
    cancelled: number;
    uniqueHolders: number;
  };
  tickets: AdminEventTicket[];
}
