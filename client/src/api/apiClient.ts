/**
 * API Client Configuration for DivyaYatri
 * 
 * This file sets up the main axios instance with interceptors for:
 * - Automatic JWT token attachment
 * - Request/response logging in development
 * - Global error handling
 * - Common response transformations
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { BASE_URL } from './apiRoutes';

/**
 * Create axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials for CORS requests
  withCredentials: true,
});

/**
 * Request interceptor to add JWT token to all requests
 */
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling common response patterns and errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        url: error.config?.url,
      });
    }

    // Handle common HTTP errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear tokens and redirect to login
          handleUnauthorized();
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.warn('Access forbidden. You do not have permission to perform this action.');
          break;
        case 404:
          // Not found
          console.warn('Resource not found.');
          break;
        case 422:
          // Validation error
          console.warn('Validation error:', data);
          break;
        case 429:
          // Rate limit exceeded
          console.warn('Too many requests. Please try again later.');
          break;
        case 500:
          // Server error
          console.error('Internal server error. Please try again later.');
          break;
        default:
          console.error(`HTTP Error ${status}:`, data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error. Please check your internet connection.');
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Handle unauthorized access
 */
const handleUnauthorized = () => {
  // Clear stored tokens
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');

  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('auth:logout'));

  // Redirect to login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * Helper function to set auth token manually
 */
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
  // Also set it in the default headers for immediate use
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * Helper function to clear auth token
 */
export const clearAuthToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  delete apiClient.defaults.headers.common['Authorization'];
};

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

/**
 * Generic API error type for consistent error handling
 */
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

/**
 * Transform axios error to our custom ApiError format
 */
export const transformError = (error: AxiosError): ApiError => {
  if (error.response) {
    const responseData = error.response.data as any;
    return {
      message: responseData?.message || error.message,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    return {
      message: 'Network error. Please check your internet connection.',
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred.',
    };
  }
};

export default apiClient;