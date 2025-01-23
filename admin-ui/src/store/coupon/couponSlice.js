import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { COUPON_CONTROLLER, PAGINATION_API } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

// Async thunks
export const getCouponsWithPagination = createAsyncThunk(
  "coupon/getCouponsWithPagination",
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
        `/${COUPON_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getCoupons = createAsyncThunk(
  "coupon/getCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${COUPON_CONTROLLER}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveCoupon = createAsyncThunk(
  "coupon/saveCoupon",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/${COUPON_CONTROLLER}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateCoupon = createAsyncThunk(
  "coupon/updateCoupon",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${COUPON_CONTROLLER}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  "coupon/deleteCoupon",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${COUPON_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getCoupon = createAsyncThunk(
  "coupon/getCoupon",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${COUPON_CONTROLLER}/${id}`);

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
const couponSlice = createSlice({
  name: "coupon",
  initialState: {
    coupons: [],
    loading: false,
    error: null,
    paginatedCoupons: [],
    totalCoupons: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Coupons with Pagination
      .addCase(getCouponsWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCouponsWithPagination.fulfilled, (state, action) => {
        state.paginatedCoupons = action.payload.data.rows;
        state.totalCoupons = action.payload.data.total;
        state.loading = false;
        state.error = null;
      })
      .addCase(getCouponsWithPagination.rejected, (state, action) => {
        state.paginatedCoupons = [];
        state.totalCoupons = 0;
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Coupons
      .addCase(getCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCoupons.fulfilled, (state, action) => {
        state.coupons = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getCoupons.rejected, (state, action) => {
        state.coupons = [];
        state.loading = false;
        state.error = action.payload;
      })

      // Save Coupon
      .addCase(saveCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCoupon.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single Coupon
      .addCase(getCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default couponSlice.reducer;
