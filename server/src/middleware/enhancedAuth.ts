import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, {  User } from '../models/User';
import { AuthUtils } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  user?:  User;
  sessionId?: string;
}

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractBearerToken(authHeader || '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    // Verify JWT token
    const decoded = AuthUtils.verifyAccessToken(token);

    // Find user by ID
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Check if user is active (ensure 'status' exists safely)
    // Type assertion since User model may not declare 'status' in TypeScript
    if ((user as any).status !== 'active') {
      res.status(401).json({
        success: false,
        error: 'Account is not active'
      });
      return;
    }

    // Check if account is locked
    if ((user as any).lockUntil && (user as any).lockUntil > new Date()) {
      res.status(423).json({
        success: false,
        error: 'Account is temporarily locked'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid access token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Access token expired'
      });
    } else {
      console.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractBearerToken(authHeader || '');

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    // Verify JWT token
    const decoded = AuthUtils.verifyAccessToken(token);

    // Find user by ID
    const user = await UserModel.findById(decoded.userId);

    if (user && (user as any).status === 'active') {
      req.user = user;
    }

    next();

  } catch (error) {
    // Authentication failed, but continue without user
    next();
  }
};

/**
 * Role-based authorization middleware factory
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Email verification requirement middleware
 */
export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  if (!user.isVerified) {
    res.status(403).json({
      success: false,
      error: 'Email verification required',
      requiresEmailVerification: true
    });
    return;
  }

  next();
};

/**
 * Account lockout protection middleware
 */
export const checkAccountLock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      next();
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

    next();

  } catch (error) {
    console.error('Account lock check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources
 */
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Admin users can access all resources
    if (user.role === 'admin') {
      next();
      return;
    }

    // Check if user owns the resource
    if (user._id.toString() !== resourceUserId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources.'
      });
      return;
    }

    next();
  };
};

/**
 * Rate limiting bypass for authenticated users
 */
export const rateLimitBypass = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const user = req.user;

  // Authenticated users get higher rate limits
  if (user) {
    // You can implement custom rate limiting logic here
    // For now, just continue
  }

  next();
};

/**
 * Session validation middleware
 * Validates refresh token exists and is valid
 */
export const validateSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const user = req.user;

    if (!user || !refreshToken) {
      next();
      return;
    }

    // Check if refresh token exists and is valid
    const tokenExists = user.refreshTokens?.some(
      rt => rt.token === refreshToken && rt.expiresAt > new Date()
    );

    if (!tokenExists) {
      // Invalid session, clear cookie
      res.clearCookie('refreshToken');
      res.status(401).json({
        success: false,
        error: 'Invalid session. Please login again.'
      });
      return;
    }

    next();

  } catch (error) {
    console.error('Session validation error:', error);
    next(); // Continue even if session validation fails
  }
};

/**
 * API key authentication middleware (for external integrations)
 */
export const authenticateApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key required'
      });
      return;
    }

    // Find user by API key (you'd implement this in your User model)
    // const user = await UserModel.findOne({ apiKey: apiKey });

    // For now, just check against environment variable
    if (apiKey !== process.env.API_SECRET_KEY) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
      return;
    }

    // Continue without setting user for API key authentication
    next();

  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * CORS middleware with authentication awareness
 */
export const corsWithAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

  // Check if origin is allowed
  if (allowedOrigins.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  requireEmailVerification,
  checkAccountLock,
  requireOwnership,
  rateLimitBypass,
  validateSession,
  authenticateApiKey,
  corsWithAuth
};