import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export class JWTUtils {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
  private static readonly JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

  /**
   * Generate JWT token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRE,
      issuer: 'divyayatri-api',
      audience: 'divyayatri-app'
    } as jwt.SignOptions);
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET, {
        issuer: 'divyayatri-api',
        audience: 'divyayatri-app'
      } as jwt.VerifyOptions) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate random token for password reset/email verification
   */
  static generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a token for secure storage
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(): Date {
    const expiresIn = this.JWT_EXPIRE;
    let expireTime: number;

    if (expiresIn.includes('d')) {
      expireTime = parseInt(expiresIn) * 24 * 60 * 60 * 1000;
    } else if (expiresIn.includes('h')) {
      expireTime = parseInt(expiresIn) * 60 * 60 * 1000;
    } else if (expiresIn.includes('m')) {
      expireTime = parseInt(expiresIn) * 60 * 1000;
    } else {
      expireTime = parseInt(expiresIn) * 1000;
    }

    return new Date(Date.now() + expireTime);
  }
}