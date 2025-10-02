import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/jwt';
import UserModel, { User } from '../models/User';

// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Middleware to authenticate user using JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = JWTUtils.verifyToken(token);
    const user = await UserModel.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        error: 'Account not verified. Please verify your email.'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token.'
    });
  }
};

/**
 * Middleware to authorize specific roles
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Access denied. User not authenticated.'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware for optional authentication (user may or may not be logged in)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = JWTUtils.verifyToken(token);
      const user = await UserModel.findById(decoded.id).select('-password');
      
      if (user && user.isVerified) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Middleware to check if user owns the resource or is admin
 */
export const ownerOrAdmin = (resourceUserField: string = 'user') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Access denied. User not authenticated.'
      });
      return;
    }

    // Admins can access any resource
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Check if user owns the resource
    const resourceUserId = req.body[resourceUserField] || req.params.userId;
    if (req.user._id.toString() === resourceUserId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own resources.'
    });
  };
};