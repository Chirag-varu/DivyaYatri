import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';

declare global {
  interface Window {
    google: any;
    googleOneTapCallback: (response: any) => void;
  }
}

interface GoogleOAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  text = 'signin_with',
  size = 'medium',
  fullWidth = true,
  className = '',
}) => {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity script
    const loadGoogleScript = () => {
      if (window.google) {
        setIsGoogleLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          setIsGoogleLoaded(true);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity script');
        onError?.('Failed to load Google authentication');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleScript();

    return () => {
      // Cleanup: remove script if component unmounts
      const scripts = document.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]');
      scripts.forEach(script => script.remove());
    };
  }, [onError]);

  useEffect(() => {
    if (!isGoogleLoaded || !window.google) return;

    try {
      // Initialize Google One Tap
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the Google Sign-In button with responsive settings
      const buttonElement = document.getElementById('google-signin-button');
      if (buttonElement) {
        // Get responsive button size based on screen width
        const screenWidth = window.innerWidth;
        let buttonSize = size;
        const buttonWidth = fullWidth ? '100%' : 'auto';
        
        // Auto-adjust size for mobile devices
        if (screenWidth < 480) {
          buttonSize = 'medium';
        } else if (screenWidth < 768) {
          buttonSize = size === 'small' ? 'small' : 'medium';
        }
        
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: buttonSize,
          text: text,
          width: buttonWidth,
          logo_alignment: 'left',
          shape: 'rectangular',
        });
      }

      // Set up One Tap prompt for returning users (disabled on mobile for better UX)
      if (text === 'signin_with' && window.innerWidth >= 768) {
        window.google.accounts.id.prompt();
      }
    } catch (error) {
      console.error('Google OAuth initialization error:', error);
      onError?.('Failed to initialize Google authentication');
    }
  }, [isGoogleLoaded, text]);

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      onError?.('No credential received from Google');
      return;
    }

    setIsLoading(true);

    try {
      await loginWithGoogle(response.credential);
      
      toast({
        title: 'Success',
        description: 'Successfully signed in with Google',
        type: 'success',
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Google login error:', error);
      
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Failed to sign in with Google',
        type: 'error',
      });

      onError?.(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSignIn = () => {
    if (!window.google || !isGoogleLoaded) {
      onError?.('Google authentication not available');
      return;
    }

    setIsLoading(true);

    try {
      // Trigger Google Sign-In flow
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Manual Google sign-in error:', error);
      onError?.('Failed to start Google sign-in');
      setIsLoading(false);
    }
  };

  if (!isGoogleLoaded) {
    return (
      <div className={`w-full h-12 sm:h-14 md:h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 text-xs sm:text-sm md:text-base">Loading Google Sign-In...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-sm mx-auto sm:max-w-md md:max-w-lg ${className}`}>
      {/* Google Sign-In Button Container */}
      <div 
        id="google-signin-button" 
        className={`w-full transition-all duration-200 ${disabled || isLoading ? 'opacity-50 pointer-events-none' : 'hover:shadow-md'}`}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="relative">
          <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
            <div className="flex items-center space-x-2 px-4">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-600 text-xs sm:text-sm md:text-base font-medium">Signing in...</span>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Manual Button */}
      <div className="mt-3 sm:mt-4">
        <button
          type="button"
          onClick={handleManualSignIn}
          disabled={disabled || isLoading || !isGoogleLoaded}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm md:text-base text-gray-600 hover:text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="hidden sm:inline">Having trouble? Click here to sign in with Google</span>
          <span className="sm:hidden">Trouble signing in?</span>
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 text-center leading-relaxed px-2">
        <span className="block sm:inline">By signing in with Google, you agree to our{' '}</span>
        <button className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
          Terms of Service
        </button>
        <span className="hidden sm:inline">{' '}and{' '}</span>
        <span className="block sm:inline mt-1 sm:mt-0">
          <span className="sm:hidden">and{' '}</span>
          <button className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
            Privacy Policy
          </button>
        </span>
      </div>
    </div>
  );
};

// Enhanced Google OAuth Hook
export const useGoogleAuth = () => {
  // const { loginWithGoogle } = useAuth();
  // const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async (): Promise<void> => {
    if (!window.google) {
      throw new Error('Google authentication not available');
    }

    setIsLoading(true);

    try {
      // You can also implement a promise-based approach here
      window.google.accounts.id.prompt();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signInWithPopup = async (): Promise<void> => {
    // Alternative implementation using Google Sign-In popup
    // This would require additional Google API setup
    throw new Error('Popup sign-in not implemented yet');
  };

  return {
    signInWithGoogle,
    signInWithPopup,
    isLoading,
  };
};

// Responsive Mobile-First Google OAuth Button
export const MobileGoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = (props) => (
  <GoogleOAuthButton 
    {...props} 
    size="medium"
    className="sm:hidden" // Only show on mobile
  />
);

// Responsive Desktop Google OAuth Button  
export const DesktopGoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = (props) => (
  <GoogleOAuthButton 
    {...props} 
    size="large"
    className="hidden sm:block" // Hide on mobile
  />
);

// Responsive Container Component
interface ResponsiveGoogleOAuthProps extends GoogleOAuthButtonProps {
  containerClassName?: string;
}

export const ResponsiveGoogleOAuth: React.FC<ResponsiveGoogleOAuthProps> = ({
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={`w-full space-y-0 ${containerClassName}`}>
      {/* Mobile Version */}
      <div className="block sm:hidden">
        <GoogleOAuthButton 
          {...props} 
          size="medium"
          className="w-full"
        />
      </div>
      
      {/* Tablet and Desktop Version */}
      <div className="hidden sm:block">
        <GoogleOAuthButton 
          {...props} 
          size="large"
          className="w-full max-w-md mx-auto"
        />
      </div>
    </div>
  );
};

// Utility hook for responsive Google OAuth
export const useResponsiveGoogleOAuth = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    getOptimalSize: () => {
      if (isMobile) return 'medium';
      if (isTablet) return 'large';
      return 'large';
    },
    getOptimalWidth: () => {
      if (isMobile) return '100%';
      if (isTablet) return 'auto';
      return 'auto';
    }
  };
};

export default GoogleOAuthButton;