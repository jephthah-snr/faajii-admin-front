import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const getBaseUrl = () => {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  const configuredUrl =
    environment === "production"
      ? process.env.NEXT_PUBLIC_PROD_BASE_URL
      : process.env.NEXT_PUBLIC_STAGING_BASE_URL;

  // `NEXT_PUBLIC_BASE_URL` is the original single-environment variable; it stays
  // in the chain so an environment that has not been migrated to the split
  // prod/staging names still resolves.
  const baseUrl =
    configuredUrl ||
    process.env.NEXT_PUBLIC_PROD_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    // Deliberately not thrown. This runs during module evaluation, and every
    // service imports this file, so throwing here takes down every page in the
    // app — including sign-in — instead of just failing the requests that
    // actually need the API.
    console.error(
      "Admin API URL is missing. Set NEXT_PUBLIC_PROD_BASE_URL or NEXT_PUBLIC_STAGING_BASE_URL.",
    );
    return "/v1";
  }

  return `${baseUrl.replace(/\/+$/, "")}/v1`;
};

const instance = axios.create({
  baseURL: getBaseUrl(),
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
