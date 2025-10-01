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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Sacred Temples</h1>
        <p className="text-lg text-gray-600">
          Explore temples across India and find your spiritual destination
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search temples by name, location, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {isLoading ? 'Loading...' : `${filteredTemples.length} temples found`}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          Error loading temples. Please try again later.
        </div>
      )}

      {/* Temples Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemples.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No temples found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse all temples.
          </p>
          <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-6'
        }>
          {filteredTemples.map((temple) => (
            <Card key={temple._id} className={viewMode === 'list' ? 'flex' : ''}>
              <div className={viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}>
                <img
                  src={temple.images[0] || '/placeholder-temple.jpg'}
                  alt={temple.name}
                  className={`object-cover ${
                    viewMode === 'list' 
                      ? 'w-full h-full rounded-l-lg' 
                      : 'w-full h-48 rounded-t-lg'
                  }`}
                />
              </div>
              <div className="flex-1">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{temple.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {temple.location.city}, {temple.location.state}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{temple.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({temple.reviewCount})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {temple.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      {temple.category}
                    </span>
                    {temple.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Open: {temple.timings.open} - {temple.timings.close}
                    </div>
                    <Link to={`/temple/${temple._id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}