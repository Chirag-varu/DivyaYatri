/**
 * API Routes Configuration for DivyaYatri
 * 
 * This file defines all API endpoints used throughout the application.
 * Using a centralized approach ensures consistency and makes endpoint management easier.
 */

// Base URL from environment variable with fallback
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

/**
 * API Routes object containing all application endpoints
 * Organized by domain/feature for better maintainability
 */
export const API_ROUTES = {
  // Authentication endpoints
  auth: {
    register: `${BASE_URL}/auth/register`,
    login: `${BASE_URL}/auth/login`,
    logout: `${BASE_URL}/auth/logout`,
    profile: `${BASE_URL}/auth/profile`,
    updateProfile: `${BASE_URL}/auth/profile`,
    changePassword: `${BASE_URL}/auth/change-password`,
    googleAuth: `${BASE_URL}/auth/google`,
  },

  // Temple endpoints
  temples: {
    getAll: `${BASE_URL}/temples`,
    getById: (id: string) => `${BASE_URL}/temples/${id}`,
    create: `${BASE_URL}/temples`,
    update: (id: string) => `${BASE_URL}/temples/${id}`,
    delete: (id: string) => `${BASE_URL}/temples/${id}`,
    search: `${BASE_URL}/temples/search`,
    featured: `${BASE_URL}/temples/featured`,
    nearby: `${BASE_URL}/temples/nearby`,
  },

  // Review endpoints
  reviews: {
    getAll: `${BASE_URL}/reviews`,
    getByTemple: (templeId: string) => `${BASE_URL}/reviews/temple/${templeId}`,
    getByUser: (userId: string) => `${BASE_URL}/reviews/user/${userId}`,
    create: `${BASE_URL}/reviews`,
    update: (id: string) => `${BASE_URL}/reviews/${id}`,
    delete: (id: string) => `${BASE_URL}/reviews/${id}`,
    like: (id: string) => `${BASE_URL}/reviews/${id}/like`,
    unlike: (id: string) => `${BASE_URL}/reviews/${id}/unlike`,
  },

  // Admin endpoints
  admin: {
    dashboard: `${BASE_URL}/admin/dashboard`,
    users: `${BASE_URL}/admin/users`,
    temples: `${BASE_URL}/admin/temples`,
    reviews: `${BASE_URL}/admin/reviews`,
    analytics: `${BASE_URL}/admin/analytics`,
    moderateReview: (id: string) => `${BASE_URL}/admin/reviews/${id}/moderate`,
    banUser: (id: string) => `${BASE_URL}/admin/users/${id}/ban`,
    unbanUser: (id: string) => `${BASE_URL}/admin/users/${id}/unban`,
  },

  // Upload endpoints
  upload: {
    image: `${BASE_URL}/upload/image`,
    multiple: `${BASE_URL}/upload/multiple`,
    delete: (filename: string) => `${BASE_URL}/upload/${filename}`,
  },

  // Utility endpoints
  utils: {
    health: `${BASE_URL}/health`,
    search: `${BASE_URL}/search`,
    suggestions: `${BASE_URL}/suggestions`,
  },
} as const;

/**
 * Export base URL for direct access when needed
 */
export { BASE_URL };

/**
 * Type definitions for better TypeScript support
 */
export type ApiRoutes = typeof API_ROUTES;
export type AuthRoutes = typeof API_ROUTES.auth;
export type TempleRoutes = typeof API_ROUTES.temples;
export type ReviewRoutes = typeof API_ROUTES.reviews;
export type AdminRoutes = typeof API_ROUTES.admin;
export type UploadRoutes = typeof API_ROUTES.upload;