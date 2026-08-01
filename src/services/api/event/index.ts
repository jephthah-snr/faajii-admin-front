import axios from "@/services/axios";
import {
  ApiResponse,
  eventTabTypes,
  PaginatedResponse,
} from "../utils/utils.types";
import {
  AddGuestPayload,
  Event,
  EventDetails,
  EventTrxDetails,
  Guest,
  GuestDetails,
  IWishlist,
  Store,
  StoreDetails,
  WishlistDetails,
} from "./event.types";
import {
  AdminEventGuest,
  AdminEventPlanner,
  AdminEventTransaction,
  AdminEventVendor,
  AdminEventTicketTracking,
} from "./admin-event.types";

/**
 * Description: Send event data
 * @returns Promise
 */

// Get events
export const GetEvents = async (
  page: string,
  limit: string,
  search?: string,
  status?: string,
  startDate?: string,
  endDate?: string
): Promise<PaginatedResponse<Event>> => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) params.append("q", search);
    if (status) params.append("status", status);
    if (startDate) params.append("startdate", startDate);
    if (endDate) params.append("enddate", endDate);

    const url = `/admin/events?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as PaginatedResponse<Event>;
  } catch (err) {
    throw err;
  }
};

// Get event details
export const GetEventDetails = async (
  id: string,
  tabs: eventTabTypes,
  filter?: string,
  q?: string,
  startdate?: string,
  enddate?: string,
  page?: string,
  limit?: string
): Promise<ApiResponse<EventDetails | Guest[] | Store[] | IWishlist>> => {
  try {
    const params = new URLSearchParams({
      tabs,
    });

    if (q) {
      params.append("q", q);
    }
    if (filter) {
      params.append("filter", filter);
    }
    if (startdate) {
      params.append("startdate", startdate);
    }
    if (enddate) {
      params.append("enddate", enddate);
    }
    if (page) {
      params.append("page", page);
    }
    if (limit) {
      params.append("limit", limit);
    }

    const url = `/admin/event/${id}?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<
      EventDetails | Guest[] | Store[] | IWishlist
    >;
  } catch (err) {
    throw err;
  }
};

// Delete event
export const DeleteEvent = async (id: string): Promise<any> => {
  try {
    const url = `/admin/event/${id}/delete`;
    const res = await axios.delete(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export async function GetAdminEventGuests(
  id: string,
): Promise<ApiResponse<AdminEventGuest[]>> {
  const response = await axios.get(`/admin/events/${id}/guests`);
  return response.data;
}

export async function GetAdminEventTickets(
  id: string,
): Promise<ApiResponse<AdminEventTicketTracking>> {
  const response = await axios.get(`/admin/events/${id}/tickets`);
  return response.data;
}

export async function GetAdminEventTransactions(
  id: string,
): Promise<ApiResponse<AdminEventTransaction[]>> {
  const response = await axios.get(`/admin/events/${id}/transactions`);
  return response.data;
}

export async function GetAdminEventPlanners(
  id: string,
): Promise<ApiResponse<AdminEventPlanner[]>> {
  const response = await axios.get(`/admin/events/${id}/planners`);
  return response.data;
}

export async function GetAdminEventVendors(
  id: string,
): Promise<ApiResponse<AdminEventVendor[]>> {
  const response = await axios.get(`/admin/events/${id}/vendors`);
  return response.data;
}

// Resend RSVP
export const ResendRSVP = async (id: string): Promise<any> => {
  try {
    const url = `/admin/guests/${id}/resend-rsvp`;
    const res = await axios.post(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Remove guest
export const RemoveGuest = async (id: string): Promise<any> => {
  try {
    const url = `/admin/guests/${id}/remove`;
    const res = await axios.delete(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Get event guest details
export const GetEventGuestDetails = async (
  id: string
): Promise<ApiResponse<GuestDetails>> => {
  try {
    const url = `/admin/guests/${id}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<GuestDetails>;
  } catch (err) {
    throw err;
  }
};

// Edit event guest details
export const EditEventGuestDetails = async (
  id: string,
  payload: {
    email?: string;
    phone?: string;
  }
): Promise<ApiResponse<GuestDetails>> => {
  try {
    const url = `/admin/guests/${id}`;
    const res = await axios.put(url, payload);
    return res.data as ApiResponse<GuestDetails>;
  } catch (err) {
    throw err;
  }
};

// Get event store details
export const GetEventStoreDetails = async (
  id: string,
  q?: string
): Promise<ApiResponse<StoreDetails>> => {
  try {
    const params = new URLSearchParams();
    if (q) {
      params.append("q", q);
    }
    const url = `/admin/partystore/items/${id}?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<StoreDetails>;
  } catch (err) {
    throw err;
  }
};

export const GetAdminEventPartyStore = async (
  id: string
): Promise<ApiResponse<Store[]>> => {
  const response = await axios.get(`/admin/events/${id}/party-store`);
  return response.data as ApiResponse<Store[]>;
};

// Archive party store item
export const ArchivePartyStoreItem = async (
  id: string
): Promise<ApiResponse<StoreDetails>> => {
  try {
    const url = `/admin/partystore/items/${id}/archive`;
    const res = await axios.put(url);
    return res.data as ApiResponse<StoreDetails>;
  } catch (err) {
    throw err;
  }
};

// Delete Party store item
export const DeletePartyStoreItem = async (
  id: string
): Promise<ApiResponse<StoreDetails>> => {
  try {
    const url = `/admin/partystore/items/${id}`;
    const res = await axios.delete(url);
    return res.data as ApiResponse<StoreDetails>;
  } catch (err) {
    throw err;
  }
};

// Get event wishlist details
export const GetEventWishlistDetails = async (
  id: string
): Promise<ApiResponse<WishlistDetails>> => {
  try {
    const url = `/admin/wishlist/items/${id}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<WishlistDetails>;
  } catch (err) {
    throw err;
  }
};

// Delete wishlist item
export const DeleteWishlistItem = async (
  id: string
): Promise<ApiResponse<WishlistDetails>> => {
  try {
    const url = `/admin/wishlist/items/${id}`;
    const res = await axios.delete(url);
    return res.data as ApiResponse<WishlistDetails>;
  } catch (err) {
    throw err;
  }
};

// Get event transactions
export const GetEventTransactions = async (
  id: string,
  limit: string,
  cursor?: string,
  q?: string
): Promise<ApiResponse<EventTrxDetails>> => {
  try {
    const params = new URLSearchParams({
      limit,
    });
    if (cursor) {
      params.append("cursor", cursor);
    }
    if (q) {
      params.append("q", q);
    }
    const url = `/partybank/admin/event/${id}/transactions?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<EventTrxDetails>;
  } catch (err) {
    throw err;
  }
};

// Add event guest
export const AddEventGuest = async (
  payload: AddGuestPayload
): Promise<ApiResponse<any>> => {
  try {
    const url = `/admin/guests/add-ticket`;
    const res = await axios.post(url, payload);
    return res.data as ApiResponse<any>;
  } catch (err) {
    throw err;
  }
};
