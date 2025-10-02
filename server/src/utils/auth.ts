import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'temple_admin';
  isVerified: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthUtils {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly RESET_TOKEN_EXPIRY = '1h';
  
  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate access and refresh token pair
   */
  static generateTokenPair(payload: JWTPayload): TokenPair {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JWTPayload;
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
  }

  /**
   * Generate secure random token for email verification and password reset
   */
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate password reset token with expiry
   */
  static generatePasswordResetToken(): {
    token: string;
    hashedToken: string;
    expiresAt: Date;
  } {
    const token = this.generateSecureToken();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return { token, hashedToken, expiresAt };
  }

  /**
   * Hash token for storage
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(): {
    token: string;
    hashedToken: string;
    expiresAt: Date;
  } {
    const token = this.generateSecureToken();
    const hashedToken = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return { token, hashedToken, expiresAt };
  }

  /**
   * Extract token from Authorization header
   */
  static extractBearerToken(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Generate secure session ID
   */
  static generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate OTP for 2FA
   */
  static generateOTP(): {
    otp: string;
    hashedOTP: string;
    expiresAt: Date;
  } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = this.hashToken(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return { otp, hashedOTP, expiresAt };
  }

  /**
   * Rate limiting helper
   */
  static createRateLimitKey(ip: string, action: string): string {
    return `rate_limit:${action}:${ip}`;
  }

  /**
   * Generate Google OAuth state parameter
   */
  static generateOAuthState(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Verify OAuth state parameter
   */
  static verifyOAuthState(receivedState: string, storedState: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(receivedState, 'hex'),
      Buffer.from(storedState, 'hex')
    );
  }
}

export default AuthUtils;