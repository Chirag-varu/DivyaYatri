import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  _id: string;
  temple: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  visitDate: Date;
  timeSlot: {
    start: string;
    end: string;
  };
  visitors: {
    adults: number;
    children: number;
    seniors: number;
  };
  totalAmount: number;
  serviceFee: number;
  finalAmount: number;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
    specialRequests?: string;
  };
  paymentInfo: {
    paymentId?: string;
    paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
    transactionId?: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paidAt?: Date;
  };
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'failed';
  qrCode?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  rating?: number;
  feedback?: string;
  remindersSent: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  metadata: {
    source: 'web' | 'mobile' | 'admin';
    userAgent?: string;
    ipAddress?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  temple: {
    type: Schema.Types.ObjectId,
    ref: 'Temple',
    required: [true, 'Temple reference is required'],
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
    validate: {
      validator: function(v: Date) {
        return v >= new Date();
      },
      message: 'Visit date cannot be in the past'
    },
    index: true
  },
  timeSlot: {
    start: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    end: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    }
  },
  visitors: {
    adults: {
      type: Number,
      required: true,
      min: [1, 'At least one adult visitor is required'],
      max: [20, 'Maximum 20 adult visitors allowed']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children count cannot be negative'],
      max: [10, 'Maximum 10 children allowed']
    },
    seniors: {
      type: Number,
      default: 0,
      min: [0, 'Seniors count cannot be negative'],
      max: [10, 'Maximum 10 seniors allowed']
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  serviceFee: {
    type: Number,
    default: 0,
    min: [0, 'Service fee cannot be negative']
  },
  finalAmount: {
    type: Number,
    required: true,
    min: [0, 'Final amount cannot be negative']
  },
  contactInfo: {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[\d\s-()]+$/, 'Invalid phone number format']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters']
    }
  },
  paymentInfo: {
    paymentId: String,
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet'],
      required: true
    },
    transactionId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    paidAt: Date
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'expired'],
    default: 'pending',
    index: true
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  },
  refundStatus: {
    type: String,
    enum: ['pending', 'processed', 'failed']
  },
  qrCode: String,
  checkInTime: Date,
  checkOutTime: Date,
  rating: {
    type: Number,
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  remindersSent: {
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ temple: 1, visitDate: 1 });
bookingSchema.index({ user: 1, bookingStatus: 1 });
bookingSchema.index({ visitDate: 1, bookingStatus: 1 });
bookingSchema.index({ 'paymentInfo.paymentStatus': 1 });
bookingSchema.index({ createdAt: -1 });

// Compound index for slot availability checking
bookingSchema.index({ 
  temple: 1, 
  visitDate: 1, 
  'timeSlot.start': 1, 
  'timeSlot.end': 1,
  bookingStatus: 1 
});

// Virtual for total visitors
bookingSchema.virtual('totalVisitors').get(function(this: IBooking) {
  return this.visitors.adults + this.visitors.children + this.visitors.seniors;
});

// Virtual for booking reference
bookingSchema.virtual('bookingReference').get(function(this: IBooking) {
  return `DY${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for formatted visit date
bookingSchema.virtual('formattedVisitDate').get(function(this: IBooking) {
  return this.visitDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Pre-save middleware to calculate final amount
bookingSchema.pre('save', function(next) {
  if (this.isModified('totalAmount') || this.isModified('serviceFee')) {
    this.finalAmount = this.totalAmount + this.serviceFee;
  }
  next();
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function(this: IBooking): boolean {
  const now = new Date();
  const visitDateTime = new Date(this.visitDate);
  const hoursDiff = (visitDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return this.bookingStatus === 'confirmed' && hoursDiff >= 24;
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function(this: IBooking): number {
  if (!this.canBeCancelled()) return 0;
  
  const now = new Date();
  const visitDateTime = new Date(this.visitDate);
  const hoursDiff = (visitDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff >= 48) {
    return this.finalAmount; // Full refund
  } else if (hoursDiff >= 24) {
    return this.finalAmount * 0.8; // 80% refund
  }
  
  return 0;
};

export default mongoose.model<IBooking>('Booking', bookingSchema);