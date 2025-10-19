import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

// Types
export interface User {
  lastName: ReactNode;
  firstName: ReactNode;
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
  loginWithGoogle: (userData: {
    googleId: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) => Promise<void>;
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
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,
  isEmailVerified: false,
  requiresEmailVerification: false,
};
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        isEmailVerified: action.payload.user.isEmailVerified,
        requiresEmailVerification: !action.payload.user.isEmailVerified,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
        isEmailVerified: false,
        requiresEmailVerification: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isEmailVerified: false,
        requiresEmailVerification: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        isEmailVerified: action.payload.isEmailVerified,
        requiresEmailVerification: !action.payload.isEmailVerified,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token with backend
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: data.data.user,
                token,
              },
            });
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.data.user,
            token: data.data.token,
          },
        });
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
       
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.data.user,
            token: data.data.token,
          },
        });
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      // eslint-disable-next-line no-useless-catch
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const logoutAll = async (): Promise<void> => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const refreshToken = async (): Promise<void> => {
    // Implementation would call refresh token endpoint
    console.log('Refresh token not implemented yet');
  };

  const verifyEmail = async (token: string): Promise<void> => {
    // Implementation would call email verification endpoint
    console.log('Email verification not implemented yet', token);
  };

  const resendVerificationEmail = async (): Promise<void> => {
    // Implementation would call resend verification endpoint
    console.log('Resend verification email not implemented yet');
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    // Implementation would call password reset request endpoint
    console.log('Password reset request not implemented yet', email);
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    // Implementation would call password reset endpoint
    console.log('Password reset not implemented yet', token, newPassword);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    // Implementation would call change password endpoint
    console.log('Change password not implemented yet', currentPassword, newPassword);
  };

  const checkAuthStatus = async (): Promise<void> => {
    // Already implemented in useEffect
    console.log('Check auth status called');
  };

  const loginWithGoogle = async (userData: {
    googleId: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.data.user,
            token: data.data.token,
          },
        });
      } else {
        throw new Error(data.error || 'Google login failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    if (!state.accessToken) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.accessToken}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({
          type: 'UPDATE_USER',
          payload: data.data.user,
        });
      } else {
        throw new Error(data.error || 'Profile update failed');
      }
    } catch (error) {
      throw error;
    }
  };

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}