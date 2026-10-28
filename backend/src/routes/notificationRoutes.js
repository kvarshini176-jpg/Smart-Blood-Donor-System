const express = require('express');
const authenticate = require('../middlewares/auth');

function createNotificationRoutes(notificationController) {
  const router = express.Router();

  router.use(authenticate);

  router.get('/', notificationController.getNotifications);
  router.patch('/:id/read', notificationController.markAsRead);
  router.patch('/read-all', notificationController.markAllAsRead);

  return router;
}

module.exports = createNotificationRoutes;
