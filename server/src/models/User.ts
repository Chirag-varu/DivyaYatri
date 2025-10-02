import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface User extends Document {
  _id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  name: string; // Virtual property for full name
  role: 'user' | 'admin' | 'temple_manager';
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  isEmailVerified: boolean; // Alias for isVerified
  verificationToken?: string;
  emailVerificationToken?: string | null; // Alias for verificationToken
  emailVerificationExpires?: Date | null;
  resetPasswordToken?: string;
  passwordResetToken?: string | null; // Alias for resetPasswordToken
  resetPasswordExpire?: Date;
  passwordResetExpires?: Date | null; // Alias for resetPasswordExpire
  
  // Enhanced authentication properties
  refreshTokens: Array<{
    token: string;
    createdAt: Date;
    expiresAt: Date;
    userAgent: string;
    ipAddress: string;
  }>;
  loginAttempts?: number;
  lockUntil?: Date | null;
  authProviders: string[];
  
  // Google OAuth fields
  googleId?: string;
  authProvider: 'local' | 'google';
  
  // Profile properties
  profile?: {
    avatar?: string;
    preferences?: {
      language: string;
      notifications: {
        email: boolean;
        push: boolean;
        sms?: boolean;
      };
    };
  };
  
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

const userSchema = new Schema< User>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: function(this:  User) {
      return this.authProvider === 'local';
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'temple_manager'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Enhanced authentication properties
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    userAgent: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    }
  }],
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  authProviders: [{
    type: String,
    enum: ['local', 'google']
  }],
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
    required: true
  },
  
  // Profile properties
  profile: {
    avatar: {
      type: String
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'bn', 'or', 'pa']
      },
      notifications: {
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
        }
      }
    }
  },
  
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'bn', 'or', 'pa']
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function(this: User) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for name (alias for fullName)
userSchema.virtual('name').get(function(this: User) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for isEmailVerified (alias for isVerified)
userSchema.virtual('isEmailVerified').get(function(this: User) {
  return this.isVerified;
}).set(function(this: User, value: boolean) {
  this.isVerified = value;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Skip password hashing for Google OAuth users
  if (this.authProvider === 'google') {
    return next();
  }
  
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  // Google OAuth users don't have passwords
  if (this.authProvider === 'google' || !this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get full name
userSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  return userObject;
};

export default mongoose.model< User>('User', userSchema);