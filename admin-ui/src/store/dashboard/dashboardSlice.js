import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DASHBOARD_CONTROLLER } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

// Async thunk for fetching dashboard stats
export const getDashboardStats = createAsyncThunk(
  "dashboard/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${DASHBOARD_CONTROLLER}/stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      counts: {
        products: 0,
        categories: 0,
        brands: 0,
        sellers: 0,
      },
      recentProducts: [],
      topSellingProducts: [],
      productsByCategory: [],
      salesByDate: [],
      lowStockProducts: [],
      productStatuses: [],
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
