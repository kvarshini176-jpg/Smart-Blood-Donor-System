/**
 * Notification Service
 * Stores notifications in the database and provides retrieval/read management.
 */

class NotificationService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create a notification record for a user
   */
  async createNotification({ userId, title, message, type, relatedEntityId = null }) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          relatedEntityId,
          isRead: false
        }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Notify multiple users (e.g. matched compatible donors)
   */
  async notifyMany(notifications) {
    try {
      if (!notifications || notifications.length === 0) return [];
      return await this.prisma.notification.createMany({
        data: notifications.map(n => ({
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          relatedEntityId: n.relatedEntityId || null,
          isRead: false
        }))
      });
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      return null;
    }
  }

  /**
   * Get user notifications with unread count
   */
  async getUserNotifications(userId, limit = 50) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId, userId) {
    return await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId) {
    return await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}

module.exports = NotificationService;
