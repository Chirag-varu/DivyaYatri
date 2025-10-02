import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';\nimport ReviewSystem from '@/components/ReviewSystem';\nimport BookingSystem from '@/components/BookingSystem';\nimport NotificationSystem from '@/components/NotificationSystem';\nimport ImageUploadGallery from '@/components/ImageUploadGallery';
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Globe, 
  Camera,
  Heart,
  Share2,
  ArrowLeft,
  Users,
  Calendar,
  Info,
  ChevronLeft,
  ChevronRight
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
  contact: {
    phone?: string;
    website?: string;
  };
  history: string;
  festivals: string[];
  isActive: boolean;
}

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

const fetchTemple = async (id: string): Promise<Temple> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/temples/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch temple details');
  }
  const data = await response.json();
  return data.data.temple;
};

const fetchReviews = async (id: string): Promise<Review[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/temples/${id}/reviews`);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  const data = await response.json();
  return data.data.reviews || [];
};

export default function TempleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const { data: temple, isLoading: templeLoading, error: templeError } = useQuery({
    queryKey: ['temple', id],
    queryFn: () => fetchTemple(id!),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchReviews(id!),
    enabled: !!id,
  });

  const nextImage = () => {
    if (temple && temple.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % temple.images.length);
    }
  };

  const prevImage = () => {
    if (temple && temple.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + temple.images.length) % temple.images.length);
    }
  };

  if (templeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gradient-to-r from-text/20 to-text/10 rounded"></div>
                <div className="h-4 bg-gradient-to-r from-text/20 to-text/10 rounded w-3/4"></div>
                <div className="h-32 bg-gradient-to-r from-text/20 to-text/10 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gradient-to-r from-text/20 to-text/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (templeError || !temple) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">Temple Not Found</h2>
          <p className="text-text/70 mb-8">The temple you're looking for doesn't exist or has been removed.</p>
          <Link to="/temples">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-4 border-double">
              Browse All Temples
            </Button>
          </Link>
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

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/temples">
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-white hover:border-primary transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Temples
            </Button>
          </Link>
        </div>

        {/* Image Gallery */}
        {temple.images && temple.images.length > 0 && (
          <div className="relative mb-8 group">
            <div className="relative h-96 md:h-[32rem] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={temple.images[currentImageIndex] || '/placeholder-temple.jpg'}
                alt={temple.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              
              {/* Image Controls */}
              {temple.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {temple.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {temple.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white shadow-lg scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Floating Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                    isLiked 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/40'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all duration-300">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Temple Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    {temple.name}
                  </h1>
                  <div className="flex items-center gap-4 text-text/70">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{temple.location.city}, {temple.location.state}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">{temple.rating.toFixed(1)}</span>
                      <span>({temple.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <span className="bg-gradient-to-r from-primary/20 to-secondary/20 text-primary px-4 py-2 rounded-full font-medium">
                  {temple.category}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="festivals">Festivals</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">About This Temple</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-text/80 leading-relaxed text-lg">{temple.description}</p>
                    
                    <div>
                      <h3 className="font-semibold text-text mb-3">Features & Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {temple.features.map((feature, index) => (
                          <span key={index} className="bg-secondary/10 text-text px-3 py-1 rounded-full text-sm">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-text mb-3">Address</h3>
                      <p className="text-text/80">{temple.location.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">Temple History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text/80 leading-relaxed text-lg">
                      {temple.history || 'Historical information about this temple will be available soon.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="festivals" className="mt-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">Festivals & Celebrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {temple.festivals && temple.festivals.length > 0 ? (
                      <div className="space-y-3">
                        {temple.festivals.map((festival, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span className="text-text">{festival}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text/80">Festival information will be updated soon.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">Visitor Reviews</CardTitle>
                    <CardDescription>
                      What other devotees are saying about their experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviewsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-text/20 rounded-full"></div>
                              <div className="h-4 bg-text/20 rounded w-1/4"></div>
                            </div>
                            <div className="h-16 bg-text/20 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review._id} className="p-4 bg-secondary/5 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-text">{review.user.name}</p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${
                                        i < review.rating 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-text/80 leading-relaxed">{review.comment}</p>
                            <p className="text-text/60 text-sm mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text/80">No reviews yet. Be the first to share your experience!</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Temple Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-text">Timings</p>
                    <p className="text-text/70">{temple.timings.open} - {temple.timings.close}</p>
                  </div>
                </div>

                {temple.contact?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-text">Phone</p>
                      <p className="text-text/70">{temple.contact.phone}</p>
                    </div>
                  </div>
                )}

                {temple.contact?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-text">Website</p>
                      <a 
                        href={temple.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-secondary transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Get Directions
              </Button>
              <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-white hover:border-primary transition-all duration-300">
                Write a Review
              </Button>
              <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-white hover:border-primary transition-all duration-300">
                <Camera className="h-4 w-4 mr-2" />
                View Gallery
              </Button>
            </div>

            {/* Map Placeholder */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-text/70">Interactive map coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}