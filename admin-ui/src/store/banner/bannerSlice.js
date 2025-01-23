import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BANNER_CONTROLLER, PAGINATION_API } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

// Async thunks
export const getBannersWithPagination = createAsyncThunk(
  "banner/getBannersWithPagination",
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
        `/${BANNER_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getBanners = createAsyncThunk(
  "banner/getBanners",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${BANNER_CONTROLLER}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveBanner = createAsyncThunk(
  "banner/saveBanner",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${BANNER_CONTROLLER}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateBanner = createAsyncThunk(
  "banner/updateBanner",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${BANNER_CONTROLLER}/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteBanner = createAsyncThunk(
  "banner/deleteBanner",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${BANNER_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getBanner = createAsyncThunk(
  "banner/getBanner",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${BANNER_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const bannerSlice = createSlice({
  name: "banner",
  initialState: {
    banners: [],
    banner: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Banners with Pagination
      .addCase(getBannersWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBannersWithPagination.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getBannersWithPagination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Banners
      .addCase(getBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBanners.fulfilled, (state, action) => {
        state.banners = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getBanners.rejected, (state, action) => {
        state.banners = [];
        state.loading = false;
        state.error = action.payload;
      })

      // Save Banner
      .addCase(saveBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveBanner.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Banner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Banner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single Banner
      .addCase(getBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBanner.fulfilled, (state, action) => {
        state.banner = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getBanner.rejected, (state, action) => {
        state.banner = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default bannerSlice.reducer;
