import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || (
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://quantrinhansu-backend-bvckgwevgmfrbpdy.eastasia-01.azurewebsites.net"
);
const BASE_URL = `${API_URL}/api`;

// ── Token helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem("accessToken"),
  getRefreshToken: (): string | null => localStorage.getItem("refreshToken"),
  setTokens: (accessToken?: string, refreshToken?: string) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// ── Axios instance ────────────────────────────────────────────────────────────
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: gắn accessToken vào header ──────────────────────────
axiosClient.interceptors.request.use(
  (config: any) => {
    const token = tokenStorage.getAccessToken() || localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Biến tránh gọi refresh nhiều lần đồng thời ───────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Response interceptor: tự động refresh khi hết hạn ────────────────────────
axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    const isPublicAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/verify-otp") ||
      requestUrl.includes("/auth/refresh-token");

    if (status === 401 && !isPublicAuthRequest && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const newAccessToken = refreshRes.data?.accessToken || refreshRes.data?.token;
        const newRefreshToken = refreshRes.data?.refreshToken || refreshToken;

        tokenStorage.setTokens(newAccessToken, newRefreshToken);
        if (newAccessToken) localStorage.setItem("token", newAccessToken);
        
        if (refreshRes.data?.user) {
          localStorage.setItem("user", JSON.stringify(refreshRes.data.user));
          window.dispatchEvent(new CustomEvent("auth:updateUser", { detail: refreshRes.data.user }));
        }

        processQueue(null, newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
