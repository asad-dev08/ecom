// src/redux/securityRuleSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import {
  PAGINATION_API,
  SECURITY_RULE_CONTROLLER,
} from "../../utils/actionTypes";

export const getSecurityRulesWithPagination = createAsyncThunk(
  "securityRule/getSecurityRulesWithPagination",
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
        `/${SECURITY_RULE_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);
export const saveSecurityRule = createAsyncThunk(
  "securityRule/saveSecurityRule",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${SECURITY_RULE_CONTROLLER}`,
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
export const updateSecurityRule = createAsyncThunk(
  "securityRule/updateSecurityRule",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${SECURITY_RULE_CONTROLLER}/${obj.id}`,
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

export const getSecurityRules = createAsyncThunk(
  "securityRule/getSecurityRules",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SECURITY_RULE_CONTROLLER}`);

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
export const getSecurityRule = createAsyncThunk(
  "securityRule/getSecurityRule",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(
        `/${SECURITY_RULE_CONTROLLER}/${id}`
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
export const deleteSecurityRule = createAsyncThunk(
  "securityRule/deleteSecurityRule",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(
        `/${SECURITY_RULE_CONTROLLER}/${id}`
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
const securityRuleSlice = createSlice({
  name: "securityRule",
  initialState: {
    securityRules: [],
    securityRulesComboList: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSecurityRulesWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSecurityRulesWithPagination.fulfilled, (state, action) => {
        const data = action.payload.data;
        state.securityRules = action.payload.data;
        state.securityRulesComboList =
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
      .addCase(getSecurityRulesWithPagination.rejected, (state, action) => {
        state.securityRules = [];
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(saveSecurityRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSecurityRule.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveSecurityRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSecurityRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSecurityRules.fulfilled, (state, action) => {
        const data = action.payload.data;
        state.securityRules =
          data &&
          data.length > 0 &&
          data.map((x) => {
            return {
              label: x.name,
              value: x.id,
            };
          });
        state.securityRulesComboList =
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
      .addCase(getSecurityRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {} = securityRuleSlice.actions;
export default securityRuleSlice.reducer;
