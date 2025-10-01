/**
 * Temple Service
 * 
 * Handles all temple-related API calls including:
 * - Fetching temple data
 * - Creating and updating temples
 * - Search and filtering functionality
 * - Featured and nearby temples
 */

import apiClient, { transformError } from '../apiClient';
import { API_ROUTES } from '../apiRoutes';
import type { AxiosResponse } from 'axios';

// Type definitions for temples
export interface Temple {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  category: 'hindu' | 'buddhist' | 'jain' | 'sikh' | 'other';
  features: string[];
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTempleData {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  category: Temple['category'];
  features: string[];
  openingHours: Temple['openingHours'];
  contactInfo: Temple['contactInfo'];
}

export interface UpdateTempleData extends Partial<CreateTempleData> {
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface TempleSearchParams {
  query?: string;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  features?: string[];
  sortBy?: 'name' | 'rating' | 'distance' | 'created';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface NearbyParams {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers
  limit?: number;
}

export interface TemplePaginatedResponse {
  temples: Temple[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Get all temples with optional pagination
 */
export const getAllTemples = async (params?: {
  page?: number;
  limit?: number;
}): Promise<TemplePaginatedResponse> => {
  try {
    const response: AxiosResponse<TemplePaginatedResponse> = await apiClient.get(
      API_ROUTES.temples.getAll,
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Get temple by ID
 */
export const getTempleById = async (id: string): Promise<Temple> => {
  try {
    const response: AxiosResponse<{ temple: Temple }> = await apiClient.get(
      API_ROUTES.temples.getById(id)
    );
    return response.data.temple;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Create a new temple
 */
export const createTemple = async (templeData: CreateTempleData): Promise<Temple> => {
  try {
    const response: AxiosResponse<{ temple: Temple; message: string }> = await apiClient.post(
      API_ROUTES.temples.create,
      templeData
    );
    return response.data.temple;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Update temple
 */
export const updateTemple = async (id: string, templeData: UpdateTempleData): Promise<Temple> => {
  try {
    const response: AxiosResponse<{ temple: Temple; message: string }> = await apiClient.put(
      API_ROUTES.temples.update(id),
      templeData
    );
    return response.data.temple;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Delete temple
 */
export const deleteTemple = async (id: string): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await apiClient.delete(
      API_ROUTES.temples.delete(id)
    );
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Search temples with filters
 */
export const searchTemples = async (searchParams: TempleSearchParams): Promise<TemplePaginatedResponse> => {
  try {
    const response: AxiosResponse<TemplePaginatedResponse> = await apiClient.get(
      API_ROUTES.temples.search,
      { params: searchParams }
    );
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Get featured temples
 */
export const getFeaturedTemples = async (limit?: number): Promise<Temple[]> => {
  try {
    const response: AxiosResponse<{ temples: Temple[] }> = await apiClient.get(
      API_ROUTES.temples.featured,
      { params: { limit } }
    );
    return response.data.temples;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Get nearby temples based on coordinates
 */
export const getNearbyTemples = async (params: NearbyParams): Promise<Temple[]> => {
  try {
    const response: AxiosResponse<{ temples: Temple[] }> = await apiClient.get(
      API_ROUTES.temples.nearby,
      { params }
    );
    return response.data.temples;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Get temple categories
 */
export const getTempleCategories = (): Temple['category'][] => {
  return ['hindu', 'buddhist', 'jain', 'sikh', 'other'];
};

/**
 * Get common temple features
 */
export const getCommonFeatures = (): string[] => {
  return [
    'parking',
    'wheelchair_accessible',
    'air_conditioning',
    'prayer_hall',
    'meditation_room',
    'library',
    'prasadam',
    'accommodation',
    'donation_box',
    'shoe_stand',
    'drinking_water',
    'restrooms',
    'security',
    'photography_allowed',
    'guided_tours',
    'special_events',
    'online_booking',
    'multilingual_support'
  ];
};