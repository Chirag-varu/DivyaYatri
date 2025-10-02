import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  recipient: mongoose.Types.ObjectId;
  type: 'booking_confirmed' | 'booking_reminder' | 'review_reply' | 'temple_update' | 'admin_message' | 'payment_success' | 'payment_failed' | 'booking_cancelled' | 'new_review' | 'system_maintenance';
  title: string;
  message: string;
  data?: {
    templeId?: mongoose.Types.ObjectId;
    bookingId?: mongoose.Types.ObjectId;
    reviewId?: mongoose.Types.ObjectId;
    actionUrl?: string;
    imageUrl?: string;
    [key: string]: any;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  status: {
    sent: boolean;
    delivered: boolean;
    read: boolean;
    clicked: boolean;
  };
  deliveryDetails: {
    emailSentAt?: Date;
    pushSentAt?: Date;
    smsSentAt?: Date;
    emailDeliveredAt?: Date;
    pushDeliveredAt?: Date;
    smsDeliveredAt?: Date;
    readAt?: Date;
    clickedAt?: Date;
  };
  retryCount: number;
  maxRetries: number;
  scheduledFor?: Date;
  expiresAt?: Date;
  template?: string;
  templateData?: Record<string, any>;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
    index: true
  },
  type: {
    type: String,
    enum: [
      'booking_confirmed',
      'booking_reminder', 
      'review_reply',
      'temple_update',
      'admin_message',
      'payment_success',
      'payment_failed',
      'booking_cancelled',
      'new_review',
      'system_maintenance'
    ],
    required: [true, 'Notification type is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: {
    templeId: {
      type: Schema.Types.ObjectId,
      ref: 'Temple'
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    },
    actionUrl: String,
    imageUrl: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  channel: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  status: {
    sent: {
      type: Boolean,
      default: false
    },
    delivered: {
      type: Boolean,
      default: false
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    clicked: {
      type: Boolean,
      default: false
    }
  },
  deliveryDetails: {
    emailSentAt: Date,
    pushSentAt: Date,
    smsSentAt: Date,
    emailDeliveredAt: Date,
    pushDeliveredAt: Date,
    smsDeliveredAt: Date,
    readAt: Date,
    clickedAt: Date
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: 0,
    max: 10
  },
  scheduledFor: {
    type: Date,
    index: true
  },
  expiresAt: {
    type: Date,
    index: true
  },
  template: String,
  templateData: Schema.Types.Mixed,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1, 'status.read': 1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ scheduledFor: 1, 'status.sent': 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function(this: INotification) {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function(this: INotification) {
  this.status.read = true;
  this.deliveryDetails.readAt = new Date();
  return this.save();
};

// Method to mark as clicked
notificationSchema.methods.markAsClicked = function(this: INotification) {
  this.status.clicked = true;
  this.deliveryDetails.clickedAt = new Date();
  if (!this.status.read) {
    this.markAsRead();
  }
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data: Partial<INotification>) {
  return new this(data);
};

// Static method to mark multiple as read
notificationSchema.statics.markMultipleAsRead = function(notificationIds: string[], userId: mongoose.Types.ObjectId) {
  return this.updateMany(
    { 
      _id: { $in: notificationIds },
      recipient: userId,
      'status.read': false
    },
    { 
      'status.read': true,
      'deliveryDetails.readAt': new Date()
    }
  );
};

export default mongoose.model<INotification>('Notification', notificationSchema);