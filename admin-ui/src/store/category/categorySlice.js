import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CATEGORY_CONTROLLER, PAGINATION_API } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

// Async thunks
export const getCategorysWithPagination = createAsyncThunk(
  "category/getCategorysWithPagination",
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
        `/${CATEGORY_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getCategories = createAsyncThunk(
  "category/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${CATEGORY_CONTROLLER}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveCategory = createAsyncThunk(
  "category/saveCategory",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${CATEGORY_CONTROLLER}`,
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

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${CATEGORY_CONTROLLER}/${id}`,
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

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${CATEGORY_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);
export const getCategory = createAsyncThunk(
  "user/getCategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${CATEGORY_CONTROLLER}/${id}`);

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

// Add new thunk for subcategories
export const getSubcategoriesByCategory = createAsyncThunk(
  "category/getSubcategoriesByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(
        `/${CATEGORY_CONTROLLER}/${categoryId}/subcategories`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Slice
const categorySlice = createSlice({
  name: "category",
  initialState: {
    categories: [],
    subcategories: [],
    loading: false,
    error: null,
    paginatedCategories: [],
    totalCategories: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Categories with Pagination
      .addCase(getCategorysWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategorysWithPagination.fulfilled, (state, action) => {
        state.paginatedCategories = action.payload.data.rows;
        state.totalCategories = action.payload.data.total;
        state.loading = false;
        state.error = null;
      })
      .addCase(getCategorysWithPagination.rejected, (state, action) => {
        state.paginatedCategories = [];
        state.totalCategories = 0;
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Categories
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.categories = [];
        state.loading = false;
        state.error = action.payload;
      })

      // Save Category
      .addCase(saveCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCategory.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add reducers for subcategories
      .addCase(getSubcategoriesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubcategoriesByCategory.fulfilled, (state, action) => {
        state.subcategories = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getSubcategoriesByCategory.rejected, (state, action) => {
        state.subcategories = [];
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
