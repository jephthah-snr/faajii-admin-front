import axios from "@/services/axios";
import {
  ApiResponse,
  PaginatedResponse,
  userFilteredEventTypes,
} from "../utils/utils.types";
import {
  SingleUserData,
  UserActivity,
  UserQuickStats,
  UsersData,
} from "./user.types";
import { Transaction } from "../transaction/transaction.types";
import { Event } from "../event/event.types";

/**
 * Description: Send user data
 * @returns Promise
 */

// Get users
export const GetUsers = async (
  page: string,
  limit: string,
  search?: string,
  status?: string,
  activeEvent?: string,
  startDate?: string,
  endDate?: string,
): Promise<PaginatedResponse<UsersData>> => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) params.append("q", search);
    if (status) params.append("status", status);
    if (activeEvent) params.append("activeevent", activeEvent);
    if (startDate) params.append("startdate", startDate);
    if (endDate) params.append("enddate", endDate);

    const url = `/admin/all-users?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as PaginatedResponse<UsersData>;
  } catch (err) {
    throw err;
  }
};

// Get user details
export const GetUserDetails = async (
  id: string,
): Promise<ApiResponse<SingleUserData>> => {
  try {
    const url = `/admin/users/${id}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<SingleUserData>;
  } catch (err) {
    throw err;
  }
};

// Get user quick stats
export const GetUserQuickStats = async (
  id: string,
): Promise<ApiResponse<UserQuickStats>> => {
  try {
    const url = `/admin/users/${id}/quickstats`;
    const res = await axios.get(url);
    return res.data as ApiResponse<UserQuickStats>;
  } catch (err) {
    throw err;
  }
};

// Get user filtered events
export const GetUserFilteredEvents = async (
  id: string,
  page: string,
  limit: string,
  filter: userFilteredEventTypes,
): Promise<ApiResponse<Event[]>> => {
  try {
    const url = `/admin/users/${id}/filteredeventdata?page=${page}&limit=${limit}&filter=${filter}`;
    const res = await axios.get(url);
    return res.data as ApiResponse<Event[]>;
  } catch (err) {
    throw err;
  }
};

// Get user events
export const GetUserEvents = async (
  id: string,
): Promise<ApiResponse<Event[]>> => {
  try {
    const url = `/admin/users/${id}/events-with-roles`;
    const res = await axios.get(url);
    return res.data as ApiResponse<Event[]>;
  } catch (err) {
    throw err;
  }
};

// Get user transactions
export const GetUserTransactions = async (
  id: string,
  page: string,
  limit: string,
  search?: string,
): Promise<PaginatedResponse<Transaction>> => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) {
      params.append("q", search);
    }

    const url = `/admin/users/${id}/transactions?${params.toString()}`;
    const res = await axios.get(url);
    return res.data as PaginatedResponse<Transaction>;
  } catch (err) {
    throw err;
  }
};

// Get user activities
export const GetUserActivities = async (
  id: string,
): Promise<ApiResponse<UserActivity[]>> => {
  try {
    const url = `/admin/users/${id}/activities`;
    const res = await axios.get(url);
    return res.data as ApiResponse<UserActivity[]>;
  } catch (err) {
    throw err;
  }
};

// Suspend user
export const SuspendUser = async (id: string): Promise<any> => {
  try {
    const url = `/admin/${id}/suspend-user`;
    const res = await axios.put(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Reset user PIN
export const ResetUserPin = async (id: string): Promise<any> => {
  try {
    const url = `/tooling/reset-pin/${id}`;
    const res = await axios.put(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Delete user
export const DeleteUser = async (id: string): Promise<any> => {
  try {
    const url = `/admin/${id}/delete-user`;
    const res = await axios.delete(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Update user profile
export interface UpdateUserData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  dateOfBirth?: string;
}

export const UpdateUser = async (
  id: string,
  data: UpdateUserData,
): Promise<any> => {
  try {
    const url = `/admin/${id}/update-user`;
    const res = await axios.put(url, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};
