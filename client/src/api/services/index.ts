/**
 * API Services Index
 * 
 * Central export point for all API services.
 * This provides a clean import interface for components.
 */

// Export all services
export * from './authService';
export * from './templeService';
export * from './reviewService';
export * from './bookingService';
export * from './uploadService';

// Export API client and routes for direct access when needed
export { default as apiClient } from '../apiClient';
export { API_ROUTES } from '../apiRoutes';
export type { ApiError } from '../apiClient';