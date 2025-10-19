import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  temple: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  content: string;
  images: string[];
  visitDate?: Date;
  visitPurpose: 'prayer' | 'tourism' | 'festival' | 'ceremony' | 'other';
  pros: string[];
  cons: string[];
  tags: string[];
  votes: {
    helpful: mongoose.Types.ObjectId[];
    unhelpful: mongoose.Types.ObjectId[];
  };
  replies: {
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  reports: {
    user: mongoose.Types.ObjectId;
    reason: string;
    description?: string;
    reportedAt: Date;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  isVerified: boolean;
  isEdited: boolean;
  editHistory: {
    content: string;
    editedAt: Date;
    reason?: string | undefined;
  }[];
  metadata: {
    source: 'web' | 'mobile' | 'admin';
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Virtuals and methods
interface IReviewExtras {
  totalVotes?: number;
}

// Ensure methods are present on the model instance for TypeScript
declare module './EnhancedReview' {
  interface IReview {
    totalVotes?: number;
  }
}

// Declare methods used by controllers
interface IReviewMethods {
  hasUserVoted(userId: mongoose.Types.ObjectId): 'helpful' | 'unhelpful' | null;
  vote(userId: mongoose.Types.ObjectId, voteType: 'helpful' | 'unhelpful'): Promise<any>;
  removeVote(userId: mongoose.Types.ObjectId): Promise<any>;
  addReply(userId: mongoose.Types.ObjectId, content: string): Promise<any>;
  reportReview(userId: mongoose.Types.ObjectId, reason: string, description?: string): Promise<any>;
  editReview(newContent: string, reason?: string): Promise<any>;
}

export type IReviewModel = mongoose.Model<IReview> & IReviewMethods;

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  temple: {
    type: Schema.Types.ObjectId,
    ref: 'Temple',
    required: [true, 'Temple is required'],
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not exceed 5'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  }],
  visitDate: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Visit date cannot be in the future'
    }
  },
  visitPurpose: {
    type: String,
    enum: ['prayer', 'tourism', 'festival', 'ceremony', 'other'],
    default: 'prayer'
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [100, 'Pro cannot exceed 100 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [100, 'Con cannot exceed 100 characters']
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  votes: {
    helpful: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    unhelpful: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  replies: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Reply cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reports: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'copyright', 'other']
    },
    description: {
      type: String,
      maxlength: [300, 'Report description cannot exceed 300 characters']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved',
    index: true
  },
  moderationNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: {
      type: String,
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      maxlength: [200, 'Edit reason cannot exceed 200 characters']
    }
  }],
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ temple: 1, user: 1 }, { unique: true }); // One review per user per temple
reviewSchema.index({ temple: 1, rating: -1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ isVerified: 1, rating: -1 });
reviewSchema.index({ tags: 1 });
reviewSchema.index({ visitPurpose: 1 });

// Compound index for filtering
reviewSchema.index({ 
  temple: 1, 
  status: 1, 
  rating: 1,
  visitPurpose: 1 
});

// Virtual for helpful votes count
reviewSchema.virtual('helpfulVotes').get(function(this: IReview) {
  return this.votes.helpful.length;
});

// Virtual for unhelpful votes count
reviewSchema.virtual('unhelpfulVotes').get(function(this: IReview) {
  return this.votes.unhelpful.length;
});

// Virtual for total votes
reviewSchema.virtual('totalVotes').get(function(this: IReview) {
  return this.votes.helpful.length + this.votes.unhelpful.length;
});

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function(this: IReview) {
  const total = this.totalVotes || (this.votes.helpful.length + this.votes.unhelpful.length);
  if (total === 0) return 0;
  return Math.round((this.votes.helpful.length / total) * 100);
});

// Virtual for formatted visit date
reviewSchema.virtual('formattedVisitDate').get(function(this: IReview) {
  if (!this.visitDate) return null;
  return this.visitDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time since creation
reviewSchema.virtual('timeAgo').get(function(this: IReview) {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return diffMins > 0 ? `${diffMins} minute${diffMins > 1 ? 's' : ''} ago` : 'Just now';
});

// Method to check if user voted
reviewSchema.methods.hasUserVoted = function(this: IReview, userId: mongoose.Types.ObjectId): 'helpful' | 'unhelpful' | null {
  if (this.votes.helpful.some(id => id.toString() === userId.toString())) {
    return 'helpful';
  }
  if (this.votes.unhelpful.some(id => id.toString() === userId.toString())) {
    return 'unhelpful';
  }
  return null;
};

// Method to vote on review
reviewSchema.methods.vote = function(this: IReview, userId: mongoose.Types.ObjectId, voteType: 'helpful' | 'unhelpful') {
  // Remove existing vote if any
  this.votes.helpful = this.votes.helpful.filter(id => id.toString() !== userId.toString());
  this.votes.unhelpful = this.votes.unhelpful.filter(id => id.toString() !== userId.toString());
  
  // Add new vote
  this.votes[voteType].push(userId);
  
  return this.save();
};

// Method to remove vote
reviewSchema.methods.removeVote = function(this: IReview, userId: mongoose.Types.ObjectId) {
  this.votes.helpful = this.votes.helpful.filter(id => id.toString() !== userId.toString());
  this.votes.unhelpful = this.votes.unhelpful.filter(id => id.toString() !== userId.toString());
  
  return this.save();
};

// Method to add reply
reviewSchema.methods.addReply = function(this: IReview, userId: mongoose.Types.ObjectId, content: string) {
  this.replies.push({
    user: userId,
    content,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to report review
reviewSchema.methods.reportReview = function(
  this: IReview, 
  userId: mongoose.Types.ObjectId, 
  reason: string, 
  description?: string
) {
  // Check if user already reported
  const existingReport = this.reports.find(
    report => report.user.toString() === userId.toString()
  );
  
  if (existingReport) {
    throw new Error('You have already reported this review');
  }
  
  const reportEntry: any = { user: userId, reason, reportedAt: new Date() };
  if (description !== undefined) reportEntry.description = description;
  this.reports.push(reportEntry);
  
  // Auto-flag if reports exceed threshold
  if (this.reports.length >= 3) {
    this.status = 'flagged';
  }
  
  return this.save();
};

// Method to edit review
reviewSchema.methods.editReview = function(
  this: IReview, 
  newContent: string, 
  reason?: string
) {
  // Save to edit history
  const editEntry: any = { content: this.content, editedAt: new Date() };
  if (reason !== undefined) editEntry.reason = reason;
  this.editHistory.push(editEntry);
  
  this.content = newContent;
  this.isEdited = true;
  
  return this.save();
};

// Static method to get temple statistics
reviewSchema.statics.getTempleStats = function(templeId: mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { temple: templeId, status: 'approved' } },
    {
      $group: {
        _id: '$temple',
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingCounts: {
          1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } },
          2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } }
        }
      }
    }
  ]);
};

// Pre-save middleware to auto-flag spam content
reviewSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isNew) {
    // Simple spam detection (can be enhanced with ML)
    const spamWords = ['spam', 'fake', 'scam', 'bot'];
    const contentLower = this.content.toLowerCase();
    
    if (spamWords.some(word => contentLower.includes(word))) {
      this.status = 'pending';
    }
  }
  next();
});

export default mongoose.model<IReview>('Review', reviewSchema);