import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { secureLocalStorage } from "../../utils/secureStorage";
import jwtService from "../../services/jwtService";

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/auth/verify-token");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { dispatch }) => {
    const response = await apiService.post("/auth/login", credentials);
    const data = await response.data;
    const { token, user, menus } = data.data;

    jwtService.createSession(token);
    return { token, user, menus };
  }
);

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await apiService.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to change password"
    );
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await apiService.put("/auth/update-profile", userData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
};

const initialState = {
  user: null,
  token: secureLocalStorage.getItem("access_token"),
  isAuthenticated: !!secureLocalStorage.getItem("access_token"),
  menus: [],
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.menus = [];
      state.error = null;
      secureLocalStorage.removeItem("access_token");
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.menus = action.payload.menus;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Login failed";
      })
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.menus = action.payload.menus;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message || "Token verification failed";
        secureLocalStorage.removeItem("access_token");
      });
  },
});

export const { logout, setUser, setToken, setAuthenticated } =
  authSlice.actions;
export default authSlice.reducer;
