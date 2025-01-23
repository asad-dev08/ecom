// src/redux/userSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  CHECK_AVAILABLE_USERNAME_API,
  PAGINATION_API,
  USER_CONTROLLER,
} from "../../utils/actionTypes";
import { apiService } from "../../services/api";

export const getUsersWithPagination = createAsyncThunk(
  "user/getUsersWithPagination",
  async (
    { page, pageSize, filters, sorting, defaultSorting, globalSearch },
    { rejectWithValue }
  ) => {
    try {
      const filterArray = Object.entries(filters)
        .map(([field, value]) => ({
          field,
          value,
          operator: typeof value === "boolean" ? "equals" : "contains",
        }))
        .filter((f) => f.value !== undefined && f.value !== "");

      const requestBody = {
        page,
        pageSize,
        filters: filterArray,
        sorting: sorting || defaultSorting,
        globalSearch: globalSearch || "",
      };

      const response = await apiService.post(
        `/${USER_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);
export const checkUsernameAvailability = createAsyncThunk(
  "user/checkUsernameAvailability",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${USER_CONTROLLER}/${CHECK_AVAILABLE_USERNAME_API}`,
        obj
      );

      if (!response) {
        // Handle non-successful responses
        throw new Error("Date Fetching failed");
      }

      const data = await response;

      return data.data || null;
    } catch (error) {
      return rejectWithValue(error.message); // Pass the error message to the rejectWithValue payload
    }
  }
);
export const saveUser = createAsyncThunk(
  "user/saveUser",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/${USER_CONTROLLER}`, obj);

      if (!response) {
        // Handle non-successful responses
        throw new Error("Date Fetching failed");
      }

      const data = await response;

      return data.data || null;
    } catch (error) {
      return rejectWithValue(error.message); // Pass the error message to the rejectWithValue payload
    }
  }
);
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${USER_CONTROLLER}/${obj.id}`,
        obj
      );

      if (!response) {
        // Handle non-successful responses
        throw new Error("Date Fetching failed");
      }

      const data = await response;

      return data.data || null;
    } catch (error) {
      return rejectWithValue(error.message); // Pass the error message to the rejectWithValue payload
    }
  }
);

export const getUsers = createAsyncThunk(
  "user/getUsers",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${USER_CONTROLLER}`);

      if (!response) {
        // Handle non-successful responses
        throw new Error("Date Fetching failed");
      }

      const data = await response;

      return data.data || null;
    } catch (error) {
      return rejectWithValue(error.message); // Pass the error message to the rejectWithValue payload
    }
  }
);
export const getUser = createAsyncThunk(
  "user/getUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${USER_CONTROLLER}/${id}`);

      if (!response) {
        // Handle non-successful responses
        throw new Error("Date Fetching failed");
      }

      const data = await response;

      return data.data || null;
    } catch (error) {
      return rejectWithValue(error.message); // Pass the error message to the rejectWithValue payload
    }
  }
);
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${USER_CONTROLLER}/${id}`);

      if (!response) {
        // Handle non-successful responses
        throw new Error("Date Fetching failed");
      }

      const data = await response;

      return data.data || null;
    } catch (error) {
      return rejectWithValue(error.message); // Pass the error message to the rejectWithValue payload
    }
  }
);
const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsersWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersWithPagination.fulfilled, (state, action) => {
        state.users = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUsersWithPagination.rejected, (state, action) => {
        state.users = [];
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(saveUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        const data = action.payload.data;
        state.users =
          data &&
          data.length > 0 &&
          data.map((x) => {
            return {
              label: x.username,
              value: x.id,
            };
          });
        state.loading = false;
        state.error = null;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {} = userSlice.actions;
export default userSlice.reducer;
