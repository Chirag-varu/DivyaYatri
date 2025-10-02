import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      toast.success({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      // Navigation will happen via useEffect when isAuthenticated changes
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';

      toast.error({
        title: 'Sign in failed',
        description: errorMessage,
      });

      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (userData: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }) => {
    try {
      // Pass the complete user data to loginWithGoogle
      await loginWithGoogle({
        googleId: userData.googleId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar
      });
      toast.success({
        title: 'Welcome!',
        description: 'You have successfully signed in with Google.',
      });
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed. Please try again.';

      toast.error({
        title: 'Google sign in failed',
        description: errorMessage,
      });
    }
  };

  const handleGoogleError = (error: string) => {
    console.error('Google OAuth error:', error);
    toast.error({
      title: 'Google sign in failed',
      description: error,
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail) {
      toast.error({
        title: 'Email required',
        description: 'Please enter your email address to reset your password.',
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      toast.error({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    setIsSendingReset(true);

    try {
      // Here you would normally call your password reset API
      // For now, we'll simulate the request
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success({
        title: 'Password reset sent!',
        description: 'Check your email for password reset instructions.',
      });

      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error({
        title: 'Reset failed',
        description: 'Unable to send password reset email. Please try again.',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-accent/5 rounded-full blur-xl animate-float"></div>
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 relative z-10 text-black">
        <CardHeader className="space-y-1   from-primary/5 to-secondary/5 rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center   from-primary to-secondary bg-clip-text">
            {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center text-black/70 text-base">
            {showForgotPassword
              ? 'Enter your email to receive reset instructions'
              : 'Sign in to continue your spiritual journey'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="resetEmail" className="text-sm font-semibold text-black/80">
                  Email Address
                </label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary transition-all duration-300 focus:bg-white focus:scale-105 text-black"
                  placeholder="your.email@example.com"
                />
              </div>

              <Button
                type="submit"
                className="w-full   from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black font-semibold py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                disabled={isSendingReset}
              >
                {isSendingReset ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                  }}
                  className="text-sm text-primary hover:text-secondary transition-colors duration-300 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-fadeInUp">
                  {errors.general}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-black/80">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 text-black ${errors.email ? 'border-red-500' : 'border-primary/20 focus:border-primary hover:border-2 hover:border-black focus:border-black'}`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-black/80">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 pr-12 text-black ${errors.password ? 'border-red-500' : 'border-primary/20 focus:border-primary hover:border-2 hover:border-black'}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-black/60 hover:text-black transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-black/60 hover:text-black transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{errors.password}</p>
                )}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:text-secondary transition-colors duration-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-semibold py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-black"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-black/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 px-3 py-1 text-black/60 rounded-full backdrop-blur-sm">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google OAuth */}
              <GoogleOAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={isSubmitting}
              />

              {/* Sign Up */}
              <div className="text-center">
                <p className="text-black/70">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-primary hover:text-secondary transition-colors duration-300 hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}