import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  User, 
  Calendar,
  Camera,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';

interface Review {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  temple: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  visitDate: string;
  helpfulVotes: number;
  unhelpfulVotes: number;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  visitDate: string;
  images: File[];
}

interface ReviewSystemProps {
  templeId: string;
  reviews: Review[];
  onReviewSubmit: (review: ReviewFormData) => Promise<void>;
  onReviewVote: (reviewId: string, vote: 'helpful' | 'unhelpful') => Promise<void>;
  onReviewReport: (reviewId: string, reason: string) => Promise<void>;
}

export default function ReviewSystem({ 
  templeId, 
  reviews, 
  onReviewSubmit, 
  onReviewVote, 
  onReviewReport 
}: ReviewSystemProps) {
  const { user, isAuthenticated } = useAuth();
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 5,
    title: '',
    content: '',
    visitDate: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'verified' | '5' | '4' | '3' | '2' | '1'>('all');

  // Calculate rating statistics
  const ratingStats = {
    total: reviews.length,
    average: reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0,
    distribution: [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(review => review.rating === rating).length,
      percentage: reviews.length > 0 
        ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100 
        : 0
    }))
  };

  const handleRatingClick = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReviewForm(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 5) }));
  };

  const removeImage = (index: number) => {
    setReviewForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error({
        title: 'Authentication required',
        description: 'Please sign in to write a review.',
      });
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.content.trim()) {
      toast.error({
        title: 'Missing information',
        description: 'Please provide both a title and review content.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onReviewSubmit(reviewForm);
      setReviewForm({
        rating: 5,
        title: '',
        content: '',
        visitDate: '',
        images: []
      });
      setShowWriteReview(false);
      toast.success({
        title: 'Review submitted!',
        description: 'Your review has been submitted and is pending approval.',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error({
        title: 'Submission failed',
        description: 'Unable to submit your review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (reviewId: string, vote: 'helpful' | 'unhelpful') => {
    if (!isAuthenticated) {
      toast.error({
        title: 'Authentication required',
        description: 'Please sign in to vote on reviews.',
      });
      return;
    }

    try {
      await onReviewVote(reviewId, vote);
      toast.success({
        title: 'Vote recorded',
        description: 'Thank you for your feedback!',
      });
    } catch (error) {
      console.error('Error voting on review:', error);
      toast.error({
        title: 'Vote failed',
        description: 'Unable to record your vote. Please try again.',
      });
    }
  };

  const handleReport = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error({
        title: 'Authentication required',
        description: 'Please sign in to report reviews.',
      });
      return;
    }

    const reason = prompt('Please specify the reason for reporting this review:');
    if (!reason) return;

    try {
      await onReviewReport(reviewId, reason);
      toast.success({
        title: 'Review reported',
        description: 'Thank you for reporting. We will review this content.',
      });
    } catch (error) {
      console.error('Error reporting review:', error);
      toast.error({
        title: 'Report failed',
        description: 'Unable to report this review. Please try again.',
      });
    }
  };

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterBy === 'all') return true;
      if (filterBy === 'verified') return review.isVerified;
      return review.rating.toString() === filterBy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpfulVotes - a.helpfulVotes;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Reviews & Ratings</CardTitle>
          <CardDescription>
            What visitors are saying about this temple
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {ratingStats.average.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(ratingStats.average)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-text/70">Based on {ratingStats.total} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingStats.distribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{rating}★</span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-text/70 w-12">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          <div className="text-center">
            <Button
              onClick={() => setShowWriteReview(!showWriteReview)}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {showWriteReview ? 'Cancel Review' : 'Write a Review'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Form */}
      {showWriteReview && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 animate-fadeInUp">
          <CardHeader>
            <CardTitle>Share Your Experience</CardTitle>
            <CardDescription>
              Help other visitors by sharing your honest review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-text mb-3">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Review Title
                </label>
                <Input
                  name="title"
                  value={reviewForm.title}
                  onChange={handleInputChange}
                  placeholder="Summarize your experience..."
                  className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:bg-white transition-all duration-300"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Your Review
                </label>
                <textarea
                  name="content"
                  value={reviewForm.content}
                  onChange={handleInputChange}
                  placeholder="Share your detailed experience, what you liked, and any tips for other visitors..."
                  rows={6}
                  className="w-full bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg px-4 py-3 text-text font-medium focus:border-primary focus:bg-white transition-all duration-300 resize-none"
                  required
                />
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Visit Date (Optional)
                </label>
                <Input
                  type="date"
                  name="visitDate"
                  value={reviewForm.visitDate}
                  onChange={handleInputChange}
                  className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 focus:border-primary focus:bg-white transition-all duration-300"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Photos (Optional, max 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="review-images"
                />
                <label
                  htmlFor="review-images"
                  className="flex items-center gap-2 p-4 border-2 border-dashed border-primary/20 rounded-lg cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <Camera className="h-5 w-5 text-primary" />
                  <span className="text-text/70">Add photos to your review</span>
                </label>
                
                {reviewForm.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                    {reviewForm.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews Filters and Sort */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-1">Filter by:</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary focus:bg-white transition-all duration-300"
                >
                  <option value="all">All Reviews</option>
                  <option value="verified">Verified Only</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text mb-1">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white/50 backdrop-blur-sm border-2 border-primary/20 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary focus:bg-white transition-all duration-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>
            
            <p className="text-text/70">
              Showing {filteredAndSortedReviews.length} of {reviews.length} reviews
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredAndSortedReviews.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">No reviews yet</h3>
              <p className="text-text/70 mb-4">Be the first to share your experience!</p>
              <Button
                onClick={() => setShowWriteReview(true)}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
              >
                Write the First Review
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <Card key={review._id} className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    {review.user.avatar ? (
                      <img 
                        src={review.user.avatar} 
                        alt={`${review.user.firstName} ${review.user.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-text">
                            {review.user.firstName} {review.user.lastName}
                          </h4>
                          {review.isVerified && (
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              <Check className="h-3 w-3" />
                              Verified Visit
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text/70">
                          <Calendar className="h-4 w-4" />
                          {new Date(review.createdAt).toLocaleDateString()}
                          {review.visitDate && (
                            <>
                              <span>•</span>
                              <MapPin className="h-4 w-4" />
                              Visited {new Date(review.visitDate).toLocaleDateString()}
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleReport(review._id)}
                          className="p-1 text-text/40 hover:text-red-500 transition-colors"
                          title="Report review"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      <h5 className="font-semibold text-text mb-2">{review.title}</h5>
                      <p className="text-text/80 leading-relaxed">{review.content}</p>
                    </div>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    )}

                    {/* Review Actions */}
                    <div className="flex items-center gap-4 pt-2 border-t border-primary/10">
                      <span className="text-sm text-text/70">Was this helpful?</span>
                      <button
                        onClick={() => handleVote(review._id, 'helpful')}
                        className="flex items-center gap-1 text-sm text-text/70 hover:text-green-600 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Yes ({review.helpfulVotes})
                      </button>
                      <button
                        onClick={() => handleVote(review._id, 'unhelpful')}
                        className="flex items-center gap-1 text-sm text-text/70 hover:text-red-600 transition-colors"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        No ({review.unhelpfulVotes})
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}