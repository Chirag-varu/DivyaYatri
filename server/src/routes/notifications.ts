import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  markAsClicked,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  createNotification
} from '../controllers/notificationController';
// import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
// router.use(auth);

// Get user notifications
router.get('/', getUserNotifications);

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

// Update notification preferences
router.put('/preferences', updateNotificationPreferences);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Mark notification as clicked
router.patch('/:id/clicked', markAsClicked);

// Delete notification
router.delete('/:id', deleteNotification);

// Create notification (admin only)
// router.post('/', adminAuth, createNotification);
router.post('/', createNotification);

export default router;