import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  PAGE_CONTROLLER,
  DEFAULT_SORTING,
  PAGINATION_API,
} from "../../utils/actionTypes";
import { apiService } from "../../services/api";

// Get Pages with Pagination
export const getPagesWithPagination = createAsyncThunk(
  "page/getPagesWithPagination",
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
        `/${PAGE_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get All Pages
export const getPages = createAsyncThunk(
  "page/getPages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${PAGE_CONTROLLER}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Get Single Page
export const getPage = createAsyncThunk(
  "page/getPage",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${PAGE_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Save Page
export const savePage = createAsyncThunk(
  "page/savePage",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/${PAGE_CONTROLLER}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update Page
export const updatePage = createAsyncThunk(
  "page/updatePage",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/${PAGE_CONTROLLER}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Delete Page
export const deletePage = createAsyncThunk(
  "page/deletePage",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${PAGE_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Page Sections CRUD operations
export const getPageSections = createAsyncThunk(
  "page/getPageSections",
  async (pageId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${PAGE_CONTROLLER}/${pageId}/sections`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const savePageSection = createAsyncThunk(
  "page/savePageSection",
  async ({ pageId, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.post(
        `/${PAGE_CONTROLLER}/${pageId}/sections`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updatePageSection = createAsyncThunk(
  "page/updatePageSection",
  async ({ pageId, sectionId, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${PAGE_CONTROLLER}/${pageId}/sections/${sectionId}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deletePageSection = createAsyncThunk(
  "page/deletePageSection",
  async ({ pageId, sectionId }, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(
        `/${PAGE_CONTROLLER}/${pageId}/sections/${sectionId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const pageSlice = createSlice({
  name: "page",
  initialState: {
    pages: [],
    sections: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Pages
      .addCase(getPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload.data;
      })
      .addCase(getPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Save Page
      .addCase(savePage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(savePage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Page
      .addCase(updatePage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Page
      .addCase(deletePage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deletePage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Page Sections
      .addCase(getPageSections.fulfilled, (state, action) => {
        state.sections = action.payload.data;
      })
      .addCase(savePageSection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePageSection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deletePageSection.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export default pageSlice.reducer; 