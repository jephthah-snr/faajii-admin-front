import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

/* const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "production") {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/v1`;
  } else {
    return `${process.env.NEXT_PUBLIC_STAGING_BASE_URL}/v1`;
  }
}; */

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/v1`,
});

const handleUnauthorized = () => {
  if (typeof window === "undefined") return;

  // A failed sign-in attempt is also a 401. Reloading here would wipe the
  // "Invalid email or password" alert the page just set and throw the operator
  // back to a blank form, so the sign-in page handles its own 401s.
  if (window.location.pathname === "/sign-in") return;

  Cookies.remove("faajiiAdminAuthToken");
  Cookies.remove("faajiiAdminRefreshToken");

  // A hard navigation is deliberate for an expired session: this runs outside
  // React (an axios interceptor), and a full reload is what clears any cached
  // query state belonging to the old session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = "/sign-in";
};

instance.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    if (typeof window !== "undefined") {
      const getAuthTokenFromCookies = Cookies.get("faajiiAdminAuthToken");

      if (getAuthTokenFromCookies) {
        config.headers["Authorization"] = `Bearer ${getAuthTokenFromCookies}`;
      } else {
        delete config.headers["Authorization"];
      }
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error),
);

instance.interceptors.response.use(
  async (response: AxiosResponse): Promise<AxiosResponse> => response,
  async (error: AxiosError): Promise<AxiosError> => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }

    return Promise.reject(error);
  },
);
export default instance;
