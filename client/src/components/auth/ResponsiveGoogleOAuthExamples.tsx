import React from 'react';
import { 
  GoogleOAuthButton, 
  ResponsiveGoogleOAuth, 
  MobileGoogleOAuthButton, 
  DesktopGoogleOAuthButton,
  useResponsiveGoogleOAuth 
} from './EnhancedGoogleOAuthButton';

/**
 * Example usage of responsive Google OAuth button in different scenarios
 */

// Example 1: Auto-responsive button (recommended)
export const LoginFormExample: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Sign In</h2>
      
      {/* Auto-responsive Google OAuth button */}
      <ResponsiveGoogleOAuth
        text="signin_with"
        onSuccess={() => console.log('Login successful!')}
        onError={(error) => console.error('Login failed:', error)}
        containerClassName="mb-4"
      />
      
      <div className="text-center text-gray-500 text-sm">
        Or continue with email
      </div>
    </div>
  );
};

// Example 2: Manual responsive control
export const SignupFormExample: React.FC = () => {
  const { isMobile, getOptimalSize } = useResponsiveGoogleOAuth();
  
  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8">
          Create Account
        </h1>
        
        {/* Custom responsive implementation */}
        <div className="mb-6">
          <GoogleOAuthButton
            text="signup_with"
            size={getOptimalSize()}
            fullWidth={isMobile}
            onSuccess={() => console.log('Signup successful!')}
            onError={(error) => console.error('Signup failed:', error)}
            className={`
              transition-all duration-300 
              ${isMobile 
                ? 'w-full mb-4' 
                : 'max-w-sm mx-auto hover:scale-105'
              }
            `}
          />
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
            </div>
          </div>
          
          {/* Email form would go here */}
        </div>
      </div>
    </div>
  );
};

// Example 3: Split mobile/desktop buttons
export const SplitLayoutExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              DivyaYatri
            </h1>
            <p className="text-gray-600">Your spiritual journey begins here</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl mx-4">
            <MobileGoogleOAuthButton
              text="continue_with"
              onSuccess={() => console.log('Mobile login successful!')}
              onError={(error) => console.error('Mobile login failed:', error)}
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                DivyaYatri
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover sacred temples, plan your spiritual journey, 
                and connect with the divine. Your path to enlightenment starts here.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl">
              <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
                Begin Your Journey
              </h2>
              
              <DesktopGoogleOAuthButton
                text="continue_with"
                onSuccess={() => console.log('Desktop login successful!')}
                onError={(error) => console.error('Desktop login failed:', error)}
              />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

// Example 4: Responsive card layout
export const CardLayoutExample: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      
      {/* Sign In Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Sign In</h3>
          <p className="text-gray-600 text-sm">Access your account</p>
        </div>
        
        <GoogleOAuthButton
          text="signin_with"
          size="medium"
          fullWidth
          className="mb-4"
          onSuccess={() => console.log('Card sign in successful!')}
        />
      </div>

      {/* Sign Up Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
          <p className="text-gray-600 text-sm">Create new account</p>
        </div>
        
        <GoogleOAuthButton
          text="signup_with"
          size="medium"
          fullWidth
          className="mb-4"
          onSuccess={() => console.log('Card sign up successful!')}
        />
      </div>

      {/* Continue Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h10a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Continue</h3>
          <p className="text-gray-600 text-sm">Quick access</p>
        </div>
        
        <GoogleOAuthButton
          text="continue_with"
          size="medium"
          fullWidth
          className="mb-4"
          onSuccess={() => console.log('Card continue successful!')}
        />
      </div>
      
    </div>
  );
};

export default {
  LoginFormExample,
  SignupFormExample,
  SplitLayoutExample,
  CardLayoutExample
};