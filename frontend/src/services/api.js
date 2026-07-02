import axios from "axios";
import { API_BASE_URL, API } from "../constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // cookies auto-send (accessToken, refreshToken)
  headers: { "Content-Type": "application/json" },
});

// Auto-refresh token on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => error ? p.reject(error) : p.resolve());
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original)).catch((e) => Promise.reject(e));
      }
      original._retry = true;
      isRefreshing = true;
      try {
        await axios.post(
          `${API_BASE_URL}${API.REFRESH}`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Clear session and redirect to login
        sessionStorage.removeItem("vyooh_user");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
