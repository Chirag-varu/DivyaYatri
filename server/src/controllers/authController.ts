import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { JWTUtils } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';

// Rate limiting configurations
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour
  message: { error: 'Too many registration attempts, please try again later' },
});

export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: { error: 'Too many password reset attempts, please try again later' },
});

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation errors',
        details: errors.array()
      });
      return;
    }

    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      phone
    });

    await user.save();

    // Generate JWT token
    const token = JWTUtils.generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.getFullName(),
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      res.status(400).json({
        success: false,
        error: 'Validation errors',
        details: errors.array()
      });
      return;
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    console.log('Login attempt for password:', password);

    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for email:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // console.log('User found:', { email: user.email, role: user.role, hasPassword: !!user.password });

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password comparison result:', isPasswordValid);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = JWTUtils.generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.getFullName(),
          role: user.role,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user?._id,
          email: user?.email,
          name: user?.getFullName(),
          role: user?.role,
          avatar: user?.avatar,
          phone: user?.phone,
          isVerified: user?.isVerified,
          preferences: user?.preferences,
          lastLogin: user?.lastLogin,
          createdAt: user?.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching profile'
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation errors',
        details: errors.array()
      });
      return;
    }

    const { name, firstName, lastName, phone, preferences } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Update user fields
    if (name !== undefined) {
      const nameParts = name.split(' ');
      user.firstName = nameParts[0] || name;
      user.lastName = nameParts.slice(1).join(' ') || '';
    } else {
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
    }
    if (phone !== undefined) user.phone = phone;
    if (preferences !== undefined) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.getFullName(),
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          isVerified: user.isVerified,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation errors',
        details: errors.array()
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while changing password'
    });
  }
};

/**
 * Logout user (client-side token removal)
 */
export const logout = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * Google OAuth callback handler
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { googleId, email, name, firstName, lastName, avatar } = req.body;

    if (!googleId || !email || (!name && (!firstName || !lastName))) {
      res.status(400).json({
        success: false,
        error: 'Missing required Google OAuth data'
      });
      return;
    }

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with email (local account)
      const existingUser = await User.findOne({ email });
      
      if (existingUser && existingUser.authProvider === 'local') {
        res.status(400).json({
          success: false,
          error: 'An account with this email already exists. Please sign in with your password.'
        });
        return;
      }

      // Create new Google OAuth user
      const userFirstName = firstName || (name ? name.split(' ')[0] : '');
      const userLastName = lastName || (name ? name.split(' ').slice(1).join(' ') : '');
      
      user = new User({
        googleId,
        email,
        firstName: userFirstName,
        lastName: userLastName,
        avatar,
        authProvider: 'google',
        isVerified: true // Google accounts are pre-verified
      });

      await user.save();
    } else {
      // Update last login for existing user
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = JWTUtils.generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      message: 'Google OAuth login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.getFullName(),
          role: user.role,
          avatar: user.avatar,
          authProvider: user.authProvider,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during Google OAuth'
    });
  }
};