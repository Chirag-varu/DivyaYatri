import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  Grid, 
  List, 
  SlidersHorizontal,
  X,
  Clock,
  Heart,
  Navigation,
  Users
} from 'lucide-react';

interface Temple {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: [number, number];
  };
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
  features: string[];
  timings: {
    open: string;
    close: string;
  };
  isActive: boolean;
}

interface SearchFilters {
  category: string;
  state: string;
  city: string;
  minRating: number;
  features: string[];
  sortBy: 'name' | 'rating' | 'reviews' | 'distance';
  sortOrder: 'asc' | 'desc';
}

const fetchTemples = async (searchQuery?: string, filters?: Partial<SearchFilters>): Promise<Temple[]> => {
  const params = new URLSearchParams();
  
  if (searchQuery) params.append('search', searchQuery);
  if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters?.state && filters.state !== 'all') params.append('state', filters.state);
  if (filters?.city && filters.city !== 'all') params.append('city', filters.city);
  if (filters?.minRating && filters.minRating > 0) params.append('minRating', filters.minRating.toString());
  if (filters?.features && filters.features.length > 0) params.append('features', filters.features.join(','));
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  
  const url = `${import.meta.env.VITE_API_URL}/api/temples?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch temples');
    }
    const data = await response.json();
    return data.data?.temples || [];
  } catch (error) {
    console.error('Error fetching temples:', error);
    // Return mock data for development
    return [
      {
        _id: '1',
        name: 'Golden Temple',
        description: 'The most sacred Sikh shrine, known for its stunning golden architecture and peaceful atmosphere.',
        location: {
          address: 'Golden Temple Rd',
          city: 'Amritsar',
          state: 'Punjab',
          coordinates: [31.6200, 74.8765]
        },
        images: ['/api/placeholder/400/300'],
        rating: 4.8,
        reviewCount: 1250,
        category: 'sikh',
        features: ['Parking', 'Food Court', 'Guest House'],
        timings: { open: '04:00', close: '22:00' },
        isActive: true
      },
      {
        _id: '2',
        name: 'Meenakshi Temple',
        description: 'Ancient temple dedicated to Goddess Meenakshi with magnificent gopurams and intricate carvings.',
        location: {
          address: 'Madurai Main',
          city: 'Madurai',
          state: 'Tamil Nadu',
          coordinates: [9.9195, 78.1195]
        },
        images: ['/api/placeholder/400/300'],
        rating: 4.7,
        reviewCount: 890,
        category: 'hindu',
        features: ['Audio Guide', 'Wheelchair Access'],
        timings: { open: '05:00', close: '21:30' },
        isActive: true
      }
    ];
  }
};

export default function TemplesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    state: 'all',
    city: 'all',
    minRating: 0,
    features: [],
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: temples = [], isLoading, error } = useQuery({
    queryKey: ['temples', debouncedQuery, filters],
    queryFn: () => fetchTemples(debouncedQuery, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = ['all', 'hindu', 'buddhist', 'jain', 'sikh', 'other'];
  const states = ['all', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Punjab'];
  const availableFeatures = ['Parking', 'Food Court', 'Guest House', 'Online Booking', 'Wheelchair Access', 'Audio Guide'];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      state: 'all',
      city: 'all',
      minRating: 0,
      features: [],
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setSearchQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the debounced query
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Temples</h2>
            <p className="text-text/70 mb-6">Unable to load temples. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
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

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center animate-fadeInUp">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Discover Sacred Temples
          </h1>
          <p className="text-xl md:text-2xl text-text/80 max-w-3xl mx-auto leading-relaxed">
            Explore temples across India and find your spiritual destination
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-8">
              <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text/60 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search temples by name, location, or features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-3 text-lg bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:bg-white focus:scale-105 transition-all duration-300"
                  />
                </div>
                <Button 
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "default" : "outline"}
                  className="px-6 py-3 text-lg font-semibold transition-all duration-300"
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filters
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Search
                </Button>
              </form>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="border-t border-primary/10 pt-6 space-y-6 animate-fadeInUp">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg px-4 py-2 text-text font-medium focus:border-primary focus:bg-white transition-all duration-300"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">State</label>
                      <select
                        value={filters.state}
                        onChange={(e) => handleFilterChange('state', e.target.value)}
                        className="w-full bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg px-4 py-2 text-text font-medium focus:border-primary focus:bg-white transition-all duration-300"
                      >
                        {states.map(state => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">Min Rating</label>
                      <select
                        value={filters.minRating}
                        onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                        className="w-full bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg px-4 py-2 text-text font-medium focus:border-primary focus:bg-white transition-all duration-300"
                      >
                        <option value={0}>All Ratings</option>
                        <option value={4}>4+ Stars</option>
                        <option value={3}>3+ Stars</option>
                        <option value={2}>2+ Stars</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg px-4 py-2 text-text font-medium focus:border-primary focus:bg-white transition-all duration-300"
                      >
                        <option value="name">Name</option>
                        <option value="rating">Rating</option>
                        <option value="reviews">Reviews</option>
                        <option value="distance">Distance</option>
                      </select>
                    </div>
                  </div>

                  {/* Features Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-text mb-3">Features</label>
                    <div className="flex flex-wrap gap-3">
                      {availableFeatures.map(feature => (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => handleFeatureToggle(feature)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            filters.features.includes(feature)
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-white/50 text-text hover:bg-primary/10'
                          }`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-6 mt-6">
                {/* Results Count */}
                <div>
                  <p className="text-text/70 text-lg font-medium">
                    {isLoading ? 'Loading...' : `${temples.length} temples found`}
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-text">View:</span>
                  <div className="flex bg-white/50 backdrop-blur-sm rounded-lg p-1 border-2 border-primary/20">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'text-text hover:bg-primary/10'
                      }`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'text-text hover:bg-primary/10'
                      }`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="mb-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : temples.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">No temples found</h3>
                <p className="text-text/70 mb-6 max-w-md mx-auto">
                  Try adjusting your search criteria or filters to find more temples.
                </p>
                <Button 
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {temples.map((temple) => (
                <Card 
                  key={temple._id} 
                  className={`group bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}
                >
                  <div className={`${viewMode === 'list' ? 'w-1/3' : 'w-full'} relative overflow-hidden`}>
                    <img
                      src={temple.images[0] || '/api/placeholder/400/300'}
                      alt={temple.name}
                      className={`${
                        viewMode === 'list' ? 'h-full' : 'h-48'
                      } w-full object-cover group-hover:scale-110 transition-transform duration-700`}
                    />
                    <div className="absolute top-4 right-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-primary capitalize">{temple.category}</span>
                    </div>
                  </div>
                  
                  <div className={`${viewMode === 'list' ? 'w-2/3' : 'w-full'} p-6`}>
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                        {temple.name}
                      </CardTitle>
                      <CardDescription className="text-foreground/70 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {temple.location.city}, {temple.location.state}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <p className="text-foreground/80 mb-4 line-clamp-2">{temple.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{temple.rating}</span>
                          <span className="text-foreground/60">({temple.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-foreground/60">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{temple.timings.open} - {temple.timings.close}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {temple.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                        {temple.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                            +{temple.features.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          asChild
                          className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Link to={`/temples/${temple._id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button 
                          variant="outline"
                          className="bg-white/50 backdrop-blur-sm hover:bg-white hover:scale-105 transition-all duration-300"
                        >
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}