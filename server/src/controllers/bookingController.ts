import { Request, Response } from 'express';

// bookingController minimal stubs to ensure TypeScript parses the server project.

export const getUserBookings = async (_req: Request, res: Response) => {
  res.json({ success: true, data: { bookings: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } } });
};

export const getBookingById = async (_req: Request, res: Response) => {
  res.json({ success: true, data: { booking: null } });
};

export const createBooking = async (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'stub' });
};

export const updatePaymentStatus = async (_req: Request, res: Response) => {
  res.json({ success: true, message: 'stub' });
};

export const cancelBooking = async (_req: Request, res: Response) => {
  res.json({ success: true, message: 'stub' });
};

export const getAvailableSlots = async (_req: Request, res: Response) => {
  res.json({ success: true, data: { slots: [] } });
};

export const checkInBooking = async (_req: Request, res: Response) => {
  res.json({ success: true, message: 'stub' });
};

export const completeBooking = async (_req: Request, res: Response) => {
  res.json({ success: true, message: 'stub' });
};
