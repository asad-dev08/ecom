import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SHIPPING_CHARGE_CONTROLLER, PAGINATION_API } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

// Async thunks
export const getShippingChargesWithPagination = createAsyncThunk(
  "shippingCharge/getShippingChargesWithPagination",
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
        `/${SHIPPING_CHARGE_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getShippingCharges = createAsyncThunk(
  "shippingCharge/getShippingCharges",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SHIPPING_CHARGE_CONTROLLER}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveShippingCharge = createAsyncThunk(
  "shippingCharge/saveShippingCharge",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/${SHIPPING_CHARGE_CONTROLLER}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateShippingCharge = createAsyncThunk(
  "shippingCharge/updateShippingCharge",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${SHIPPING_CHARGE_CONTROLLER}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteShippingCharge = createAsyncThunk(
  "shippingCharge/deleteShippingCharge",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${SHIPPING_CHARGE_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getShippingCharge = createAsyncThunk(
  "shippingCharge/getShippingCharge",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SHIPPING_CHARGE_CONTROLLER}/${id}`);

      if (!response) {
        throw new Error("Data Fetching failed");
      }

      return response.data || null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const shippingChargeSlice = createSlice({
  name: "shippingCharge",
  initialState: {
    shippingCharges: [],
    loading: false,
    error: null,
    paginatedShippingCharges: [],
    totalShippingCharges: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Shipping Charges with Pagination
      .addCase(getShippingChargesWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShippingChargesWithPagination.fulfilled, (state, action) => {
        state.paginatedShippingCharges = action.payload.data.rows;
        state.totalShippingCharges = action.payload.data.total;
        state.loading = false;
        state.error = null;
      })
      .addCase(getShippingChargesWithPagination.rejected, (state, action) => {
        state.paginatedShippingCharges = [];
        state.totalShippingCharges = 0;
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Shipping Charges
      .addCase(getShippingCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShippingCharges.fulfilled, (state, action) => {
        state.shippingCharges = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getShippingCharges.rejected, (state, action) => {
        state.shippingCharges = [];
        state.loading = false;
        state.error = action.payload;
      })

      // Save Shipping Charge
      .addCase(saveShippingCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveShippingCharge.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveShippingCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Shipping Charge
      .addCase(updateShippingCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShippingCharge.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateShippingCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Shipping Charge
      .addCase(deleteShippingCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShippingCharge.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteShippingCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single Shipping Charge
      .addCase(getShippingCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShippingCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getShippingCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default shippingChargeSlice.reducer; 