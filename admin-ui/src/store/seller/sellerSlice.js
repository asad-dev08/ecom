import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PAGINATION_API, SELLER_CONTROLLER } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

export const getSellersWithPagination = createAsyncThunk(
  "seller/getSellersWithPagination",
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
        `/${SELLER_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getSellers = createAsyncThunk(
  "seller/getSellers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SELLER_CONTROLLER}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveSeller = createAsyncThunk(
  "seller/saveSeller",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${SELLER_CONTROLLER}`,
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

export const updateSeller = createAsyncThunk(
  "seller/updateSeller",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${SELLER_CONTROLLER}/${id}`,
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

export const deleteSeller = createAsyncThunk(
  "seller/deleteSeller",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${SELLER_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getSeller = createAsyncThunk(
  "seller/getSeller",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SELLER_CONTROLLER}/${id}`);

      if (!response) {
        throw new Error("Data fetching failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSellerVerification = createAsyncThunk(
  "seller/updateVerification",
  async ({ id, verified }, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${SELLER_CONTROLLER}/${id}/verify`,
        { verified }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const sellerSlice = createSlice({
  name: "seller",
  initialState: {
    sellers: [],
    loading: false,
    error: null,
    paginatedSellers: [],
    totalSellers: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Sellers with Pagination
      .addCase(getSellersWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSellersWithPagination.fulfilled, (state, action) => {
        state.paginatedSellers = action.payload.data.rows;
        state.totalSellers = action.payload.data.total;
        state.loading = false;
        state.error = null;
      })
      .addCase(getSellersWithPagination.rejected, (state, action) => {
        state.paginatedSellers = [];
        state.totalSellers = 0;
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Sellers
      .addCase(getSellers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSellers.fulfilled, (state, action) => {
        state.sellers = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getSellers.rejected, (state, action) => {
        state.sellers = [];
        state.loading = false;
        state.error = action.payload;
      })

      // Save Seller
      .addCase(saveSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSeller.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Seller
      .addCase(updateSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSeller.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Seller
      .addCase(deleteSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSeller.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single Seller
      .addCase(getSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSeller.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Seller Verification
      .addCase(updateSellerVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSellerVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateSellerVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default sellerSlice.reducer;
