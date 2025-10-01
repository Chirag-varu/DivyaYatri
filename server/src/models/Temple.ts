import mongoose, { Schema, Document } from 'mongoose';

export interface IFestival {
  name: string;
  dateRule: string; // e.g., "Annual on 15th Kartik" or "Every Monday"
  description?: string;
}

export interface ITimings {
  open: string;
  close: string;
  artiTimes: string[];
  specialTimings?: {
    festival?: string;
    open: string;
    close: string;
  }[];
}

export interface IContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface IManagerClaim {
  ownerId: mongoose.Types.ObjectId;
  verifiedAt: Date;
  verificationDocuments?: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface ITemple extends Document {
  _id: string;
  name: string;
  state: string;
  city: string;
  address: string;
  pincode?: string;
  lat: number;
  lng: number;
  deity: string;
  secondaryDeities?: string[];
  foundingYear?: number;
  shortHistory: string;
  fullHistory: string;
  timings: ITimings;
  festivals: IFestival[];
  contact: IContact;
  images: string[];
  verified: boolean;
  managerClaim?: IManagerClaim;
  tags: string[];
  averageRating: number;
  totalReviews: number;
  popularity: number;
  accessibility: {
    wheelchairAccessible: boolean;
    parkingAvailable: boolean;
    publicTransport: boolean;
  };
  facilities: string[];
  nearbyPlaces: {
    name: string;
    distance: number;
    type: 'temple' | 'restaurant' | 'hotel' | 'attraction';
  }[];
  seoSlug: string;
  isActive: boolean;
  lastUpdated: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const festivalSchema = new Schema<IFestival>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dateRule: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: false });

const timingsSchema = new Schema<ITimings>({
  open: {
    type: String,
    required: [true, 'Opening time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  close: {
    type: String,
    required: [true, 'Closing time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  artiTimes: [{
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  }],
  specialTimings: [{
    festival: String,
    open: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    close: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    }
  }]
}, { _id: false });

const contactSchema = new Schema<IContact>({
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Invalid phone number format']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Invalid website URL']
  }
}, { _id: false });

const managerClaimSchema = new Schema<IManagerClaim>({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedAt: {
    type: Date,
    default: Date.now
  },
  verificationDocuments: [String],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { _id: false });

const templeSchema = new Schema<ITemple>({
  name: {
    type: String,
    required: [true, 'Temple name is required'],
    trim: true,
    maxlength: [200, 'Temple name cannot exceed 200 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  pincode: {
    type: String,
    trim: true,
    match: [/^\d{6}$/, 'Invalid pincode format']
  },
  lat: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  lng: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  deity: {
    type: String,
    required: [true, 'Primary deity is required'],
    trim: true
  },
  secondaryDeities: [{
    type: String,
    trim: true
  }],
  foundingYear: {
    type: Number,
    min: [0, 'Founding year must be positive'],
    max: [new Date().getFullYear(), 'Founding year cannot be in the future']
  },
  shortHistory: {
    type: String,
    required: [true, 'Short history is required'],
    trim: true,
    maxlength: [500, 'Short history cannot exceed 500 characters']
  },
  fullHistory: {
    type: String,
    required: [true, 'Full history is required'],
    trim: true,
    maxlength: [5000, 'Full history cannot exceed 5000 characters']
  },
  timings: {
    type: timingsSchema,
    required: true
  },
  festivals: [festivalSchema],
  contact: {
    type: contactSchema,
    default: {}
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
  verified: {
    type: Boolean,
    default: false
  },
  managerClaim: managerClaimSchema,
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    parkingAvailable: {
      type: Boolean,
      default: false
    },
    publicTransport: {
      type: Boolean,
      default: false
    }
  },
  facilities: [{
    type: String,
    enum: ['parking', 'restroom', 'drinking_water', 'prasadam', 'accommodation', 'wheelchair_accessible', 'audio_guide', 'photography_allowed']
  }],
  nearbyPlaces: [{
    name: {
      type: String,
      required: true
    },
    distance: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['temple', 'restaurant', 'hotel', 'attraction'],
      required: true
    }
  }],
  seoSlug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
templeSchema.index({ name: 'text', city: 'text', state: 'text', deity: 'text' });
templeSchema.index({ state: 1, city: 1 });
templeSchema.index({ deity: 1 });
templeSchema.index({ lat: 1, lng: 1 });
templeSchema.index({ averageRating: -1 });
templeSchema.index({ popularity: -1 });
templeSchema.index({ verified: 1 });
templeSchema.index({ isActive: 1 });
templeSchema.index({ seoSlug: 1 });
templeSchema.index({ tags: 1 });

// Generate SEO slug before saving
templeSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isModified('city') || !this.seoSlug) {
    this.seoSlug = `${this.name}-${this.city}-${this.state}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  this.lastUpdated = new Date();
  next();
});

// Virtual for formatted location
templeSchema.virtual('formattedLocation').get(function(this: ITemple) {
  return `${this.city}, ${this.state}`;
});

// Virtual for rating display
templeSchema.virtual('ratingDisplay').get(function(this: ITemple) {
  return this.averageRating > 0 ? this.averageRating.toFixed(1) : 'No ratings';
});

export default mongoose.model<ITemple>('Temple', templeSchema);