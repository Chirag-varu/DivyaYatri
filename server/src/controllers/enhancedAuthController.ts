import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import rateLimit from 'express-rate-limit';
import UserModel, { User } from '../models/User';
import { AuthUtils, JWTPayload } from '../utils/auth';
import { sendEmail } from '../utils/email';
import NotificationModel from '../models/Notification';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

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

interface AuthRequest extends Request {
  user?: User;
}

/**
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
      return;
    }

    // Validate password strength
    const passwordValidation = AuthUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
      return;
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Generate email verification token
    const { token: verificationToken, hashedToken, expiresAt } = 
      AuthUtils.generateEmailVerificationToken();

    // Create user
    const user = new UserModel({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expiresAt,
      role: 'user',
      isEmailVerified: false,
      profile: {
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      }
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - DivyaYatri',
        template: 'verify-email',
        data: {
          name,
          verificationUrl,
          expiresIn: '24 hours'
        }
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Create welcome notification
    try {
      await NotificationModel.create({
        user: user._id,
        type: 'welcome',
        title: 'Welcome to DivyaYatri!',
        message: 'Your spiritual journey begins here. Please verify your email to get started.',
        priority: 'normal',
        channels: ['in-app'],
        data: {
          action: 'verify_email',
          verificationRequired: true
        }
      });
    } catch (notificationError) {
      console.error('Failed to create welcome notification:', notificationError);
      // Continue with registration even if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during registration'
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
      return;
    }

    // Find user
    const user = await UserModel.findOne({ 
      email: email.toLowerCase() 
    }).select('+password +refreshTokens +loginAttempts +lockUntil');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      res.status(423).json({
        success: false,
        error: `Account is temporarily locked. Try again in ${lockTimeRemaining} minutes.`
      });
      return;
    }

    // Verify password
    if (!user.password) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }
    
    const isPasswordValid = await AuthUtils.comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      await user.save();
      
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Reset login attempts on successful login
    if (user.loginAttempts && user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in',
        requiresEmailVerification: true
      });
      return;
    }

    // Generate tokens
    const tokenPayload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isEmailVerified
    };

    const { accessToken, refreshToken } = AuthUtils.generateTokenPair(tokenPayload);

    // Store refresh token
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.get('User-Agent') || '',
      ipAddress: req.ip || 'unknown'
    });

    // Limit stored refresh tokens (keep only last 5)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token as httpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days or 1 day
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Create login notification
    try {
      await NotificationModel.create({
        user: user._id,
        type: 'security',
        title: 'New Login Detected',
        message: `Your account was accessed from ${req.get('User-Agent') || 'Unknown device'}`,
        priority: 'normal',
        channels: ['in-app'],
        data: {
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent'),
          loginTime: new Date().toISOString()
        }
      });
    } catch (notificationError) {
      console.error('Failed to create login notification:', notificationError);
      // Continue with login even if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile
        },
        accessToken,
        expiresIn: '15m'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: 'Refresh token not provided'
      });
      return;
    }

    let decoded;
    try {
      // Verify refresh token
      decoded = AuthUtils.verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
      return;
    }
    
    // Find user and check if refresh token exists
    const user = await UserModel.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
      return;
    }

    // Check if refresh token exists and is not expired
    const tokenIndex = (user.refreshTokens || []).findIndex(
      rt => rt.token === refreshToken && rt.expiresAt > new Date()
    );

    if (tokenIndex === -1) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
      return;
    }

    // Generate new access token
    const tokenPayload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isEmailVerified
    };

    const { accessToken } = AuthUtils.generateTokenPair(tokenPayload);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        expiresIn: '15m'
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const user = req.user;

    if (user && refreshToken && user.refreshTokens) {
      // Remove refresh token from user's tokens
      user.refreshTokens = user.refreshTokens.filter(
        rt => rt.token !== refreshToken
      );
      await user.save();
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during logout'
    });
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
      return;
    }

    const hashedToken = AuthUtils.hashToken(token);

    // Find user with matching token
    const user = await UserModel.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
      return;
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Create verification success notification
    await NotificationModel.create({
      user: user._id,
      type: 'success',
      title: 'Email Verified Successfully!',
      message: 'Your email has been verified. You can now enjoy all features of DivyaYatri.',
      priority: 'normal',
      channels: ['in-app']
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during email verification'
    });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
      return;
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    };

    if (!user) {
      res.status(200).json(successResponse);
      return;
    }

    // Generate password reset token
    const { token: resetToken, hashedToken, expiresAt } = 
      AuthUtils.generatePasswordResetToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;
    await user.save();

    // Send password reset email
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: email,
        subject: 'Password Reset - DivyaYatri',
        template: 'password-reset',
        data: {
          name: user.name,
          resetUrl,
          expiresIn: '1 hour'
        }
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to prevent email enumeration
    }

    res.status(200).json(successResponse);

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
      return;
    }

    // Validate new password
    const passwordValidation = AuthUtils.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
      return;
    }

    const hashedToken = AuthUtils.hashToken(token);

    // Find user with valid reset token
    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired password reset token'
      });
      return;
    }

    // Hash new password
    const hashedPassword = await AuthUtils.hashPassword(newPassword);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    // Create password change notification
    await NotificationModel.create({
      user: user._id,
      type: 'security',
      title: 'Password Changed Successfully',
      message: 'Your password has been changed. If this wasn\'t you, please contact support immediately.',
      priority: 'high',
      channels: ['email', 'in-app']
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Google OAuth login
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        error: 'Google credential is required'
      });
      return;
    }

    let ticket;
    try {
      // Verify Google token
      if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID not configured');
      }
      
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verificationError) {
      console.error('Google token verification failed:', verificationError);
      res.status(400).json({
        success: false,
        error: 'Invalid Google credential'
      });
      return;
    }

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({
        success: false,
        error: 'Invalid Google credential'
      });
      return;
    }

    const { email, name, picture, email_verified } = payload;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email not provided by Google'
      });
      return;
    }

    // Find or create user
    let user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user
      user = new UserModel({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        isEmailVerified: email_verified || false,
        role: 'user',
        profile: {
          avatar: picture,
          preferences: {
            language: 'en',
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          }
        },
        authProviders: ['google'],
        refreshTokens: []
      });
    } else {
      // Update existing user
      if (!user.authProviders) {
        user.authProviders = [];
      }
      if (!user.authProviders.includes('google')) {
        user.authProviders.push('google');
      }
      user.isEmailVerified = email_verified || user.isEmailVerified;
      if (picture && (!user.profile || !user.profile.avatar)) {
        if (!user.profile) {
          user.profile = {};
        }
        user.profile.avatar = picture;
      }
    }

    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokenPayload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isEmailVerified
    };

    const { accessToken, refreshToken } = AuthUtils.generateTokenPair(tokenPayload);

    // Store refresh token
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.get('User-Agent') || '',
      ipAddress: req.ip || 'unknown'
    });

    await user.save();

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile
        },
        accessToken,
        expiresIn: '15m'
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during Google authentication'
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  googleAuth,
  getProfile
};