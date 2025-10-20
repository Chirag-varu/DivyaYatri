import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Temple from '../models/Temple';
import { generateBookingQRCode } from '../utils/qrCode';
import { checkAvailability } from '../utils/booking';

type ReqWithUser = Request & { user?: { _id?: string | mongoose.Types.ObjectId } };

const toObjectId = (v: any): mongoose.Types.ObjectId | undefined => {
  try {
    return v ? new mongoose.Types.ObjectId(v) : undefined;
  } catch {
    return undefined;
  }
};

export const getUserBookings = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const userId = toObjectId(req.user?._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { status, page = 1, limit = 10 } = req.query as any;
    const query: any = { user: userId };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('temple', 'name city state images')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(query);

    return res.json({
      success: true,
      data: {
        bookings,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching bookings', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getBookingById = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = toObjectId(req.user?._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const booking = await Booking.findOne({ _id: id, user: userId })
      .populate('temple', 'name city state images contactInfo timings');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    return res.json({ success: true, data: { booking } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching booking', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const createBooking = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const userId = toObjectId(req.user?._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { templeId, date, timeSlot, numberOfVisitors, specialRequests, contactInfo } = req.body;

    const temple = await Temple.findById(templeId);
    if (!temple) return res.status(404).json({ success: false, message: 'Temple not found' });

    // Check availability
    const isAvailable = await checkAvailability(templeId, new Date(date), timeSlot, numberOfVisitors);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Selected time slot is not available' });
    }

    const bookingData = {
      user: userId,
      temple: toObjectId(templeId),
      visitDate: new Date(date),
      timeSlot: {
        start: timeSlot,
        end: `${(parseInt(timeSlot.split(':')[0]) + 1).toString().padStart(2, '0')}:${timeSlot.split(':')[1]}`
      },
      visitors: {
        adults: numberOfVisitors,
        children: 0,
        seniors: 0
      },
      totalAmount: 0,
      serviceFee: 0,
      finalAmount: 0,
      contactInfo: {
        name: contactInfo.name,
        phone: contactInfo.phone,
        email: contactInfo.email,
        specialRequests
      },
      paymentInfo: {
        paymentMethod: 'card' as const,
        paymentStatus: 'completed' as const
      },
      bookingStatus: 'confirmed' as const,
      remindersSent: {
        email: false,
        sms: false,
        push: false
      },
      metadata: {
        source: 'web' as const
      }
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Generate QR code
    const qrCode = await generateBookingQRCode(booking._id.toString());
    booking.qrCode = qrCode;
    await booking.save();

    await booking.populate('temple', 'name city state');

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating booking', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updatePaymentStatus = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, transactionId } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.paymentInfo.paymentStatus = paymentStatus;
    if (paymentMethod) booking.paymentInfo.paymentMethod = paymentMethod;
    if (transactionId) booking.paymentInfo.transactionId = transactionId;

    if (paymentStatus === 'completed') {
      booking.bookingStatus = 'confirmed';
    }

    await booking.save();

    return res.json({ success: true, message: 'Payment status updated', data: { booking } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating payment status', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const cancelBooking = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = toObjectId(req.user?._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const booking = await Booking.findOne({ _id: id, user: userId });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (typeof booking.canBeCancelled === 'function' && !booking.canBeCancelled()) {
      return res.status(400).json({ success: false, message: 'Booking cannot be cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = 'User requested cancellation';
    
    // Calculate refund if applicable
    const refundAmount = typeof (booking as any).calculateRefund === 'function' ? (booking as any).calculateRefund() : 0;
    
    await booking.save();

    return res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking, refundAmount }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error cancelling booking', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getAvailableSlots = async (req: Request, res: Response): Promise<any> => {
  try {
    const { templeId } = req.params;
    const { date } = req.query as any;

    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const temple = await Temple.findById(templeId);
    if (!temple) return res.status(404).json({ success: false, message: 'Temple not found' });

    const requestedDate = new Date(date);
    const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    
    // Get existing bookings for the date
    const existingBookings = await Booking.find({
      temple: templeId,
      visitDate: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      bookingStatus: { $in: ['confirmed', 'pending'] }
    });

    const availableSlots = slots.map(slot => {
      const bookingsForSlot = existingBookings.filter(booking => booking.timeSlot.start === slot);
      const totalVisitors = bookingsForSlot.reduce((sum, booking) => {
        const visitors = (booking.visitors?.adults || 0) + (booking.visitors?.children || 0) + (booking.visitors?.seniors || 0);
        return sum + visitors;
      }, 0);
      const maxCapacity = 50; // Default capacity
      
      return {
        time: slot,
        available: totalVisitors < maxCapacity,
        remainingCapacity: Math.max(0, maxCapacity - totalVisitors)
      };
    });

    return res.json({ success: true, data: { slots: availableSlots } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching available slots', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const checkInBooking = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.bookingStatus !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking is not confirmed' });
    }

    booking.bookingStatus = 'completed'; // Using existing status since there's no 'checked-in'
    booking.checkInTime = new Date();
    await booking.save();

    return res.json({ success: true, message: 'Booking checked in successfully', data: { booking } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error checking in booking', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const completeBooking = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.bookingStatus !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking must be confirmed first' });
    }

    booking.bookingStatus = 'completed';
    booking.checkOutTime = new Date();
    await booking.save();

    return res.json({ success: true, message: 'Booking completed successfully', data: { booking } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error completing booking', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
