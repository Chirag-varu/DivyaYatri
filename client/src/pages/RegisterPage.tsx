import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters long';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    // Clear confirm password error if passwords now match
    if (name === 'password' && errors.confirmPassword && value === formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: '',
      }));
    }
    if (name === 'confirmPassword' && errors.confirmPassword && value === formData.password) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: '',
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
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      });
      
      toast.success({
        title: 'Account created successfully!',
        description: 'Welcome to DivyaYatri. You are now signed in.',
      });
      // Navigation will happen via useEffect when isAuthenticated changes
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      
      toast.error({
        title: 'Registration failed',
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
      await loginWithGoogle(userData);
      toast.success({
        title: 'Welcome to DivyaYatri!',
        description: 'You have successfully signed up with Google.',
      });
    } catch (error) {
      console.error('Google registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google sign up failed. Please try again.';
      
      toast.error({
        title: 'Google sign up failed',
        description: errorMessage,
      });
    }
  };

  const handleGoogleError = (error: string) => {
    console.error('Google OAuth error:', error);
    toast.error({
      title: 'Google sign up failed',
      description: error,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-accent/5 rounded-full blur-xl animate-float"></div>
      </div>

      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 relative z-10">
        <CardHeader className="space-y-1 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text  ">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-text/70 text-base">
            Join DivyaYatri to discover sacred temples
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-fadeInUp">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-semibold text-text">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 ${
                    errors.firstName ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-semibold text-text">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 ${
                    errors.lastName ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-text">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 ${
                  errors.email ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                }`}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-text">
                Phone Number <span className="text-text/50 font-normal">(optional)</span>
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 ${
                  errors.phone ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-text">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 pr-12 ${
                    errors.password ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-text">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 pr-12 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-text/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 px-3 py-1 text-text/60 rounded-full backdrop-blur-sm">
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleOAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={isSubmitting}
              text="Sign up with Google"
            />

            <div className="text-center">
              <p className="text-text/70">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:text-secondary transition-colors duration-300 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
