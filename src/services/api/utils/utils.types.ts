export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  newOrders: number;
}

export interface PaginatedResponse<T = any> {
  status: boolean;
  message: string;
  data: {
    data: T[];
    pagination: Pagination;
  };
}
export interface PaginatedOrderResponse<T = any> {
  status: boolean;
  message: string;
  data: {
    list: T[];
    pagination: Pagination;
    metrics: OrderMetrics;
  };
}

export type eventTabTypes =
  | "event"
  | "guests"
  | "partystore"
  | "wishlist"
  | "transactions";

export type vendorTabTypes = "overview" | "orders" | "team" | "transactions";

export type ConfirmationModalTypes =
  | "error"
  | "warning"
  | "success"
  | "default";

export type userFilteredEventTypes =
  | "userevents"
  | "coplannedevents"
  | "rsvpevents";
