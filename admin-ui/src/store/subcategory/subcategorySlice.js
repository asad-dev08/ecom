import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  SUBCATEGORY_CONTROLLER,
  PAGINATION_API,
  DEFAULT_SORTING,
} from "../../utils/actionTypes";
import { apiService } from "../../services/api";

// Get Subcategories with Pagination
export const getSubcategoriesWithPagination = createAsyncThunk(
  "subcategory/getSubcategoriesWithPagination",
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
        `/${SUBCATEGORY_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get All Subcategories
export const getSubcategories = createAsyncThunk(
  "subcategory/getSubcategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SUBCATEGORY_CONTROLLER}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get Subcategories by Category ID
export const getSubcategoriesByCategory = createAsyncThunk(
  "subcategory/getSubcategoriesByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(
        `/${SUBCATEGORY_CONTROLLER}/category/${categoryId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get Single Subcategory
export const getSubcategory = createAsyncThunk(
  "subcategory/getSubcategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${SUBCATEGORY_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Create Subcategory
export const saveSubcategory = createAsyncThunk(
  "subcategory/saveSubcategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${SUBCATEGORY_CONTROLLER}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update Subcategory
export const updateSubcategory = createAsyncThunk(
  "subcategory/updateSubcategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${SUBCATEGORY_CONTROLLER}/${data.id}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Delete Subcategory
export const deleteSubcategory = createAsyncThunk(
  "subcategory/deleteSubcategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(
        `/${SUBCATEGORY_CONTROLLER}/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const subcategorySlice = createSlice({
  name: "subcategory",
  initialState: {
    subcategories: [],
    categoryWiseSubcategories: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Subcategories
      .addCase(getSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload.data;
      })
      .addCase(getSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Subcategories by Category
      .addCase(getSubcategoriesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubcategoriesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryWiseSubcategories[action.meta.arg] = action.payload.data;
      })
      .addCase(getSubcategoriesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single Subcategory
      .addCase(getSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubcategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Save Subcategory
      .addCase(saveSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSubcategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Subcategory
      .addCase(updateSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubcategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Subcategory
      .addCase(deleteSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubcategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default subcategorySlice.reducer;
