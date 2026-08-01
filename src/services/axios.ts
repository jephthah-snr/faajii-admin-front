import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "production") {
    return `${process.env.NEXT_PUBLIC_PROD_BASE_URL}/v1`;
  } else {
    return `${process.env.NEXT_PUBLIC_STAGING_BASE_URL}/v1`;
  }
};

const instance = axios.create({
  baseURL: getBaseUrl(),
});

const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    Cookies.remove("faajiiAdminAuthToken");
    Cookies.remove("faajiiAdminRefreshToken");
    window.location.href = "/sign-in";
  }
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
