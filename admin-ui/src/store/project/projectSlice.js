import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PAGINATION_API, PROJECT_CONTROLLER } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

export const getProjectsWithPagination = createAsyncThunk(
  "project/getProjectsWithPagination",
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
        `/${PROJECT_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveProject = createAsyncThunk(
  "project/saveProject",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/${PROJECT_CONTROLLER}`, obj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response) {
        throw new Error("Data saving failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  "project/updateProject",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${PROJECT_CONTROLLER}/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response) {
        throw new Error("Data updating failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProjects = createAsyncThunk(
  "project/getProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${PROJECT_CONTROLLER}`);

      if (!response) {
        throw new Error("Data fetching failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProject = createAsyncThunk(
  "project/getProject",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${PROJECT_CONTROLLER}/${id}`);

      if (!response) {
        throw new Error("Data fetching failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  "project/deleteProject",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${PROJECT_CONTROLLER}/${id}`);

      if (!response) {
        throw new Error("Data deletion failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Projects with Pagination
      .addCase(getProjectsWithPagination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectsWithPagination.fulfilled, (state, action) => {
        state.projects = action.payload.data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getProjectsWithPagination.rejected, (state, action) => {
        state.projects = [];
        state.loading = false;
        state.error = action.payload;
      })

      // Save Project
      .addCase(saveProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProject.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Projects
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        const data = action.payload.data;
        state.projects =
          data &&
          data.length > 0 &&
          data.map((x) => ({
            label: x.name,
            value: x.id,
          }));
        state.loading = false;
        state.error = null;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default projectSlice.reducer;
