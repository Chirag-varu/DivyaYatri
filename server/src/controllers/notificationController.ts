import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Notification from '../models/Notification';

// Get user notifications
export const getUserNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user?._id;

    const query: any = { recipient: userId };
    if (unreadOnly === 'true') {
      query['status.read'] = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('data.templeId', 'name city state')
      .populate('data.bookingId', 'bookingReference visitDate')
      .populate('createdBy', 'name avatar');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      'status.read': false
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    // Mark as read
    notification.status.read = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    await Notification.updateMany(
      { 
        recipient: userId,
        'status.read': false
      },
      { 
        'status.read': true,
        'deliveryDetails.readAt': new Date()
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Mark notification as clicked
export const markAsClicked = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    // Mark as clicked
    notification.status.clicked = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as clicked',
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as clicked',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get notification preferences
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getNotificationPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // const userId = req.user?._id; // TODO: Use for user-specific preferences

    // TODO: Fetch user-specific preferences from User model using userId
    // For now, return default preferences
    const preferences = {
      email: true,
      push: true,
      sms: false,
      inApp: true,
      types: {
        booking_confirmed: true,
        booking_reminder: true,
        review_reply: true,
        temple_update: true,
        admin_message: true,
        payment_success: true,
        payment_failed: true,
        booking_cancelled: true,
        new_review: false,
        system_maintenance: true
      }
    };

    res.json({
      success: true,
      data: { preferences }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification preferences',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // const userId = req.user?._id; // TODO: Use for user-specific preferences
    // TODO: Update user-specific preferences in User model using userId
    const { preferences } = req.body;

    // This would typically update a user preferences model
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: { preferences }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification preferences',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create notification (admin only)
export const createNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      recipient,
      type,
      title,
      message,
      data,
      priority = 'medium',
      scheduledFor
    } = req.body;

    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      data,
      priority,
      scheduledFor,
      createdBy: req.user?._id
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};