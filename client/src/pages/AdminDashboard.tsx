import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 

  Users, 
  MapPin, 
  Star, 
  TrendingUp,
  Eye,
  MessageSquare,



  Activity,
  Plus,


  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Download,

  Bell,

  Ban
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';

interface DashboardStats {
  totalTemples: number;
  totalUsers: number;
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  flaggedContent: number;
  totalBookings: number;
  monthlyRevenue: number;
  monthlyGrowth: {
    temples: number;
    users: number;
    reviews: number;
    bookings: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'temple_added' | 'user_registered' | 'review_posted' | 'booking_made' | 'content_flagged';
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }>;
}

interface Temple {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  status: 'active' | 'pending' | 'suspended';
  addedDate: string;
  lastUpdated: string;
  images: string[];
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'suspended' | 'banned';
  reviewsCount: number;
  lastActivity: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
}

interface Review {
  id: string;
  templeName: string;
  userName: string;
  userEmail: string;
  rating: number;
  content: string;
  date: string;
  status: 'approved' | 'pending' | 'flagged' | 'rejected';
  flags: number;
  images: string[];
}

interface Booking {
  id: string;
  templeName: string;
  userName: string;
  userEmail: string;
  date: string;
  timeSlot: string;
  visitors: number;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'failed';
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Mock data - replace with actual API calls
  return {
    totalTemples: 1250,
    totalUsers: 45670,
    totalReviews: 8920,
    averageRating: 4.6,
    pendingReviews: 45,
    flaggedContent: 12,
    totalBookings: 3245,
    monthlyRevenue: 125000,
    monthlyGrowth: {
      temples: 12,
      users: 25,
      reviews: 18,
      bookings: 32
    },
    recentActivity: [
      {
        id: '1',
        type: 'temple_added',
        description: 'New temple "Shri Ganesh Mandir" added by Admin',
        timestamp: '2 hours ago',
        status: 'success'
      },
      {
        id: '2',
        type: 'user_registered',
        description: '5 new users registered today',
        timestamp: '4 hours ago',
        status: 'success'
      },
      {
        id: '3',
        type: 'content_flagged',
        description: 'Review flagged for inappropriate content',
        timestamp: '6 hours ago',
        status: 'warning'
      },
      {
        id: '4',
        type: 'booking_made',
        description: '15 new bookings today',
        timestamp: '8 hours ago',
        status: 'success'
      }
    ]
  };
};

const fetchTemples = async (): Promise<Temple[]> => {
  return [
    {
      id: '1',
      name: 'Shri Ganesh Mandir',
      location: 'Mumbai, Maharashtra',
      rating: 4.8,
      reviews: 245,
      status: 'active',
      addedDate: '2024-01-10',
      lastUpdated: '2024-01-15',
      images: ['temple1.jpg', 'temple2.jpg'],
      description: 'Ancient temple dedicated to Lord Ganesha'
    },
    {
      id: '2',
      name: 'Kashi Vishwanath Temple',
      location: 'Varanasi, Uttar Pradesh',
      rating: 4.9,
      reviews: 892,
      status: 'active',
      addedDate: '2024-01-05',
      lastUpdated: '2024-01-14',
      images: ['temple3.jpg'],
      description: 'Famous temple of Lord Shiva'
    },
    {
      id: '3',
      name: 'Pending Temple',
      location: 'Delhi, India',
      rating: 0,
      reviews: 0,
      status: 'pending',
      addedDate: '2024-01-16',
      lastUpdated: '2024-01-16',
      images: [],
      description: 'New temple submission pending review'
    }
  ];
};

const fetchUsers = async (): Promise<User[]> => {
  return [
    {
      id: '1',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      joinDate: '2024-01-10',
      status: 'active',
      reviewsCount: 15,
      lastActivity: '2024-01-15T10:30:00Z',
      role: 'user'
    },
    {
      id: '2',
      name: 'Priya Patel',
      email: 'priya@example.com',
      joinDate: '2024-01-08',
      status: 'active',
      reviewsCount: 8,
      lastActivity: '2024-01-14T15:20:00Z',
      role: 'user'
    },
    {
      id: '3',
      name: 'Suspended User',
      email: 'suspended@example.com',
      joinDate: '2024-01-01',
      status: 'suspended',
      reviewsCount: 2,
      lastActivity: '2024-01-10T09:00:00Z',
      role: 'user'
    }
  ];
};

const fetchReviews = async (): Promise<Review[]> => {
  return [
    {
      id: '1',
      templeName: 'Shri Ganesh Mandir',
      userName: 'Rahul Sharma',
      userEmail: 'rahul@example.com',
      rating: 5,
      content: 'Amazing spiritual experience. Highly recommended!',
      date: '2024-01-15',
      status: 'approved',
      flags: 0,
      images: []
    },
    {
      id: '2',
      templeName: 'Golden Temple',
      userName: 'Anonymous User',
      userEmail: 'anon@example.com',
      rating: 1,
      content: 'Inappropriate content that needs review...',
      date: '2024-01-14',
      status: 'flagged',
      flags: 3,
      images: []
    },
    {
      id: '3',
      templeName: 'Kashi Vishwanath Temple',
      userName: 'Priya Patel',
      userEmail: 'priya@example.com',
      rating: 4,
      content: 'Great experience, but very crowded during festival season.',
      date: '2024-01-13',
      status: 'pending',
      flags: 0,
      images: ['review1.jpg']
    }
  ];
};

const fetchBookings = async (): Promise<Booking[]> => {
  return [
    {
      id: '1',
      templeName: 'Shri Ganesh Mandir',
      userName: 'Rahul Sharma',
      userEmail: 'rahul@example.com',
      date: '2024-01-20',
      timeSlot: '10:00 AM - 11:00 AM',
      visitors: 4,
      amount: 500,
      status: 'confirmed',
      paymentStatus: 'paid'
    },
    {
      id: '2',
      templeName: 'Golden Temple',
      userName: 'Priya Patel',
      userEmail: 'priya@example.com',
      date: '2024-01-18',
      timeSlot: '06:00 AM - 07:00 AM',
      visitors: 2,
      amount: 200,
      status: 'pending',
      paymentStatus: 'pending'
    }
  ];
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: temples = [] } = useQuery({
    queryKey: ['admin-temples'],
    queryFn: fetchTemples,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: fetchReviews,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: fetchBookings,
  });

  const handleApproveTemple = async (templeId: string) => {
    try {
      // API call to approve temple
      toast.success({
        title: "Temple Approved",
        description: "The temple has been approved and is now live.",
      });
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to approve temple. Please try again.",
      });
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      // API call to suspend user
      toast.success({
        title: "User Suspended",
        description: "The user has been suspended.",
      });
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to suspend user. Please try again.",
      });
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      // API call to approve review
      toast({
        title: "Review Approved",
        description: "The review has been approved and is now visible.",
      });
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to approve review. Please try again.",
      });
    }
  };

  const statCards = [
    {
      title: 'Total Temples',
      value: stats?.totalTemples || 0,
      change: stats?.monthlyGrowth.temples || 0,
      icon: MapPin,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.monthlyGrowth.users || 0,
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Reviews',
      value: stats?.totalReviews || 0,
      change: stats?.monthlyGrowth.reviews || 0,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(stats?.monthlyRevenue || 0).toLocaleString()}`,
      change: stats?.monthlyGrowth.bookings || 0,
      icon: Calendar,
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'confirmed':
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'suspended':
      case 'flagged':
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      case 'banned':
      case 'rejected':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-primary/10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text  ">
                Admin Dashboard
              </h1>
              <p className="text-text/70 mt-1">Welcome back, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-text">
                        {stat.value}
                      </div>
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{stat.change}%
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-text/80 mt-4">{stat.title}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="temples">Temples ({temples.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-text text-sm">{activity.description}</p>
                          <p className="text-text/60 text-xs">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Bell className="h-5 w-5" />
                    Pending Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Pending Reviews</p>
                        <p className="text-xs text-text/60">{stats?.pendingReviews || 0} reviews awaiting approval</p>
                      </div>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Flagged Content</p>
                        <p className="text-xs text-text/60">{stats?.flaggedContent || 0} items need attention</p>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="temples" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary">Temple Management</CardTitle>
                  <Button className="bg-gradient-to-r from-primary to-secondary text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Temple
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {temples.map((temple) => (
                    <div key={temple.id} className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text">{temple.name}</h3>
                        <p className="text-sm text-text/60">{temple.location}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {temple.rating || 'N/A'}
                          </span>
                          <span className="text-sm text-text/60">{temple.reviews} reviews</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(temple.status)}`}>
                            {temple.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {temple.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveTemple(temple.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text">{user.name}</h3>
                        <p className="text-sm text-text/60">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-text/60">Joined: {new Date(user.joinDate).toLocaleDateString()}</span>
                          <span className="text-sm text-text/60">{user.reviewsCount} reviews</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Review Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-secondary/5 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-text">{review.templeName}</h3>
                          <p className="text-sm text-text/60">by {review.userName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {review.rating}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(review.status)}`}>
                            {review.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-text/80 mb-3">{review.content}</p>
                      {review.flags > 0 && (
                        <div className="flex items-center gap-2 mb-3 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">{review.flags} flags</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {review.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveReview(review.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {review.status === 'flagged' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveReview(review.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text">{booking.templeName}</h3>
                        <p className="text-sm text-text/60">by {booking.userName}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-text/60">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {booking.date} at {booking.timeSlot}
                          </span>
                          <span className="text-sm text-text/60">{booking.visitors} visitors</span>
                          <span className="text-sm font-medium">₹{booking.amount}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}