import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'user' | 'admin' | 'temple_admin';
  requireEmailVerification?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  requireEmailVerification = false,
  redirectTo = '/login',
  fallback,
}) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    isEmailVerified,
    requiresEmailVerification,
    checkAuthStatus,
  } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);

  // Validate authentication status on route change
  useEffect(() => {
    const validateAuth = async () => {
      if (requireAuth && isAuthenticated) {
        try {
          await checkAuthStatus();
        } catch (error) {
          console.error('Auth validation failed:', error);
        }
      }
      setIsValidating(false);
    };

    validateAuth();
  }, [location.pathname, requireAuth, isAuthenticated, checkAuthStatus]);

  // Show loading while validating
  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Verifying Authentication</h2>
          <p className="text-gray-600">Please wait while we verify your access...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname, message: 'Please sign in to continue' }}
        replace
      />
    );
  }

  // Check email verification requirement
  if (requireAuth && requireEmailVerification && !isEmailVerified) {
    if (requiresEmailVerification) {
      return (
        <Navigate
          to="/verify-email"
          state={{ 
            from: location.pathname, 
            message: 'Please verify your email to continue',
            email: user?.email 
          }}
          replace
        />
      );
    }

    // Show email verification required message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email Verification Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to verify your email address to access this page.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/verify-email'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verify Email
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requireAuth && requiredRole && user?.role !== requiredRole) {
    // Check if user has sufficient privileges (admin can access all)
    const hasAccess = user?.role === 'admin' || 
      (requiredRole === 'temple_admin' && ['admin', 'temple_admin'].includes(user?.role || ''));

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636 5.636 18.364"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. Required role: {requiredRole}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Show fallback component if provided
  if (fallback && (!requireAuth || !isAuthenticated)) {
    return <>{fallback}</>;
  }

  // Render protected content
  return <>{children}</>;
};

// Higher-order component for role-based protection
export const withRoleProtection = (
  Component: React.ComponentType<any>,
  requiredRole: 'user' | 'admin' | 'temple_admin'
) => {
  return (props: any) => (
    <ProtectedRoute requiredRole={requiredRole} requireEmailVerification>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role-based components
export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin" requireEmailVerification>
    {children}
  </ProtectedRoute>
);

export const TempleAdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="temple_admin" requireEmailVerification>
    {children}
  </ProtectedRoute>
);

export const EmailVerifiedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireEmailVerification>
    {children}
  </ProtectedRoute>
);

// Route guard hook for programmatic access control
export const useRouteGuard = () => {
  const { isAuthenticated, user, isEmailVerified } = useAuth();

  const canAccess = (
    requiredRole?: 'user' | 'admin' | 'temple_admin',
    requireEmailVerification = false
  ): boolean => {
    // Check authentication
    if (!isAuthenticated) return false;

    // Check email verification
    if (requireEmailVerification && !isEmailVerified) return false;

    // Check role
    if (requiredRole) {
      if (user?.role === 'admin') return true; // Admin can access everything
      if (requiredRole === 'temple_admin' && ['admin', 'temple_admin'].includes(user?.role || '')) {
        return true;
      }
      return user?.role === requiredRole;
    }

    return true;
  };

  const requireAuth = (): boolean => isAuthenticated;
  const requireRole = (role: 'user' | 'admin' | 'temple_admin'): boolean => canAccess(role);
  const requireEmailVerification = (): boolean => isEmailVerified;

  return {
    canAccess,
    requireAuth,
    requireRole,
    requireEmailVerification,
    isAuthenticated,
    isEmailVerified,
    userRole: user?.role,
  };
};

export default ProtectedRoute;