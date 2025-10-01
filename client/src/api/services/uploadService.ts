/**
 * Upload Service
 * 
 * Handles file upload operations including:
 * - Image uploads for temples, reviews, profiles
 * - Multiple file uploads
 * - File deletion
 * - File validation
 */

import apiClient, { transformError } from '../apiClient';
import { API_ROUTES } from '../apiRoutes';
import type { AxiosResponse } from 'axios';

// Type definitions for uploads
export interface UploadResponse {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export interface MultipleUploadResponse {
  files: UploadResponse[];
  message: string;
}

export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  quality?: number; // for image compression (0.1 - 1.0)
}

/**
 * Upload a single image
 */
export const uploadImage = async (
  file: File,
  options?: UploadOptions
): Promise<UploadResponse> => {
  try {
    // Validate file before upload
    validateFile(file, options);

    const formData = new FormData();
    formData.append('image', file);
    
    if (options?.quality) {
      formData.append('quality', options.quality.toString());
    }

    const response: AxiosResponse<{ file: UploadResponse; message: string }> = 
      await apiClient.post(API_ROUTES.upload.image, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Track upload progress
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          console.log(`Upload progress: ${progress}%`);
        },
      });

    return response.data.file;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  files: File[],
  options?: UploadOptions
): Promise<UploadResponse[]> => {
  try {
    // Validate all files before upload
    files.forEach(file => validateFile(file, options));

    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`images`, file);
    });

    if (options?.quality) {
      formData.append('quality', options.quality.toString());
    }

    const response: AxiosResponse<MultipleUploadResponse> = 
      await apiClient.post(API_ROUTES.upload.multiple, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          console.log(`Upload progress: ${progress}%`);
        },
      });

    return response.data.files;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Delete uploaded file
 */
export const deleteFile = async (filename: string): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await apiClient.delete(
      API_ROUTES.upload.delete(filename)
    );
    return response.data;
  } catch (error: any) {
    throw transformError(error);
  }
};

/**
 * Upload profile avatar
 */
export const uploadAvatar = async (file: File): Promise<UploadResponse> => {
  const options: UploadOptions = {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 0.8,
  };

  return await uploadImage(file, options);
};

/**
 * Upload temple images
 */
export const uploadTempleImages = async (files: File[]): Promise<UploadResponse[]> => {
  const options: UploadOptions = {
    maxSize: 5 * 1024 * 1024, // 5MB per file
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 0.9,
  };

  return await uploadMultipleImages(files, options);
};

/**
 * Upload review images
 */
export const uploadReviewImages = async (files: File[]): Promise<UploadResponse[]> => {
  const options: UploadOptions = {
    maxSize: 3 * 1024 * 1024, // 3MB per file
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 0.8,
  };

  return await uploadMultipleImages(files, options);
};

/**
 * Validate file before upload
 */
const validateFile = (file: File, options?: UploadOptions): void => {
  const defaultOptions: UploadOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB default
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  };

  const validationOptions = { ...defaultOptions, ...options };

  // Check file size
  if (validationOptions.maxSize && file.size > validationOptions.maxSize) {
    const maxSizeMB = validationOptions.maxSize / (1024 * 1024);
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Check file type
  if (validationOptions.allowedTypes && !validationOptions.allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${validationOptions.allowedTypes.join(', ')}`);
  }

  // Check if file is actually an image by reading first few bytes
  if (file.type.startsWith('image/')) {
    validateImageFile(file);
  }
};

/**
 * Additional validation for image files
 */
const validateImageFile = (file: File): void => {
  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeTypeExtensions: { [key: string]: string[] } = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
  };

  const allowedExtensions = mimeTypeExtensions[file.type];
  if (allowedExtensions && extension && !allowedExtensions.includes(extension)) {
    throw new Error(`File extension ${extension} does not match MIME type ${file.type}`);
  }
};

/**
 * Convert file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file preview URL for display
 */
export const getFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
};

/**
 * Compress image before upload (client-side)
 */
export const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 1920x1080)
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Canvas to blob conversion failed'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Image loading error'));
    img.src = URL.createObjectURL(file);
  });
};