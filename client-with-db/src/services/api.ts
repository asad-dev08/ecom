import axios from "axios";
import { BASE_URL } from "../utils/actionTypes";
import store from "../store/store";
import { logoutCustomer } from "../store/slices/customerAuthSlice";

// Update types for API parameters
interface ProductParams {
  page?: number;
  limit?: number;
  category?: string; // Changed from categoryId to category (slug)
  subcategory?: string; // Changed from subcategoryId to subcategory (slug)
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating_desc";
  search?: string;
  inStock?: boolean;
  onSale?: boolean;
  rating?: number;
  brand?: string;
  [key: string]: string | number | boolean | undefined; // Allow dynamic attribute filters
}

interface CategoryParams {
  featured?: boolean;
}

const api = axios.create({
  baseURL: `${BASE_URL}/api/customer`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.customerAuth.tokens?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const productAPI = {
  // Get products with various filters
  getProducts: async (params: ProductParams) => {
    // Remove undefined values from params
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    const response = await api.get("/products", {
      params: cleanParams,
    });
    return response.data;
  },

  // Get product details
  getProductDetails: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get related products
  getRelatedProducts: async (productId: string, categoryId: string) => {
    const response = await api.get(
      `/products/related/${productId}/${categoryId}`
    );
    return response.data;
  },

  // Search products
  searchProducts: async (params: ProductParams) => {
    const response = await api.get("/products/search", { params });
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  // Get featured categories
  getFeaturedCategories: async () => {
    const response = await api.get("/categories/featured");
    return response.data;
  },
};

// Modify error handling interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("res:", error);
    if (error.response) {
      // Handle authentication errors
      if (error.response.status === 401) {
        // Token expired or invalid, logout user
        store.dispatch(logoutCustomer());
      }
      console.error("API Error:", error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error("Network Error:", error.request);
      return Promise.reject({ message: "Network error occurred" });
    } else {
      console.error("Error:", error.message);
      return Promise.reject({ message: "An error occurred" });
    }
  }
);

export type { ProductParams, CategoryParams };

export default api;
