import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, Star, Filter, Grid, List } from 'lucide-react';

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

const fetchTemples = async (searchQuery?: string): Promise<Temple[]> => {
  const url = searchQuery 
    ? `${import.meta.env.VITE_API_URL}/api/temples?search=${encodeURIComponent(searchQuery)}`
    : `${import.meta.env.VITE_API_URL}/api/temples`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch temples');
  }
  
  const data = await response.json();
  return data.data.temples || [];
};

export default function TemplesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: temples = [], isLoading, error } = useQuery({
    queryKey: ['temples', debouncedQuery],
    queryFn: () => fetchTemples(debouncedQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = ['all', 'hindu', 'buddhist', 'jain', 'sikh', 'other'];

  const filteredTemples = temples.filter(temple => {
    if (selectedCategory === 'all') return true;
    return temple.category.toLowerCase() === selectedCategory;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the debounced query
  };

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
                  type="submit" 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Search
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-6">
                {/* Category Filter */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                    <Filter className="h-5 w-5 text-primary" />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg px-4 py-2 text-text font-medium focus:border-primary focus:bg-white transition-all duration-300"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-none border-0 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                        : 'bg-transparent text-text hover:bg-primary/10'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-none border-0 ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                        : 'bg-transparent text-text hover:bg-primary/10'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-text/70 text-lg font-medium">
            {isLoading ? 'Loading...' : `${filteredTemples.length} temples found`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-6 py-4 rounded-xl mb-8 animate-fadeInUp">
            Error loading temples. Please try again later.
          </div>
        )}

        {/* Temples Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-pulse">
                <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-gradient-to-r from-text/20 to-text/10 rounded mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-text/20 to-text/10 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-text/20 to-text/10 rounded"></div>
                    <div className="h-4 bg-gradient-to-r from-text/20 to-text/10 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemples.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text mb-4">No temples found</h3>
              <p className="text-text/70 mb-8 text-lg">
                Try adjusting your search criteria or browse all temples.
              </p>
              <Button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
            : 'space-y-8'
          }>
            {filteredTemples.map((temple) => (
              <Card key={temple._id} className={`group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden ${
                viewMode === 'list' ? 'flex' : ''
              }`}>
                <div className={viewMode === 'list' ? 'w-80 flex-shrink-0' : ''}>
                  <div className="relative overflow-hidden">
                    <img
                      src={temple.images[0] || '/placeholder-temple.jpg'}
                      alt={temple.name}
                      className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                        viewMode === 'list' 
                          ? 'w-full h-full rounded-l-lg' 
                          : 'w-full h-64 rounded-t-lg'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-text group-hover:text-primary transition-colors duration-300">{temple.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2 text-text/70">
                          <MapPin className="h-4 w-4" />
                          {temple.location.city}, {temple.location.state}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-full">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold text-yellow-700">{temple.rating.toFixed(1)}</span>
                        <span className="text-yellow-600 text-sm">({temple.reviewCount})</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text/70 mb-6 line-clamp-2 leading-relaxed">
                      {temple.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="inline-block bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-sm px-3 py-1 rounded-full font-medium">
                        {temple.category}
                      </span>
                      {temple.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="inline-block bg-text/10 text-text/70 text-sm px-3 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-text/60 bg-secondary/10 px-3 py-2 rounded-lg">
                        Open: {temple.timings.open} - {temple.timings.close}
                      </div>
                      <Link to={`/temple/${temple._id}`}>
                        <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}