import express from 'express';
import { 
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  refundPayment
} from '../controllers/paymentController';
import { authenticate as auth } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Create payment order
router.post('/create-order', createPaymentOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Get payment status
router.get('/:paymentId/status', getPaymentStatus);

// Process refund
router.post('/:paymentId/refund', refundPayment);

export default router;