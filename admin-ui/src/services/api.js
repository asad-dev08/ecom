import axios from "axios";
import { logout, refreshToken } from "../store/auth/authSlice";
import { BASE_URL } from "../utils/actionTypes";
import jwtService from "./jwtService";
import { message } from "antd";
import { startLoading, stopLoading } from "../store/loader/loadingSlice";

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Token refresh related properties (for future implementation)
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.store = null;
  }

  setupInterceptors(store) {
    this.store = store;

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        this.store.dispatch(startLoading());
        const token = store.getState().auth.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        this.store.dispatch(stopLoading());
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        this.store.dispatch(stopLoading());
        return response;
      },
      async (error) => {
        this.store.dispatch(stopLoading());
        const originalRequest = error.config;

        // user not found
        // if (error.response?.status === 404) {
        //   message.error(error.response?.data?.message);
        //   return Promise.reject(error);
        // }
        if (error.response?.status === 401) {
          // Current implementation: Direct logout
          message.error(error.response?.data?.message);
          store.dispatch(logout());
          jwtService.emit(
            "onAutoLogout",
            "Session expired. Please login again."
          );
          return Promise.reject(error);

          /* TOKEN REFRESH IMPLEMENTATION (for future use)
          if (!originalRequest._retry) {
            if (this.isRefreshing) {
              // Queue the requests while token is being refreshed
              return new Promise((resolve) => {
                this.refreshSubscribers.push((token) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(this.api(originalRequest));
                });
              });
            }

            originalRequest._retry = true;
            this.isRefreshing = true;

            try {
              const response = await this.api.post("/auth/refresh", {
                refreshToken: store.getState().auth.refreshToken
              });
              const { token } = response.data;

              // Update token in store
              store.dispatch(refreshToken({ token }));

              // Process queued requests
              this.refreshSubscribers.forEach((callback) => callback(token));
              this.refreshSubscribers = [];

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            } catch (refreshError) {
              store.dispatch(logout());
              jwtService.emit('onAutoLogout', 'Session expired. Please login again.');
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          }
          */
        }

        if (error.response?.status === 403) {
          jwtService.emit("onAutoLogout", "Access denied. Please login again.");
          store.dispatch(logout());
        }

        return Promise.reject(error);
      }
    );
  }

  // API Methods
  async get(url, config = {}) {
    try {
      return await this.api.get(url, config);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      return await this.api.post(url, data, config);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      return await this.api.put(url, data, config);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete(url, config = {}) {
    try {
      return await this.api.delete(url, config);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  handleError(error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Let the interceptor handle authentication errors
      return;
    }
    console.error("API Error:", error);
    message.error(error.response?.data?.message || "An error occurred");
  }
}

export const apiService = new ApiService();
