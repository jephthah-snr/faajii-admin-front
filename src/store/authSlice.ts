import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface User {
  avatar: string | null;
  fullName: string;
  email: string;
  PhoneNumber: string;
  permission: "super" | "admin" | "finance" | "support";
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      const { permission, email, PhoneNumber, avatar, fullName } =
        action.payload;
      state.user = { permission, email, PhoneNumber, avatar, fullName };

      document.cookie = `faajiiAdminUserPermission=${
        action.payload.permission
      }; path=/; expires=${new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toUTCString()}`;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      Cookies.set("faajiiAdminAuthToken", action.payload);

      // Store access token in cookie
      document.cookie = `faajiiAdminAuthToken=${
        action.payload
      }; path=/; expires=${new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toUTCString()}`;
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
      Cookies.set("faajiiAdminRefreshToken", action.payload);
    },
    setExpirationCookie: (state, action: PayloadAction<number>) => {
      document.cookie = `faajiiAdminTokenExpiration=${
        action.payload
      }; path=/; expires=${new Date(action.payload).toUTCString()}`;

      return state;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;

      Cookies.remove("faajiiAdminAuthToken");
      Cookies.remove("faajiiAdminRefreshToken");

      document.cookie =
        "faajiiAdminAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie =
        "faajiiAdminTokenExpiration=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie =
        "faajiiAdminUserPermission=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    },
  },
});

export const {
  setUser,
  setToken,
  setRefreshToken,
  setExpirationCookie,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
