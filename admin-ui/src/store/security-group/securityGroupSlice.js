// src/redux/securityGroupSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  PAGINATION_API,
  SECURITY_GROUP_CONTROLLER,
} from "../../utils/actionTypes";
import { apiService } from "../../services/api";

export const getSecurityGroupsWithPagination = createAsyncThunk(
  "securityGroup/getSecurityGroupsWithPagination",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${SECURITY_GROUP_CONTROLLER}/${PAGINATION_API}`,
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
export const saveSecurityGroup = createAsyncThunk(
  "securityGroup/saveSecurityGroup",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${SECURITY_GROUP_CONTROLLER}`,
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
export const updateSecurityGroup = createAsyncThunk(
  "securityGroup/updateSecurityGroup",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${SECURITY_GROUP_CONTROLLER}/${obj.id}`,
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

export const getSecurityGroups = createAsyncThunk(
  "securityGroup/getSecurityGroups",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SECURITY_GROUP_CONTROLLER}`);

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
export const getSecurityGroup = createAsyncThunk(
  "securityGroup/getSecurityGroup",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(
        `/${SECURITY_GROUP_CONTROLLER}/${id}`
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
export const deleteSecurityGroup = createAsyncThunk(
  "securityGroup/deleteSecurityGroup",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(
        `/${SECURITY_GROUP_CONTROLLER}/${id}`
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
const securityGroupSlice = createSlice({
  name: "securityGroup",
  initialState: {
    securityGroups: [],
    securityGroupsComboList: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSecurityGroupsWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSecurityGroupsWithPagination.fulfilled, (state, action) => {
        const data = action.payload.data;
        state.securityGroups = action.payload.data;

        state.loading = false;
        state.error = null;
      })
      .addCase(getSecurityGroupsWithPagination.rejected, (state, action) => {
        state.securityGroups = [];
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(saveSecurityGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSecurityGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveSecurityGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSecurityGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSecurityGroups.fulfilled, (state, action) => {
        const data = action.payload.data;
        state.securityGroups =
          data &&
          data.length > 0 &&
          data.map((x) => {
            return {
              label: x.name,
              value: x.id,
            };
          });
        state.securityGroupsComboList =
          data &&
          data.length > 0 &&
          data.map((x) => {
            return {
              label: x.name,
              value: x.id,
            };
          });
        state.loading = false;
        state.error = null;
      })
      .addCase(getSecurityGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {} = securityGroupSlice.actions;
export default securityGroupSlice.reducer;
