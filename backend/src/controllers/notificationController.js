class NotificationController {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  // Get notifications for current authenticated user
  getNotifications = async (req, res, next) => {
    try {
      const data = await this.notificationService.getUserNotifications(req.user.id, 50);
      return res.status(200).json({
        success: true,
        ...data
      });
    } catch (err) {
      next(err);
    }
  };

  // Mark single notification as read
  markAsRead = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.notificationService.markAsRead(id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Notification marked as read.'
      });
    } catch (err) {
      next(err);
    }
  };

  // Mark all notifications as read
  markAllAsRead = async (req, res, next) => {
    try {
      await this.notificationService.markAllAsRead(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read.'
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = NotificationController;
