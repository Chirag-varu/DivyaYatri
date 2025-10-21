import apiClient from '../apiClient';
import { API_ROUTES } from '../apiRoutes';

export interface RazorpayOrder {
  id: string;
  entity: 'order';
  amount: number; // Amount in paise (smallest currency unit)
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface PaymentOrder {
  orderId: string;
  amount: number; // Amount in rupees
  currency: string;
  receipt: string;
  notes: {
    bookingId?: string;
    templeId?: string;
    userId?: string;
  };
}

export interface CreateOrderData {
  amount: number; // Amount in rupees
  currency?: string;
  receipt?: string;
  notes?: {
    bookingId?: string;
    templeId?: string;
    userId?: string;
  };
}

export interface VerifyPaymentData {
  orderId: string;
  paymentId: string;
  signature: string;
  bookingId?: string;
}

export interface PaymentStatus {
  id: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  amount: number;
  currency: string;
  order_id: string;
  method: string;
  captured: boolean;
  created_at: number;
}

export interface RefundData {
  amount?: number; // Amount to refund in rupees, if not provided, full amount will be refunded
  notes?: Record<string, string>;
}

// Create Razorpay order
export const createPaymentOrder = async (orderData: CreateOrderData): Promise<PaymentOrder> => {
  try {
    const response = await apiClient.post(API_ROUTES.payments.createOrder, orderData);
    return response.data.data.order;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw new Error('Failed to create payment order');
  }
};

// Verify payment after successful Razorpay payment
export const verifyPayment = async (verificationData: VerifyPaymentData): Promise<{
  verified: boolean;
  payment: PaymentStatus;
  booking?: any;
}> => {
  try {
    const response = await apiClient.post(API_ROUTES.payments.verifyPayment, verificationData);
    return response.data.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Failed to verify payment');
  }
};

// Get payment status
export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatus> => {
  try {
    const response = await apiClient.get(API_ROUTES.payments.getPaymentStatus(paymentId));
    return response.data.data.payment;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw new Error('Failed to fetch payment status');
  }
};

// Refund payment
export const refundPayment = async (
  paymentId: string,
  refundData?: RefundData
): Promise<{
  refund: any;
  payment: PaymentStatus;
}> => {
  try {
    const response = await apiClient.post(
      API_ROUTES.payments.refund(paymentId),
      refundData || {}
    );
    return response.data.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
};

// Razorpay integration utilities
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export const openRazorpay = async (options: RazorpayOptions): Promise<void> => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
};

// Declare Razorpay on window object for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  refundPayment,
  loadRazorpayScript,
  openRazorpay,
};