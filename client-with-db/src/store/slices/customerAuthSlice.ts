import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  CustomerAuthState,
  Customer,
  AuthTokens,
} from "../../types/auth.types";
import { encryptData, decryptData } from "../../utils/encryption";
import axios from "axios";
import { BASE_URL } from "../../utils/actionTypes";

// Helper function to manage localStorage
const storage = {
  setTokens: (tokens: AuthTokens) => {
    localStorage.setItem("customerTokens", encryptData(tokens));
  },
  getTokens: (): AuthTokens | null => {
    const tokens = localStorage.getItem("customerTokens");
    return tokens ? decryptData(tokens) : null;
  },
  setCustomer: (customer: Customer) => {
    localStorage.setItem("customerData", encryptData(customer));
  },
  getCustomer: (): Customer | null => {
    const customer = localStorage.getItem("customerData");
    return customer ? decryptData(customer) : null;
  },
  clearAuth: () => {
    localStorage.removeItem("customerTokens");
    localStorage.removeItem("customerData");
  },
};

// Initial state
const initialState: CustomerAuthState = {
  customer: storage.getCustomer(),
  tokens: storage.getTokens(),
  isAuthenticated: !!storage.getTokens(),
  loading: false,
  error: null,
};

// Async thunks
export const loginCustomer = createAsyncThunk(
  "customerAuth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/customer/auth/login`,
        credentials
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerCustomer = createAsyncThunk(
  "customerAuth/register",
  async (
    userData: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/customer/auth/register`,
        userData
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  "customerAuth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { customerAuth: CustomerAuthState };
      const refreshToken = state.customerAuth.tokens?.refreshToken;

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        `${BASE_URL}/api/customer/auth/refresh-token`,
        {
          refreshToken,
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);

export const logoutCustomer = createAsyncThunk(
  "customerAuth/logout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { customerAuth: CustomerAuthState };
      const { tokens } = state.customerAuth;

      if (!tokens?.refreshToken) {
        throw new Error("No refresh token available");
      }

      await axios.post(
        `${BASE_URL}/api/customer/auth/logout`,
        { refreshToken: tokens.refreshToken },
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

// Slice
const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.customer = action.payload.customer;
        state.tokens = {
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        };
        storage.setCustomer(action.payload.customer);
        storage.setTokens({
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        });
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.customer = action.payload.customer;
        state.tokens = {
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        };
        storage.setCustomer(action.payload.customer);
        storage.setTokens({
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        });
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens = {
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        };
        storage.setTokens({
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        });
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.customer = null;
        state.tokens = null;
        storage.clearAuth();
      });

    // Logout
    builder.addCase(logoutCustomer.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.customer = null;
      state.tokens = null;
      storage.clearAuth();
    });
  },
});

export const { clearError } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;
