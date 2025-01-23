import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";

// Async thunk for updating settings
export const updateUserSettings = createAsyncThunk(
  "theme/updateUserSettings",
  async (settings) => {
    const response = await apiService.post("/user-settings", settings);
    return response.data.data;
  }
);

// Async thunk for fetching settings
export const fetchUserSettings = createAsyncThunk(
  "theme/fetchUserSettings",
  async () => {
    const response = await apiService.get("/user-settings");
    return response.data.data;
  }
);

const initialState = {
  mode: "light",
  scheme: "normal",
  settings: {
    navigationStyle: "sidebar",
    contentWidth: "fluid",
    fixedHeader: true,
    fixedSidebar: true,
    sidebarCollapsed: false,
    fontSize: "base",
    fontFamily: "inter",
    borderRadius: 6,
    buttonShape: "default",
    tableSize: "middle",
    animations: true,
    pageTransitions: true,
  },
  loading: false,
  error: null,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchUserSettings
      .addCase(fetchUserSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.mode = action.payload.mode;
        state.scheme = action.payload.scheme;
        state.settings = {
          ...state.settings,
          ...action.payload.settings,
        };
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Handle updateUserSettings
      .addCase(updateUserSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.mode = action.payload.mode;
        state.scheme = action.payload.scheme;
        state.settings = {
          ...state.settings,
          ...action.payload.settings,
        };
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default themeSlice.reducer;
