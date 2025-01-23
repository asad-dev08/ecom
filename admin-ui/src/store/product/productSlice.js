import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PAGINATION_API, PRODUCT_CONTROLLER } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

export const getProductsWithPagination = createAsyncThunk(
  "product/getProductsWithPagination",
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
        `/${PRODUCT_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveProduct = createAsyncThunk(
  "product/saveProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${PRODUCT_CONTROLLER}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response?.data) {
        throw new Error("Failed to save product");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          "Failed to save product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${PRODUCT_CONTROLLER}/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response?.data) {
        throw new Error("Failed to update product");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          "Failed to update product"
      );
    }
  }
);

export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${PRODUCT_CONTROLLER}`);

      if (!response) {
        throw new Error("Data fetching failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductsDropdown = createAsyncThunk(
  "product/getProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${PRODUCT_CONTROLLER}/dropdown`);

      if (!response) {
        throw new Error("Data fetching failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProduct = createAsyncThunk(
  "product/getProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${PRODUCT_CONTROLLER}/${id}`);

      if (!response) {
        throw new Error("Data fetching failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${PRODUCT_CONTROLLER}/${id}`);

      if (!response) {
        throw new Error("Data deletion failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Products with Pagination
      .addCase(getProductsWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsWithPagination.fulfilled, (state, action) => {
        state.products = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getProductsWithPagination.rejected, (state, action) => {
        state.products = [];
        state.loading = false;
        state.error = action.payload;
      })

      // Save Product
      .addCase(saveProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Products
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        const data = action.payload.data;
        state.products =
          data &&
          data.length > 0 &&
          data.map((x) => ({
            label: x.name,
            value: x.id,
          }));
        state.loading = false;
        state.error = null;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
