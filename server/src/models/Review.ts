import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  temple: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  visitDate?: Date;
  isVerified: boolean;
  isApproved: boolean;
  moderationNotes?: string;
  helpfulVotes: number;
  reportedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  temple: {
    type: Schema.Types.ObjectId,
    ref: 'Temple',
    required: [true, 'Temple is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
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
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approved, but can be moderated
  },
  moderationNotes: {
    type: String,
    trim: true
  },
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  reportedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ temple: 1, user: 1 }, { unique: true }); // One review per user per temple
reviewSchema.index({ temple: 1, rating: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for helpful votes percentage
reviewSchema.virtual('helpfulPercentage').get(function(this: IReview) {
  // This would need additional logic to calculate based on total votes
  return this.helpfulVotes > 0 ? Math.round((this.helpfulVotes / (this.helpfulVotes + 1)) * 100) : 0;
});

export default mongoose.model<IReview>('Review', reviewSchema);