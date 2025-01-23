// @store
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SPECIAL_OFFER_CONTROLLER, PAGINATION_API } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

// Async thunks
export const getSpecialOffersWithPagination = createAsyncThunk(
  "specialOffer/getSpecialOffersWithPagination",
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
        `/${SPECIAL_OFFER_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getSpecialOffers = createAsyncThunk(
  "specialOffer/getSpecialOffers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SPECIAL_OFFER_CONTROLLER}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveSpecialOffer = createAsyncThunk(
  "specialOffer/saveSpecialOffer",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${SPECIAL_OFFER_CONTROLLER}`,
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

export const updateSpecialOffer = createAsyncThunk(
  "specialOffer/updateSpecialOffer",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${SPECIAL_OFFER_CONTROLLER}/${id}`,
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

export const deleteSpecialOffer = createAsyncThunk(
  "specialOffer/deleteSpecialOffer",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${SPECIAL_OFFER_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getSpecialOffer = createAsyncThunk(
  "specialOffer/getSpecialOffer",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SPECIAL_OFFER_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const specialOfferSlice = createSlice({
  name: "specialOffer",
  initialState: {
    specialOffers: [],
    specialOffer: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Special Offers with Pagination
      .addCase(getSpecialOffersWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpecialOffersWithPagination.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getSpecialOffersWithPagination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Special Offers
      .addCase(getSpecialOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpecialOffers.fulfilled, (state, action) => {
        state.specialOffers = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getSpecialOffers.rejected, (state, action) => {
        state.specialOffers = [];
        state.loading = false;
        state.error = action.payload;
      })

      // Save Special Offer
      .addCase(saveSpecialOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSpecialOffer.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveSpecialOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Special Offer
      .addCase(updateSpecialOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSpecialOffer.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateSpecialOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Special Offer
      .addCase(deleteSpecialOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSpecialOffer.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteSpecialOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single Special Offer
      .addCase(getSpecialOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpecialOffer.fulfilled, (state, action) => {
        state.specialOffer = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getSpecialOffer.rejected, (state, action) => {
        state.specialOffer = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default specialOfferSlice.reducer; 