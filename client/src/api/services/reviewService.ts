/**
 * Review Service
 * 
 * Handles all review-related API calls including:
 * - Creating and managing reviews
 * - Fetching reviews by temple or user
 * - Like/unlike functionality
 * - Review moderation
 */

import apiClient, { transformError } from '../apiClient';
import { API_ROUTES } from '../apiRoutes';
import type { AxiosResponse } from 'axios';

// Type definitions for reviews
export interface Review {
  id: string;
  userId: string;
  templeId: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  images: string[];
  visitDate: string;
  isVerifiedVisit: boolean;
  likes: string[]; // array of user IDs who liked
  likesCount: number;
  isModerated: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  isReported: boolean;
  reportCount: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  temple: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  templeId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  visitDate: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
  visitDate?: string;
}

export interface ReviewsParams {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'most_liked';
  rating?: number; // filter by specific rating
  verified?: boolean; // filter by verified visits only
}

export interface ReviewsPaginatedResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

/**
 * Get all reviews with pagination
 */
export const getAllReviews = async (params?: ReviewsParams): Promise<ReviewsPaginatedResponse> => {
  try {
    const response: AxiosResponse<ReviewsPaginatedResponse> = await apiClient.get(
      API_ROUTES.reviews.getAll,
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Get reviews for a specific temple
 */
export const getReviewsByTemple = async (
  templeId: string,
  params?: ReviewsParams
): Promise<ReviewsPaginatedResponse> => {
  try {
    const response: AxiosResponse<ReviewsPaginatedResponse> = await apiClient.get(
      API_ROUTES.reviews.getByTemple(templeId),
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Get reviews by a specific user
 */
export const getReviewsByUser = async (
  userId: string,
  params?: ReviewsParams
): Promise<ReviewsPaginatedResponse> => {
  try {
    const response: AxiosResponse<ReviewsPaginatedResponse> = await apiClient.get(
      API_ROUTES.reviews.getByUser(userId),
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Create a new review
 */
export const createReview = async (reviewData: CreateReviewData): Promise<Review> => {
  try {
    const response: AxiosResponse<{ review: Review; message: string }> = await apiClient.post(
      API_ROUTES.reviews.create,
      reviewData
    );
    return response.data.review;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Update a review
 */
export const updateReview = async (id: string, reviewData: UpdateReviewData): Promise<Review> => {
  try {
    const response: AxiosResponse<{ review: Review; message: string }> = await apiClient.put(
      API_ROUTES.reviews.update(id),
      reviewData
    );
    return response.data.review;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (id: string): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await apiClient.delete(
      API_ROUTES.reviews.delete(id)
    );
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Like a review
 */
export const likeReview = async (id: string): Promise<{ liked: boolean; likesCount: number }> => {
  try {
    const response: AxiosResponse<{ liked: boolean; likesCount: number; message: string }> = 
      await apiClient.post(API_ROUTES.reviews.like(id));
    return {
      liked: response.data.liked,
      likesCount: response.data.likesCount,
    };
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Unlike a review
 */
export const unlikeReview = async (id: string): Promise<{ liked: boolean; likesCount: number }> => {
  try {
    const response: AxiosResponse<{ liked: boolean; likesCount: number; message: string }> = 
      await apiClient.post(API_ROUTES.reviews.unlike(id));
    return {
      liked: response.data.liked,
      likesCount: response.data.likesCount,
    };
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Toggle like/unlike for a review
 */
export const toggleReviewLike = async (id: string, isCurrentlyLiked: boolean): Promise<{ liked: boolean; likesCount: number }> => {
  if (isCurrentlyLiked) {
    return await unlikeReview(id);
  } else {
    return await likeReview(id);
  }
};

/**
 * Report a review
 */
export const reportReview = async (id: string, reason: string): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      `${API_ROUTES.reviews.getAll}/${id}/report`,
      { reason }
    );
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Get review statistics for a temple
 */
export const getTempleReviewStats = async (templeId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}> => {
  try {
    const response: AxiosResponse<{
      stats: {
        averageRating: number;
        totalReviews: number;
        ratingDistribution: { [key: number]: number };
      };
    }> = await apiClient.get(`${API_ROUTES.reviews.getByTemple(templeId)}/stats`);
    return response.data.stats;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Check if user can review a temple (hasn't reviewed before)
 */
export const canUserReviewTemple = async (templeId: string): Promise<{ canReview: boolean; existingReviewId?: string }> => {
  try {
    const response: AxiosResponse<{ canReview: boolean; existingReviewId?: string }> = 
      await apiClient.get(`${API_ROUTES.reviews.getByTemple(templeId)}/can-review`);
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Get rating labels for UI display
 */
export const getRatingLabels = (): { [key: number]: string } => {
  return {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };
};

/**
 * Calculate percentage for rating distribution
 */
export const calculateRatingPercentage = (
  ratingCount: number,
  totalReviews: number
): number => {
  if (totalReviews === 0) return 0;
  return Math.round((ratingCount / totalReviews) * 100);
};