import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  googleAuth,
  getProfile,
  loginRateLimit,
  registerRateLimit,
  passwordResetRateLimit
} from '../controllers/enhancedAuthController';
import { authenticate, requireEmailVerification, corsWithAuth } from '../middleware/enhancedAuth';

const router = express.Router();

// Apply CORS middleware
router.use(corsWithAuth);

// General rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { error: 'Too many authentication requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
router.use(authRateLimit);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerRateLimit, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginRateLimit, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires refresh token)
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify user email address
 * @access  Public
 */
router.get('/verify-email', verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: { error: 'Too many verification emails sent, please try again later' }
}), async (req, res) => {
  // This would be implemented in the controller
  res.status(501).json({
    success: false,
    error: 'Resend verification not yet implemented'
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', passwordResetRateLimit, requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post('/reset-password', passwordResetRateLimit, resetPassword);

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth authentication
 * @access  Public
 */
router.post('/google', googleAuth);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, async (req, res) => {
  // This would be implemented in the controller
  res.status(501).json({
    success: false,
    error: 'Profile update not yet implemented'
  });
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticate, requireEmailVerification, async (req, res) => {
  // This would be implemented in the controller
  res.status(501).json({
    success: false,
    error: 'Change password not yet implemented'
  });
});

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, async (req, res) => {
  // This would be implemented in the controller
  res.status(501).json({
    success: false,
    error: 'Logout all not yet implemented'
  });
});

/**
 * @route   GET /api/auth/sessions
 * @desc    Get active sessions
 * @access  Private
 */
router.get('/sessions', authenticate, async (req, res) => {
  // This would be implemented in the controller
  res.status(501).json({
    success: false,
    error: 'Get sessions not yet implemented'
  });
});

/**
 * @route   DELETE /api/auth/sessions/:sessionId
 * @desc    Revoke specific session
 * @access  Private
 */
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  // This would be implemented in the controller
  res.status(501).json({
    success: false,
    error: 'Revoke session not yet implemented'
  });
});

/**
 * @route   POST /api/auth/enable-2fa
 * @desc    Enable two-factor authentication
 * @access  Private
 */
router.post('/enable-2fa', authenticate, requireEmailVerification, async (req, res) => {
  // This would be implemented in the controller
  res.status(501).json({
    success: false,
    error: '2FA not yet implemented'
  });
});

/**
 * @route   POST /api/auth/verify-2fa
 * @desc    Verify two-factor authentication code
 * @access  Private
 */
router.post('/verify-2fa', authenticate, async (req, res) => {
  // This would be implemented in the controller
  res.status(501).json({
    success: false,
    error: '2FA verification not yet implemented'
  });
});

/**
 * @route   POST /api/auth/disable-2fa
 * @desc    Disable two-factor authentication
 * @access  Private
 */
router.post('/disable-2fa', authenticate, requireEmailVerification, async (req, res) => {
  // This would be implemented in the controller
  res.status(501).json({
    success: false,
    error: 'Disable 2FA not yet implemented'
  });
});

/**
 * @route   GET /api/auth/check
 * @desc    Check if user is authenticated (health check)
 * @access  Private
 */
router.get('/check', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User is authenticated',
    user: {
      id: req.user?._id,
      email: req.user?.email,
      role: req.user?.role,
      isVerified: req.user?.isVerified
    }
  });
});

export default router;