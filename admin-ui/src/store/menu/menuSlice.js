// src/redux/menuSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { MENU_CONTROLLER } from "../../utils/actionTypes";

export const saveMenu = createAsyncThunk(
  "menu/saveMenu",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/${MENU_CONTROLLER}`, obj);

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
export const updateMenu = createAsyncThunk(
  "menu/updateMenu",
  async (obj, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${MENU_CONTROLLER}/${obj.id}`,
        obj
      );

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

export const getMenus = createAsyncThunk(
  "menu/getMenus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${MENU_CONTROLLER}`);

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
export const getMenu = createAsyncThunk(
  "menu/getMenu",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${MENU_CONTROLLER}/${id}`);

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
export const deleteMenu = createAsyncThunk(
  "menu/deleteMenu",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${MENU_CONTROLLER}/${id}`);

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
const menuSlice = createSlice({
  name: "menu",
  initialState: {
    menus: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(saveMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMenus.fulfilled, (state, action) => {
        const data = action.payload.data;
        state.menus = data;
        state.loading = false;
        state.error = null;
      })
      .addCase(getMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {} = menuSlice.actions;
export default menuSlice.reducer;
