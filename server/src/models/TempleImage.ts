import mongoose, { Schema, Document } from 'mongoose';

export interface ITempleImage extends Document {
  _id: string;
  temple: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  url: string;
  thumbnailUrl?: string;
  originalName: string;
  mimeType: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  category: 'exterior' | 'interior' | 'deity' | 'festival' | 'food' | 'ceremony' | 'architecture' | 'other';
  description?: string;
  tags: string[];
  metadata: {
    camera?: string;
    location?: {
      lat: number;
      lng: number;
    };
    timestamp?: Date;
    exif?: Record<string, any>;
  };
  socialInteractions: {
    likes: mongoose.Types.ObjectId[];
    views: number;
    downloads: number;
    reports: {
      userId: mongoose.Types.ObjectId;
      reason: string;
      reportedAt: Date;
    }[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  isPublic: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const templeImageSchema = new Schema<ITempleImage>({
  temple: {
    type: Schema.Types.ObjectId,
    ref: 'Temple',
    required: [true, 'Temple reference is required'],
    index: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader reference is required'],
    index: true
  },
  url: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Invalid thumbnail URL format'
    }
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative'],
    max: [10485760, 'File size cannot exceed 10MB'] // 10MB limit
  },
  dimensions: {
    width: {
      type: Number,
      required: [true, 'Image width is required'],
      min: [1, 'Width must be positive']
    },
    height: {
      type: Number,
      required: [true, 'Image height is required'],
      min: [1, 'Height must be positive']
    }
  },
  category: {
    type: String,
    enum: ['exterior', 'interior', 'deity', 'festival', 'food', 'ceremony', 'architecture', 'other'],
    default: 'other',
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  metadata: {
    camera: String,
    location: {
      lat: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    timestamp: Date,
    exif: Schema.Types.Mixed
  },
  socialInteractions: {
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0
    },
    reports: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reason: {
        type: String,
        required: true,
        enum: ['inappropriate', 'spam', 'copyright', 'misleading', 'other']
      },
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
    index: true
  },
  moderationNotes: {
    type: String,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  displayOrder: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
templeImageSchema.index({ temple: 1, status: 1 });
templeImageSchema.index({ uploadedBy: 1, status: 1 });
templeImageSchema.index({ category: 1, status: 1 });
templeImageSchema.index({ isFeatured: 1, displayOrder: 1 });
templeImageSchema.index({ tags: 1 });
templeImageSchema.index({ createdAt: -1 });
templeImageSchema.index({ 'socialInteractions.likes': 1 });

// Virtual for like count
templeImageSchema.virtual('likeCount').get(function(this: ITempleImage) {
  return this.socialInteractions.likes.length;
});

// Virtual for formatted file size
templeImageSchema.virtual('formattedSize').get(function(this: ITempleImage) {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for aspect ratio
templeImageSchema.virtual('aspectRatio').get(function(this: ITempleImage) {
  return this.dimensions.width / this.dimensions.height;
});

// Method to check if user liked the image
templeImageSchema.methods.isLikedBy = function(this: ITempleImage, userId: mongoose.Types.ObjectId): boolean {
  return this.socialInteractions.likes.some(like => like.toString() === userId.toString());
};

// Method to toggle like
templeImageSchema.methods.toggleLike = function(this: ITempleImage, userId: mongoose.Types.ObjectId) {
  const likeIndex = this.socialInteractions.likes.findIndex(
    like => like.toString() === userId.toString()
  );
  
  if (likeIndex > -1) {
    this.socialInteractions.likes.splice(likeIndex, 1);
  } else {
    this.socialInteractions.likes.push(userId);
  }
  
  return this.save();
};

// Method to increment view count
templeImageSchema.methods.incrementViews = function(this: ITempleImage) {
  this.socialInteractions.views += 1;
  return this.save();
};

// Method to increment download count
templeImageSchema.methods.incrementDownloads = function(this: ITempleImage) {
  this.socialInteractions.downloads += 1;
  return this.save();
};

// Method to report image
templeImageSchema.methods.reportImage = function(
  this: ITempleImage, 
  userId: mongoose.Types.ObjectId, 
  reason: string
) {
  const existingReport = this.socialInteractions.reports.find(
    report => report.userId.toString() === userId.toString()
  );
  
  if (existingReport) {
    throw new Error('You have already reported this image');
  }
  
  this.socialInteractions.reports.push({
    userId,
    reason,
    reportedAt: new Date()
  });
  
  // Auto-flag if reports exceed threshold
  if (this.socialInteractions.reports.length >= 3) {
    this.status = 'flagged';
  }
  
  return this.save();
};

// Static method to get featured images
templeImageSchema.statics.getFeaturedImages = function(templeId?: mongoose.Types.ObjectId, limit = 10) {
  const query: any = { 
    isFeatured: true, 
    status: 'approved',
    isPublic: true 
  };
  
  if (templeId) {
    query.temple = templeId;
  }
  
  return this.find(query)
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(limit)
    .populate('temple', 'name city state')
    .populate('uploadedBy', 'name avatar');
};

// Static method to get popular images
templeImageSchema.statics.getPopularImages = function(templeId?: mongoose.Types.ObjectId, limit = 10) {
  const query: any = { 
    status: 'approved',
    isPublic: true 
  };
  
  if (templeId) {
    query.temple = templeId;
  }
  
  return this.aggregate([
    { $match: query },
    {
      $addFields: {
        popularity: {
          $add: [
            { $size: '$socialInteractions.likes' },
            { $multiply: ['$socialInteractions.views', 0.1] },
            { $multiply: ['$socialInteractions.downloads', 0.5] }
          ]
        }
      }
    },
    { $sort: { popularity: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'temples',
        localField: 'temple',
        foreignField: '_id',
        as: 'temple'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'uploadedBy',
        foreignField: '_id',
        as: 'uploadedBy'
      }
    }
  ]);
};

export default mongoose.model<ITempleImage>('TempleImage', templeImageSchema);