import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewSystem from '@/components/ReviewSystem';
import BookingSystem from '@/components/BookingSystem';
import NotificationSystem from '@/components/NotificationSystem';
import ImageUploadGallery from '@/components/ImageUploadGallery';
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
  ChevronRight,
  MessageSquare,
  Upload,
  CreditCard,
  Bell
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
  // Mock data for demo - replace with actual API call
  return {
    _id: id!,
    name: "Shri Ganesh Mandir",
    description: "A beautiful temple dedicated to Lord Ganesha, known for its spiritual atmosphere and stunning architecture.",
    location: {
      address: "123 Temple Street",
      city: "Mumbai",
      state: "Maharashtra",
      coordinates: [19.0760, 72.8777]
    },
    images: [
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800"
    ],
    rating: 4.8,
    reviewCount: 245,
    category: "Hindu Temple",
    features: ["Parking Available", "Wheelchair Accessible", "Gift Shop", "Prasadam"],
    timings: {
      open: "6:00 AM",
      close: "9:00 PM"
    },
    contact: {
      phone: "+91 98765 43210",
      website: "https://ganeshmandir.org"
    },
    history: "This ancient temple has been serving devotees for over 200 years...",
    festivals: ["Ganesh Chaturthi", "Diwali", "Navratri"],
    isActive: true
  };
};

const fetchReviews = async (id: string): Promise<Review[]> => {
  // Mock data for demo - replace with actual API call
  return [
    {
      _id: "1",
      user: {
        name: "Rahul Sharma",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
      },
      rating: 5,
      comment: "Amazing spiritual experience. The temple is beautifully maintained.",
      createdAt: "2024-01-15",
      helpful: 12
    },
    {
      _id: "2",
      user: {
        name: "Priya Patel"
      },
      rating: 4,
      comment: "Peaceful environment and helpful staff. Great place for meditation.",
      createdAt: "2024-01-10",
      helpful: 8
    }
  ];
};

export default function TempleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: temple?.name,
        text: temple?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Mock functions for component integration
  const handleReviewSubmit = async (reviewData: any) => {
    console.log('Review submitted:', reviewData);
    // API call to submit review
  };

  const handleReviewVote = async (reviewId: string, helpful: boolean) => {
    console.log('Review vote:', reviewId, helpful);
    // API call to vote on review
  };

  const handleReviewReport = async (reviewId: string, reason: string) => {
    console.log('Review reported:', reviewId, reason);
    // API call to report review
  };

  const handleBookingSubmit = async (bookingData: any) => {
    console.log('Booking submitted:', bookingData);
    // API call to submit booking
  };

  const handleImageUpload = async (images: File[]) => {
    console.log('Images uploaded:', images);
    // API call to upload images
  };

  if (templeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16   from-primary to-secondary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-text/70">Loading temple details...</p>
        </div>
      </div>
    );
  }

  if (templeError || !temple) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-4">Temple not found</h2>
          <p className="text-text/70 mb-6">The temple you're looking for doesn't exist or has been removed.</p>
          <Link to="/temples">
            <Button className="  from-primary to-secondary text-white">
              Browse Temples
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

      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-primary/10 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/temples" 
              className="flex items-center gap-2 text-primary hover:text-secondary transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Temples
            </Link>
            <div className="flex items-center gap-3">
              <NotificationSystem />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={`${isLiked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white/80'} hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="bg-white/80">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-primary/10 to-secondary/10">
                {temple.images.length > 0 ? (
                  <>
                    <img
                      src={temple.images[currentImageIndex]}
                      alt={temple.name}
                      className="w-full h-full object-cover"
                    />
                    {temple.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {temple.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                      <p className="text-text/70">No images available</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Temple Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-primary mb-2">
                      {temple.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-text/70">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {temple.location.city}, {temple.location.state}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {temple.rating} ({temple.reviewCount} reviews)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      {temple.category}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-text/80 leading-relaxed mb-6">
                  {temple.description}
                </p>
                
                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {temple.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Festivals */}
                <div>
                  <h3 className="text-lg font-semibold text-text mb-3">Major Festivals</h3>
                  <div className="flex flex-wrap gap-2">
                    {temple.festivals.map((festival, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full"
                      >
                        {festival}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for integrated features */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="booking">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Booking
                </TabsTrigger>
                <TabsTrigger value="gallery">
                  <Upload className="h-4 w-4 mr-2" />
                  Gallery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-primary">History & Significance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text/80 leading-relaxed">
                      {temple.history}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <ReviewSystem
                  templeId={temple._id}
                  reviews={reviews}
                  onReviewSubmit={handleReviewSubmit}
                  onReviewVote={handleReviewVote}
                  onReviewReport={handleReviewReport}
                />
              </TabsContent>

              <TabsContent value="booking" className="space-y-6">
                <BookingSystem
                  temple={temple}
                  onBookingSubmit={handleBookingSubmit}
                />
              </TabsContent>

              <TabsContent value="gallery" className="space-y-6">
                <ImageUploadGallery
                  templeId={temple._id}
                  templeName={temple.name}
                  onImageUpload={handleImageUpload}
                />
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
              <Button className="w-full   from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Get Directions
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-white hover:border-primary transition-all duration-300"
                onClick={() => setActiveTab('reviews')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-white hover:border-primary transition-all duration-300"
                onClick={() => setActiveTab('gallery')}
              >
                <Camera className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-white hover:border-primary transition-all duration-300"
                onClick={() => setActiveTab('booking')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Book Visit
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
                    <p className="text-sm text-text/60 mt-1">{temple.location.address}</p>
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