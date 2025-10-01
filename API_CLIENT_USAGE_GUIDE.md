# DivyaYatri API Client Usage Guide

This guide demonstrates how to use the DivyaYatri API client structure in your React components.

## 📁 Project Structure

```
/src
  /api
    apiRoutes.ts          # Centralized API endpoint definitions
    apiClient.ts          # Axios instance with interceptors
    /services
      index.ts            # Service exports
      authService.ts      # Authentication operations
      templeService.ts    # Temple CRUD operations
      reviewService.ts    # Review management
      uploadService.ts    # File upload operations
  /components
  /pages
  /hooks
```

## 🔧 Environment Setup

Create a `.env` file in your client root:

```env
VITE_BACKEND_URL=http://localhost:5000/api
```

## 🚀 Basic Usage Examples

### 1. Authentication in Login Component

```tsx
// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, type LoginData, type ApiError } from '../api/services';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      console.log('Login successful:', response.user);
      navigate('/dashboard');
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <label>
        <input
          type="checkbox"
          checked={formData.rememberMe}
          onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
        />
        Remember Me
      </label>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### 2. Fetching Temples with useEffect

```tsx
// src/pages/TemplesPage.tsx
import React, { useState, useEffect } from 'react';
import { getAllTemples, type Temple, type TemplePaginatedResponse } from '../api/services';

const TemplesPage: React.FC = () => {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const fetchTemples = async (page: number = 1) => {
    try {
      setLoading(true);
      const response: TemplePaginatedResponse = await getAllTemples({
        page,
        limit: 10,
      });
      
      setTemples(response.temples);
      setPagination(response.pagination);
    } catch (err: any) {
      setError('Failed to fetch temples');
      console.error('Fetch temples error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchTemples(newPage);
  };

  if (loading) return <div>Loading temples...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>Temples</h1>
      <div className="temples-grid">
        {temples.map((temple) => (
          <div key={temple.id} className="temple-card">
            <h3>{temple.name}</h3>
            <p>{temple.description}</p>
            <p>📍 {temple.location.city}, {temple.location.state}</p>
            <p>⭐ {temple.ratings.average} ({temple.ratings.count} reviews)</p>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev}
        >
          Previous
        </button>
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        <button 
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### 3. Creating Reviews with Form

```tsx
// src/components/CreateReviewModal.tsx
import React, { useState } from 'react';
import { createReview, uploadReviewImages, type CreateReviewData } from '../api/services';

interface CreateReviewModalProps {
  templeId: string;
  onSuccess: () => void;
  onClose: () => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  templeId,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateReviewData>({
    templeId,
    rating: 5,
    title: '',
    content: '',
    visitDate: new Date().toISOString().split('T')[0],
    images: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const uploadedFiles = await uploadReviewImages(selectedFiles);
        imageUrls = uploadedFiles.map(file => file.url);
      }

      // Create review with image URLs
      const reviewData: CreateReviewData = {
        ...formData,
        images: imageUrls,
      };

      await createReview(reviewData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Write a Review</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Rating:</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>
                  {rating} Star{rating > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Review:</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <label>Visit Date:</label>
            <input
              type="date"
              value={formData.visitDate}
              onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Photos (optional):</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            {selectedFiles.length > 0 && (
              <p>{selectedFiles.length} file(s) selected</p>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### 4. Using React Query for Better Data Management

```tsx
// src/hooks/useTemples.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTemples, searchTemples, type TempleSearchParams } from '../api/services';

export const useTemples = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['temples', params],
    queryFn: () => getAllTemples(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSearchTemples = (searchParams: TempleSearchParams) => {
  return useQuery({
    queryKey: ['temples', 'search', searchParams],
    queryFn: () => searchTemples(searchParams),
    enabled: !!searchParams.query, // Only run if there's a search query
  });
};

// Usage in component
const TemplesWithQuery: React.FC = () => {
  const { data, isLoading, error } = useTemples({ page: 1, limit: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.temples.map(temple => (
        <div key={temple.id}>{temple.name}</div>
      ))}
    </div>
  );
};
```

### 5. Protected Route Component

```tsx
// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../api/services';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const location = useLocation();
  const isAuth = isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly) {
    const user = getCurrentUser();
    if (user?.role !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
```

### 6. Global Error Handler Hook

```tsx
// src/hooks/useAuthListener.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthLogout = () => {
      navigate('/login');
    };

    // Listen for automatic logout events from API client
    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [navigate]);
};
```

## 🔑 Key Benefits

1. **Centralized API Management**: All endpoints in one place
2. **Automatic Authentication**: JWT tokens handled automatically
3. **Error Handling**: Consistent error responses and automatic logout
4. **Type Safety**: Full TypeScript support
5. **Reusable**: Clean service functions for all components
6. **Maintainable**: Easy to update endpoints and add new features

## 🛠️ Development Tips

1. **Environment Variables**: Always use `VITE_BACKEND_URL` for the API base URL
2. **Error Handling**: Always wrap API calls in try-catch blocks
3. **Loading States**: Show loading indicators during API calls
4. **React Query**: Use for better caching and state management
5. **File Uploads**: Use the upload service for all file operations
6. **Authentication**: Check auth status before protected operations

## 📝 Adding New Endpoints

1. Add the endpoint to `apiRoutes.ts`
2. Create service functions in the appropriate service file
3. Add TypeScript interfaces for request/response data
4. Use the new service functions in your components

This structure provides a solid foundation for your API interactions while maintaining clean, reusable, and type-safe code.