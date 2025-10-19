import Booking from '../models/Booking';

export const validateBookingSlot = async (
  templeId: string,
  visitDate: Date,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  try {
    // Set the date range for the specific day
    const startOfDay = new Date(visitDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(visitDate.setHours(23, 59, 59, 999));

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      temple: templeId,
      visitDate: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      $or: [
        {
          'timeSlot.start': { $lt: endTime },
          'timeSlot.end': { $gt: startTime }
        }
      ],
      bookingStatus: { $in: ['confirmed', 'pending'] }
    });

    // Check capacity (max 50 visitors per slot)
    const maxCapacity = 50;
    const currentBookings = overlappingBookings.filter(booking =>
      booking.timeSlot.start === startTime && booking.timeSlot.end === endTime
    );

    const totalVisitors = currentBookings.reduce((total, booking: any) => {
      // booking.totalVisitors is a virtual; compute defensively
      const visitors = (booking.visitors && (booking.visitors.adults || 0) + (booking.visitors.children || 0) + (booking.visitors.seniors || 0)) || 0;
      return total + visitors;
    }, 0);

    return totalVisitors < maxCapacity;
  } catch (error) {
    console.error('Error validating booking slot:', error);
    return false;
  }
};

export const getBookingStatistics = async (templeId?: string) => {
  try {
    const matchStage: any = {
      bookingStatus: { $in: ['confirmed', 'completed'] }
    };

    if (templeId) {
      matchStage.temple = templeId;
    }

    const stats = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$finalAmount' },
          averageBookingValue: { $avg: '$finalAmount' },
          totalVisitors: { $sum: '$totalVisitors' }
        }
      }
    ]);

    return stats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      totalVisitors: 0
    };
  } catch (error) {
    console.error('Error getting booking statistics:', error);
    throw error;
  }
};

export const getPopularTimeSlots = async (templeId: string, days = 30) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);

    const popularSlots = await Booking.aggregate([
      {
        $match: {
          temple: templeId,
          bookingStatus: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            start: '$timeSlot.start',
            end: '$timeSlot.end'
          },
          bookingCount: { $sum: 1 },
          totalVisitors: { $sum: '$totalVisitors' }
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return popularSlots;
  } catch (error) {
    console.error('Error getting popular time slots:', error);
    throw error;
  }
};