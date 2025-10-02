import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  User, 
  Shield
} from 'lucide-react';

interface Temple {
  _id: string;
  name: string;
  description: string;
  location: {
    city: string;
    state: string;
  };
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
}

interface Visit {
  _id: string;
  temple: Temple;
  visitDate: string;
  status: 'planned' | 'completed' | 'cancelled';
  notes?: string;
  rating?: number;
  review?: string;
}



export default function ProfilePage() {
  const { user, updateProfile, isAuthenticated } = useAuth();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    bio: '',
    location: '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);





  // Fetch user's favorite temples
  /* 
  // Fetch user's favorite temples
  const { data: favoriteTemples = [] } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/favorites`);
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching favorites:', error);
        return mockFavoriteTemples;
      }
    },
    enabled: !!user,
  });

  // Fetch user's visit history
  const { data: visitHistory = [] } = useQuery({
    queryKey: [
      'user-visits',
      user?.id
    ],
    queryFn: async () => {
      if (!user || !('_id' in user)) return [];
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/visits`);
        if (!response.ok) throw new Error('Failed to fetch visits');
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching visits:', error);
        return mockVisitHistory;
      }
    },
    enabled: !!user,
  });
  */

  // Mock data for development
  const mockFavoriteTemples: Temple[] = [
    {
      _id: '1',
      name: 'Golden Temple',
      description: 'The most sacred Sikh shrine',
      location: { city: 'Amritsar', state: 'Punjab' },
      images: ['/api/placeholder/300/200'],
      rating: 4.8,
      reviewCount: 1250,
      category: 'sikh'
    },
    {
      _id: '2',
      name: 'Meenakshi Temple',
      description: 'Ancient temple with magnificent gopurams',
      location: { city: 'Madurai', state: 'Tamil Nadu' },
      images: ['/api/placeholder/300/200'],
      rating: 4.7,
      reviewCount: 890,
      category: 'hindu'
    }
  ];

  const mockVisitHistory: Visit[] = [
    {
      _id: '1',
      temple: mockFavoriteTemples[0],
      visitDate: '2024-09-15',
      status: 'completed',
      notes: 'Beautiful experience during evening prayers',
      rating: 5,
      review: 'Absolutely divine experience!'
    },
    {
      _id: '2',
      temple: mockFavoriteTemples[1],
      visitDate: '2024-10-05',
      status: 'planned',
      notes: 'Planning to visit during Diwali'
    }
  ];

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
      });
    }
  }, [user]);



  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (profileData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsUpdatingProfile(true);
    setProfileErrors({});

    try {
      await updateProfile({
        name: profileData.name.trim(),
        phone: profileData.phone || undefined,
      });
      
      toast.success({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
      
      toast.error({
        title: 'Update failed',
        description: errorMessage,
      });
      
      setProfileErrors({
        general: errorMessage,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({});

    try {
      // Call change password API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success({
          title: 'Password changed',
          description: 'Your password has been updated successfully.',
        });
        
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password. Please try again.';
      
      toast.error({
        title: 'Password change failed',
        description: errorMessage,
      });
      
      setPasswordErrors({
        general: errorMessage,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">Authentication Required</h2>
          <p className="text-text/70 mb-8">Please log in to view your profile.</p>
          <Button className="  from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-accent/5 rounded-full blur-xl animate-float"></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="mb-12 text-center animate-fadeInUp">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold   from-primary to-secondary bg-clip-text   mb-4">
            My Profile
          </h1>
          <p className="text-lg md:text-xl text-text/80 max-w-2xl mx-auto">
            Manage your account settings and preferences
          </p>
        </div>



        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="profile" className="flex items-center space-x-2 data-[state=active]:  data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <User className="h-4 w-4" />
              <span>Profile Information</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2 data-[state=active]:  data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="  from-primary/5 to-secondary/5">
                <CardTitle className="text-2xl font-bold   from-primary to-secondary bg-clip-text  ">Personal Information</CardTitle>
                <CardDescription className="text-text/70 text-base">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {profileErrors.general && (
                    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-6 py-4 rounded-xl text-sm animate-fadeInUp">
                      {profileErrors.general}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-semibold text-text">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={profileData.name}
                        onChange={handleProfileInputChange}
                        className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 ${
                          profileErrors.name ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                        }`}
                      />
                      {profileErrors.name && (
                        <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{profileErrors.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-text">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-secondary/10 border-2 border-secondary/20 text-text/70"
                    />
                    <p className="text-xs text-text/60 bg-secondary/5 px-3 py-1 rounded-lg inline-block">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-text">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleProfileInputChange}
                      className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 ${
                        profileErrors.phone ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {profileErrors.phone && (
                      <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{profileErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text">Role</label>
                    <div className="  from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-lg px-4 py-3">
                      <span className="text-primary font-semibold">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full md:w-auto   from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="  from-primary/5 to-secondary/5">
                <CardTitle className="text-2xl font-bold   from-primary to-secondary bg-clip-text  ">Change Password</CardTitle>
                <CardDescription className="text-text/70 text-base">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {passwordErrors.general && (
                    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-6 py-4 rounded-xl text-sm animate-fadeInUp">
                      {passwordErrors.general}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-semibold text-text">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 pr-12 ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-semibold text-text">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 pr-12 ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-text">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        className={`bg-white/50 backdrop-blur-sm border-2 transition-all duration-300 focus:bg-white focus:scale-105 pr-12 ${
                          passwordErrors.confirmPassword ? 'border-red-500' : 'border-primary/20 focus:border-primary'
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-text/60 hover:text-text transition-colors" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 animate-fadeInUp">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full md:w-auto   from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
