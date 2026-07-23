/**
 * Notification API service
 * Wraps all notification-related backend API calls.
 */
import api from './api';

const notificationService = {
  /**
   * Fetch all notifications for a user.
   * GET /api/notifications?email=...
   */
  getAll: async (email) => {
    return await api.get(`/notifications?email=${encodeURIComponent(email)}`);
  },

  /**
   * Fetch only unread notifications (for the bell panel).
   * GET /api/notifications/unread?email=...
   */
  getUnread: async (email) => {
    return await api.get(`/notifications/unread?email=${encodeURIComponent(email)}`);
  },

  /**
   * Get the unread notification count (for the badge).
   * GET /api/notifications/unread-count?email=...
   */
  getUnreadCount: async (email) => {
    return await api.get(`/notifications/unread-count?email=${encodeURIComponent(email)}`);
  },

  /**
   * Mark a single notification as read.
   * PUT /api/notifications/{id}/read
   */
  markAsRead: async (id) => {
    return await api.put(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications for a user as read.
   * PUT /api/notifications/read-all?email=...
   */
  markAllAsRead: async (email) => {
    return await api.put(`/notifications/read-all?email=${encodeURIComponent(email)}`);
  },
};

export default notificationService;
