import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/EnhancedAuthContext';
import { useToast } from '../hooks/useToast';

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
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  text = 'signin_with',
}) => {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
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
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the Google Sign-In button
      const buttonElement = document.getElementById('google-signin-button');
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          text: text,
          width: '100%',
          logo_alignment: 'left',
        });
      }

      // Set up One Tap prompt for returning users
      if (text === 'signin_with') {
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
      
      showToast({
        title: 'Success',
        description: 'Successfully signed in with Google',
        type: 'success',
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Google login error:', error);
      
      showToast({
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
      <div className="w-full h-12 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 text-sm">Loading Google Sign-In...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Google Sign-In Button Container */}
      <div 
        id="google-signin-button" 
        className={`w-full ${disabled || isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="relative">
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-600 text-sm font-medium">Signing in...</span>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Manual Button */}
      <div className="mt-2">
        <button
          type="button"
          onClick={handleManualSignIn}
          disabled={disabled || isLoading || !isGoogleLoaded}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Having trouble? Click here to sign in with Google
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        By signing in with Google, you agree to our{' '}
        <button className="text-blue-600 hover:text-blue-800 underline">
          Terms of Service
        </button>{' '}
        and{' '}
        <button className="text-blue-600 hover:text-blue-800 underline">
          Privacy Policy
        </button>
      </div>
    </div>
  );
};

// Enhanced Google OAuth Hook
export const useGoogleAuth = () => {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
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

export default GoogleOAuthButton;