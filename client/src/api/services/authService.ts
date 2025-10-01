/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including:
 * - User registration and login
 * - Profile management
 * - Password changes
 * - Google OAuth integration
 */

import apiClient, { transformError, setAuthToken, clearAuthToken } from '../apiClient';
import { API_ROUTES } from '../apiRoutes';
import type { AxiosResponse } from 'axios';

// Type definitions for authentication
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GoogleAuthData {
  credential: string;
}

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      API_ROUTES.auth.register,
      userData
    );
    
    // Store token and user data after successful registration
    const { token, user } = response.data;
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Login user
 */
export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      API_ROUTES.auth.login,
      loginData
    );
    
    // Store token and user data after successful login
    const { token, user } = response.data;
    setAuthToken(token);
    
    // Use localStorage or sessionStorage based on rememberMe
    const storage = loginData.rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      API_ROUTES.auth.logout
    );
    
    // Clear local storage and tokens
    clearAuthToken();
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    return response.data;
  } catch (error: any) {
    // Even if the API call fails, clear local data
    clearAuthToken();
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    throw transformError(error);
  }
};

/**
 * Get user profile
 */
export const getProfile = async (): Promise<User> => {
  try {
    const response: AxiosResponse<{ user: User }> = await apiClient.get(
      API_ROUTES.auth.profile
    );
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data.user;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData: UpdateProfileData): Promise<User> => {
  try {
    const response: AxiosResponse<{ user: User; message: string }> = await apiClient.put(
      API_ROUTES.auth.updateProfile,
      profileData
    );
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data.user;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Change user password
 */
export const changePassword = async (passwordData: ChangePasswordData): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await apiClient.put(
      API_ROUTES.auth.changePassword,
      passwordData
    );
    
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Google OAuth authentication
 */
export const googleAuth = async (googleData: GoogleAuthData): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      API_ROUTES.auth.googleAuth,
      googleData
    );
    
    // Store token and user data after successful Google auth
    const { token, user } = response.data;
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Get current user from local storage
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data from storage:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};

/**
 * Get user role
 */
export const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  return getUserRole() === 'admin';
};