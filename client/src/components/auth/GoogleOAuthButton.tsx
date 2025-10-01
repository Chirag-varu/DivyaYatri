import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface GoogleOAuthButtonProps {
  onSuccess: (userData: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  text?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleOAuthButton({ 
  onSuccess, 
  onError, 
  disabled = false,
  text = 'Continue with Google'
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!window.google) {
      onError('Google Sign-In is not available. Please check your internet connection.');
      return;
    }

    setIsLoading(true);

    try {
      // Initialize Google Sign-In if not already done
      await new Promise<void>((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            handleCredentialResponse(response);
            resolve();
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Check if Google client ID is configured
        if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
          reject(new Error('Google Client ID not configured'));
          return;
        }

        // Prompt the user to sign in
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to the popup flow
            window.google.accounts.oauth2.initTokenClient({
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              scope: 'email profile',
              callback: async (response: any) => {
                if (response.access_token) {
                  await fetchUserProfile(response.access_token);
                  resolve();
                } else {
                  reject(new Error('Failed to get access token'));
                }
              },
            }).requestAccessToken();
          }
        });
      });
    } catch (error) {
      console.error('Google Sign-In error:', error);
      onError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Decode the JWT token to get user info
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));

      const userData = {
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        avatar: payload.picture,
      };

      onSuccess(userData);
    } catch (error) {
      console.error('Error processing Google credential:', error);
      onError('Failed to process Google sign-in. Please try again.');
    }
  };

  const fetchUserProfile = async (accessToken: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();

      const userData = {
        googleId: profile.id,
        email: profile.email,
        firstName: profile.given_name,
        lastName: profile.family_name,
        avatar: profile.picture,
      };

      onSuccess(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      onError('Failed to get user information from Google.');
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-gray-300 hover:bg-gray-50"
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {text}
        </>
      )}
    </Button>
  );
}