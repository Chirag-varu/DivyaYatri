import express from 'express';
import { 
  getUserBookings,
  getBookingById,
  createBooking,
  updatePaymentStatus,
  cancelBooking,
  getAvailableSlots,
  checkInBooking,
  completeBooking
} from '../controllers/bookingController';
import { authenticate as auth } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Get user's bookings
router.get('/', getUserBookings);

// Get available time slots for a temple
router.get('/slots/:templeId', getAvailableSlots);

// Get specific booking
router.get('/:id', getBookingById);

// Create new booking
router.post('/', createBooking);

// Update payment status
router.patch('/:id/payment', updatePaymentStatus);

// Cancel booking
router.patch('/:id/cancel', cancelBooking);

// Check-in to booking
router.patch('/:id/checkin', checkInBooking);

// Complete booking (check-out)
router.patch('/:id/complete', completeBooking);

export default router;