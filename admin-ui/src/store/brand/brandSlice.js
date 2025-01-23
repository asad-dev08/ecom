import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  BRAND_CONTROLLER,
  DEFAULT_SORTING,
  PAGINATION_API,
} from "../../utils/actionTypes";
import { apiService } from "../../services/api";

export const getBrandsWithPagination = createAsyncThunk(
  "brand/getBrandsWithPagination",
  async (
    { page, pageSize, filters, sorting, globalSearch },
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
        sorting: sorting || DEFAULT_SORTING,
        globalSearch: globalSearch || "",
      };

      const response = await apiService.post(
        `/${BRAND_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getBrands = createAsyncThunk(
  "brand/getBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${BRAND_CONTROLLER}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);
export const getBrand = createAsyncThunk(
  "brand/getBrand",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${BRAND_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveBrand = createAsyncThunk(
  "brand/saveBrand",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/${BRAND_CONTROLLER}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateBrand = createAsyncThunk(
  "brand/updateBrand",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${BRAND_CONTROLLER}/${data.id}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "brand/deleteBrand",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${BRAND_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const brandSlice = createSlice({
  name: "brand",
  initialState: {
    brands: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Brands
      .addCase(getBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.data;
      })
      .addCase(getBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Save Brand
      .addCase(saveBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveBrand.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Brand
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Brand
      .addCase(deleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default brandSlice.reducer;
