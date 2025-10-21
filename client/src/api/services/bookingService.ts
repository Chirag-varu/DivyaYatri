import apiClient from '../apiClient';
import { API_ROUTES } from '../apiRoutes';

export interface Booking {
  _id: string;
  user: string;
  temple: {
    _id: string;
    name: string;
    city: string;
    state: string;
    images: string[];
    contactInfo: {
      phone: string;
      email: string;
    };
    timings: {
      open: string;
      close: string;
    };
  };
  visitDate: string;
  timeSlot: {
    start: string;
    end: string;
  };
  visitors: {
    adults: number;
    children: number;
    seniors: number;
  };
  totalAmount: number;
  serviceFee: number;
  finalAmount: number;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
    specialRequests?: string;
  };
  paymentInfo: {
    paymentMethod: 'card' | 'upi' | 'cash';
    paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
  };
  bookingStatus: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
  qrCode?: string; // Data URL for QR code image
  remindersSent: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  checkInTime?: string;
  checkOutTime?: string;
  cancellationReason?: string;
  metadata: {
    source: 'web' | 'mobile' | 'admin';
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  templeId: string;
  date: string;
  timeSlot: string;
  numberOfVisitors: number;
  specialRequests?: string;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface BookingSlot {
  _id: string;
  temple: string;
  date: string;
  timeSlot: string;
  maxCapacity: number;
  currentBookings: number;
  price: number;
  type: 'darshan' | 'special_puja' | 'aarti' | 'festival';
  isAvailable: boolean;
}

export interface UpdatePaymentData {
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: 'card' | 'upi' | 'cash';
  transactionId?: string;
}

// Get all user bookings
export const getUserBookings = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_ROUTES.bookings.getAll}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw new Error('Failed to fetch bookings');
  }
};

// Get booking by ID
export const getBookingById = async (id: string): Promise<Booking> => {
  try {
    const response = await apiClient.get(API_ROUTES.bookings.getById(id));
    return response.data.data.booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw new Error('Failed to fetch booking details');
  }
};

// Create new booking
export const createBooking = async (bookingData: CreateBookingData): Promise<Booking> => {
  try {
    const response = await apiClient.post(API_ROUTES.bookings.create, bookingData);
    return response.data.data.booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }
};

// Update payment status
export const updatePaymentStatus = async (
  bookingId: string,
  paymentData: UpdatePaymentData
): Promise<Booking> => {
  try {
    const response = await apiClient.patch(
      API_ROUTES.bookings.updatePayment(bookingId),
      paymentData
    );
    return response.data.data.booking;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string, reason?: string): Promise<{
  booking: Booking;
  refundAmount: number;
}> => {
  try {
    const response = await apiClient.patch(API_ROUTES.bookings.cancel(bookingId), {
      reason: reason || 'User requested cancellation'
    });
    return response.data.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw new Error('Failed to cancel booking');
  }
};

// Check in to booking
export const checkinBooking = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await apiClient.patch(API_ROUTES.bookings.checkin(bookingId));
    return response.data.data.booking;
  } catch (error) {
    console.error('Error checking in:', error);
    throw new Error('Failed to check in');
  }
};

// Complete booking (check out)
export const completeBooking = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await apiClient.patch(API_ROUTES.bookings.complete(bookingId));
    return response.data.data.booking;
  } catch (error) {
    console.error('Error completing booking:', error);
    throw new Error('Failed to complete booking');
  }
};

// Get available slots for a temple
export const getAvailableSlots = async (
  templeId: string,
  date: string
): Promise<BookingSlot[]> => {
  try {
    const response = await apiClient.get(
      `${API_ROUTES.bookings.getSlots(templeId)}?date=${date}`
    );
    return response.data.data.slots;
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw new Error('Failed to fetch available slots');
  }
};

export default {
  getUserBookings,
  getBookingById,
  createBooking,
  updatePaymentStatus,
  cancelBooking,
  checkinBooking,
  completeBooking,
  getAvailableSlots,
};