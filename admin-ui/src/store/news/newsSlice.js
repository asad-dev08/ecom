import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { NEWS_CONTROLLER, PAGINATION_API } from "../../utils/actionTypes";
import { apiService } from "../../services/api";

export const getNewsWithPagination = createAsyncThunk(
  "news/getNewsWithPagination",
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
        `/${NEWS_CONTROLLER}/${PAGINATION_API}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const saveNews = createAsyncThunk(
  "news/saveNews",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/${NEWS_CONTROLLER}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateNews = createAsyncThunk(
  "news/updateNews",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(
        `/${NEWS_CONTROLLER}/${id}`,
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

export const getNews = createAsyncThunk(
  "project/getNews",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/${NEWS_CONTROLLER}/${id}`);

      if (!response) {
        throw new Error("Data fetching failed");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNews = createAsyncThunk(
  "news/deleteNews",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.delete(`/${NEWS_CONTROLLER}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);
