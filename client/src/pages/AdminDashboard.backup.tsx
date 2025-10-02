import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  Users, 
  MapPin, 
  Star, 
  TrendingUp,
  Eye,
  MessageSquare,
  Shield,
  Database,
  Settings,
  Activity,
  Plus,
  Filter,
  Search
} from 'lucide-react';

interface DashboardStats {
  totalTemples: number;
  totalUsers: number;
  totalReviews: number;
  averageRating: number;
  monthlyGrowth: {
    temples: number;
    users: number;
    reviews: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'temple_added' | 'user_registered' | 'review_posted';
    description: string;
    timestamp: string;
  }>;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Mock data for demo purposes
  return {
    totalTemples: 1250,
    totalUsers: 45670,
    totalReviews: 8920,
    averageRating: 4.6,
    monthlyGrowth: {
      temples: 12,
      users: 25,
      reviews: 18
    },
    recentActivity: [
      {
        id: '1',
        type: 'temple_added',
        description: 'New temple "Sacred Heart Temple" added to Mumbai',
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        type: 'user_registered',
        description: 'New user "John Doe" registered',
        timestamp: '4 hours ago'
      },
      {
        id: '3',
        type: 'review_posted',
        description: 'New review posted for "Golden Temple"',
        timestamp: '6 hours ago'
      }
    ]
  };
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

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
      title: 'Average Rating',
      value: stats?.averageRating || 0,
      change: 0.2,
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      suffix: '/5'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-accent/5 rounded-full blur-xl animate-float"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center animate-fadeInUp">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text   mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg md:text-xl text-text/80 max-w-2xl mx-auto">
            Manage temples, users, and platform analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-text">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        {stat.suffix}
                      </div>
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{stat.change}% this month
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-text/80 group-hover:text-text transition-colors duration-300">
                    {stat.title}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="temples" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <MapPin className="h-4 w-4 mr-2" />
              Temples
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-text text-sm">{activity.description}</p>
                          <p className="text-text/60 text-xs">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Database className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <Button className="justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Temple
                    </Button>
                    <Button className="justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      Review Pending Submissions
                    </Button>
                    <Button className="justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Moderate Reviews
                    </Button>
                    <Button className="justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Placeholder */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Analytics Overview</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-text/70 text-lg">Charts and analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temples" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-primary">Temple Management</CardTitle>
                    <CardDescription>Manage temples and their information</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Temple
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/60 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search temples..."
                      className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg focus:border-primary focus:bg-white transition-all duration-300"
                    />
                  </div>
                  <Button variant="outline" className="bg-white/80 border-primary/20 hover:bg-white hover:border-primary">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Temple Table Placeholder */}
                <div className="bg-secondary/5 rounded-lg p-8 text-center">
                  <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-text/70 text-lg">Temple management interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/5 rounded-lg p-8 text-center">
                  <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-text/70 text-lg">User management interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Review Moderation</CardTitle>
                <CardDescription>Monitor and moderate user reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/5 rounded-lg p-8 text-center">
                  <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-text/70 text-lg">Review moderation interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/5 rounded-lg p-8 text-center">
                  <Settings className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-text/70 text-lg">Settings interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}