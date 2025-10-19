import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'temple_admin';
  isEmailVerified: boolean;
  profile: {
    avatar?: string;
    bio?: string;
    location?: string;
    preferences: {
      language: string;
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
    };
  };
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  requiresEmailVerification: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string } }
  | { type: 'LOGIN_FAILURE'; payload?: { requiresEmailVerification?: boolean } }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { accessToken: string } }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'EMAIL_VERIFIED' }
  | { type: 'SET_EMAIL_VERIFICATION_REQUIRED'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  isEmailVerified: false,
  requiresEmailVerification: false,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isLoading: false,
        isAuthenticated: true,
        isEmailVerified: action.payload.user.isEmailVerified,
        requiresEmailVerification: false,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
        isEmailVerified: false,
        requiresEmailVerification: action.payload?.requiresEmailVerification || false,
      };

    case 'LOGOUT':
      return {
        ...initialState,
      };

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'EMAIL_VERIFIED':
      return {
        ...state,
        isEmailVerified: true,
        requiresEmailVerification: false,
        user: state.user ? { ...state.user, isEmailVerified: true } : null,
      };

    case 'SET_EMAIL_VERIFICATION_REQUIRED':
      return {
        ...state,
        requiresEmailVerification: action.payload,
      };

    default:
      return state;
  }
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API request helper
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    // Ensure headers is always a plain object for type safety
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        headers = { ...headers, ...options.headers as Record<string, string> };
      }
    }

    // Add auth header if access token exists
    if (state.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${state.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh token
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401 && state.accessToken) {
        try {
          await refreshToken();
          // Retry the request with new token
          return apiRequest(endpoint, options);
        } catch (refreshError) {
          dispatch({ type: 'LOGOUT' });
          throw new Error('Session expired. Please login again.');
        }
      }
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  };

  // Login function
  const login = async (email: string, password: string, rememberMe = false): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: data.data.user,
          accessToken: data.data.accessToken,
        },
      });
    } catch (error: any) {
       
      const requiresEmailVerification = error.message.includes('verify your email');
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { requiresEmailVerification },
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_EMAIL_VERIFICATION_REQUIRED', payload: true });
    } catch (error) {
       
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // Google login function
  const loginWithGoogle = async (credential: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const data = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: data.data.user,
          accessToken: data.data.accessToken,
        },
      });
    } catch (error) {
       
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Logout from all devices
  const logoutAll = async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout-all', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      const data = await apiRequest('/auth/refresh', {
        method: 'POST',
      });

      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: {
          accessToken: data.data.accessToken,
        },
      });
    } catch (error) {
       
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  // Verify email function
  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await apiRequest(`/auth/verify-email?token=${token}`, {
        method: 'GET',
      });

      dispatch({ type: 'EMAIL_VERIFIED' });
    } catch (error) {
       
      throw error;
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (): Promise<void> => {
    if (!state.user?.email) {
      throw new Error('No email address found');
    }

    await apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: state.user.email }),
    });
  };

  // Request password reset
  const requestPasswordReset = async (email: string): Promise<void> => {
    await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  // Reset password
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const data = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      dispatch({
        type: 'UPDATE_USER',
        payload: data.data.user,
      });
    } catch (error) {
      throw error;
    }
  };

  // Check auth status
  const checkAuthStatus = async (): Promise<void> => {
    try {
      await apiRequest('/auth/check');
      // If successful, we're still authenticated
      // The apiRequest will handle token refresh if needed
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        // Try to refresh token to check if user is logged in
        await refreshToken();
        
        // Get user profile
        const data = await apiRequest('/auth/profile');
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.data.user,
            accessToken: state.accessToken || '', // Will be set by refresh
          },
        });
      } catch (error) {
        // User not logged in or session expired
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, []); // Empty dependency array for initialization only

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!state.accessToken) return;

    // Refresh token every 10 minutes (tokens expire in 15 minutes)
    const interval = setInterval(() => {
      refreshToken().catch(() => {
        // If refresh fails, logout user
        dispatch({ type: 'LOGOUT' });
      });
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [state.accessToken]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
    logoutAll,
    refreshToken,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    changePassword,
    updateProfile,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;