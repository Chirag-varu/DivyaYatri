import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  Users, 
  Heart,
  Navigation,
  Camera,
  Clock,
  ArrowRight,
  CheckCircle
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

const fetchFeaturedTemples = async (): Promise<Temple[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/temples?limit=6&featured=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch temples');
    }
    const data = await response.json();
    return data.data.temples || [];
  } catch (error) {
    console.error('Error fetching featured temples:', error);
    return [];
  }
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: featuredTemples = [] } = useQuery({
    queryKey: ['featured-temples'],
    queryFn: fetchFeaturedTemples,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/temples?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/temples');
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Find Nearby Temples',
      description: 'Discover temples around you with our location-based search and detailed directions.',
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      description: 'Read authentic reviews from fellow devotees and share your own spiritual experiences.',
    },
    {
      icon: TrendingUp,
      title: 'Popular Destinations',
      description: 'Explore trending temples and discover new spiritual destinations across India.',
    },
    {
      icon: Camera,
      title: 'Rich Media Gallery',
      description: 'View high-quality photos and virtual tours of temples before your visit.',
    },
    {
      icon: Clock,
      title: 'Updated Information',
      description: 'Get current timings, festivals, and special events happening at temples.',
    },
    {
      icon: Navigation,
      title: 'Easy Navigation',
      description: 'Get precise directions and travel information for seamless temple visits.',
    },
  ];

  const stats = [
    { number: '1000+', label: 'Temples Listed' },
    { number: '50,000+', label: 'Happy Pilgrims' },
    { number: '28', label: 'States Covered' },
    { number: '4.8/5', label: 'Average Rating' },
  ];

  const benefits = [
    'Comprehensive temple database',
    'Authentic user reviews',
    'Detailed travel information',
    'Festival and event updates',
    'Mobile-friendly platform',
    'Community-driven content',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="temple-gradient py-20 px-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Sacred Temples
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Explore India's spiritual heritage with DivyaYatri - your trusted companion for sacred journeys
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mb-8">
            <div className="flex bg-white rounded-lg p-2 shadow-lg">
              <Input
                type="text"
                placeholder="Search temples by name, city, or deity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 text-gray-900 placeholder:text-gray-500"
              />
              <Button type="submit" size="lg" className="ml-2">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/temples">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Browse All Temples
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose DivyaYatri?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make your spiritual journey smoother with comprehensive temple information and community insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <Icon className="h-12 w-12 mx-auto text-primary mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Temples Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Temples</h2>
            <p className="text-lg text-gray-600">Discover some of the most visited and highly rated temples</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredTemples.length > 0 ? (
              featuredTemples.map((temple) => (
                <Card key={temple._id} className="temple-card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-r from-orange-300 to-red-400 relative">
                    {temple.images[0] ? (
                      <img
                        src={temple.images[0]}
                        alt={temple.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-orange-300 to-red-400 flex items-center justify-center text-white text-6xl">
                        🕉
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{temple.name}</CardTitle>
                    <CardDescription>
                      {temple.location.city}, {temple.location.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {temple.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{temple.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({temple.reviewCount} reviews)</span>
                      </div>
                      <Link to={`/temple/${temple._id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback mock data
              [1, 2, 3, 4, 5, 6].map((temple) => (
                <Card key={temple} className="temple-card overflow-hidden">
                  <div className="h-48 bg-gradient-to-r from-orange-300 to-red-400 flex items-center justify-center text-white text-6xl">
                    🕉
                  </div>
                  <CardHeader>
                    <CardTitle>Sacred Temple {temple}</CardTitle>
                    <CardDescription>City, State</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      A beautiful temple with rich history and spiritual significance for devotees.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-sm text-gray-500">(127 reviews)</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center">
            <Link to="/temples">
              <Button size="lg">
                View All Temples
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need for Your Spiritual Journey
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                DivyaYatri provides comprehensive information and tools to make your temple visits 
                meaningful and hassle-free. Join our community of spiritual seekers.
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Join DivyaYatri
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-6">
                <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-gray-600">Connect with fellow devotees</p>
              </Card>
              <Card className="text-center p-6">
                <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">Spiritual</h3>
                <p className="text-sm text-gray-600">Deepen your spiritual practice</p>
              </Card>
              <Card className="text-center p-6">
                <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">Discover</h3>
                <p className="text-sm text-gray-600">Explore new sacred places</p>
              </Card>
              <Card className="text-center p-6">
                <Star className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">Reviews</h3>
                <p className="text-sm text-gray-600">Share your experiences</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Begin Your Spiritual Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of devotees who trust DivyaYatri for their temple visits. 
            Start exploring today and discover the sacred.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/temples">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start Exploring
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}