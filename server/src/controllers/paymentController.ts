import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking';

type ReqWithUser = Request & { user?: { _id?: string } };

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export const createPaymentOrder = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        order: {
          orderId: order.id,
          amount: amount, // Return amount in rupees
          currency: order.currency,
          receipt: order.receipt,
          notes: order.notes,
        }
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const verifyPayment = async (req: ReqWithUser, res: Response): Promise<any> => {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, and Signature are required'
      });
    }

    // Verify payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isSignatureValid = expectedSignature === signature;

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    // Update booking if bookingId is provided
    let updatedBooking = null;
    if (bookingId) {
      updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          'paymentInfo.paymentStatus': 'completed',
          'paymentInfo.transactionId': paymentId,
          'paymentInfo.paymentMethod': payment.method as 'card' | 'upi' | 'cash',
          bookingStatus: 'confirmed'
        },
        { new: true }
      ).populate('temple', 'name city state');
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        verified: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: Number(payment.amount) / 100, // Convert back to rupees
          currency: payment.currency,
          order_id: payment.order_id,
          method: payment.method,
          captured: payment.captured,
          created_at: payment.created_at,
        },
        booking: updatedBooking
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    return res.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          status: payment.status,
          amount: Number(payment.amount) / 100, // Convert back to rupees
          currency: payment.currency,
          order_id: payment.order_id,
          method: payment.method,
          captured: payment.captured,
          created_at: payment.created_at,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const refundPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { paymentId } = req.params;
    const { amount, notes } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Fetch original payment to get the amount if not provided
    const payment = await razorpay.payments.fetch(paymentId);
    
    const refundOptions: any = {};
    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }
    if (notes) {
      refundOptions.notes = notes;
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    return res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund: {
          id: refund.id,
          amount: refund.amount ? Number(refund.amount) / 100 : 0, // Convert back to rupees
          currency: refund.currency,
          payment_id: refund.payment_id,
          status: refund.status,
          created_at: refund.created_at,
        },
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount ? Number(payment.amount) / 100 : 0,
          currency: payment.currency,
          method: payment.method,
        }
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};