import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL - default to localhost, can be overridden via environment
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - auto logout
      if (status === 401) {
        try {
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("user");
          // Navigation will be handled by AuthContext
        } catch (err) {
          console.error("Error clearing auth data:", err);
        }
      }

      // Return formatted error
      return Promise.reject({
        status,
        message: data?.message || "An error occurred",
        errors: data?.errors || null,
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        status: 0,
        message: "Network error. Please check your connection.",
        errors: null,
      });
    } else {
      // Other errors
      return Promise.reject({
        status: 0,
        message: error.message || "An unexpected error occurred",
        errors: null,
      });
    }
  },
);

// API service methods
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  refreshToken: () => api.post("/auth/refresh"),
};

export const recipeAPI = {
  getAll: (params) => api.get("/recipes", { params }),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (recipeData) =>
    api.post("/recipes", recipeData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, recipeData) => api.put(`/recipes/${id}`, recipeData),
  delete: (id) => api.delete(`/recipes/${id}`),
  react: (id, reactionType) =>
    api.post(`/recipes/${id}/react`, { type: reactionType }),
  save: (id) => api.post(`/recipes/${id}/save`),
  unsave: (id) => api.delete(`/recipes/${id}/save`),
};

export const commentAPI = {
  getByRecipe: (recipeId, params) =>
    api.get(`/recipes/${recipeId}/comments`, { params }),
  create: (recipeId, content) =>
    api.post(`/recipes/${recipeId}/comments`, { content }),
  delete: (recipeId, commentId) =>
    api.delete(`/recipes/${recipeId}/comments/${commentId}`),
};

export const userAPI = {
  getById: (id) => api.get(`/users/${id}`),
  getRecipes: (id, params) => api.get(`/users/${id}/recipes`, { params }),
  getSavedRecipes: (id, params) => api.get(`/users/${id}/saved`, { params }),
  follow: (id) => api.post(`/users/${id}/follow`),
  unfollow: (id) => api.delete(`/users/${id}/follow`),
  updateProfile: (id, userData) => api.put(`/users/${id}`, userData),
};

export default api;
