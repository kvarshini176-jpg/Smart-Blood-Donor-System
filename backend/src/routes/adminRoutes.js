const express = require('express');
const authenticate = require('../middlewares/auth');
const requireRole = require('../middlewares/roleCheck');

function createAdminRoutes(adminController) {
  const router = express.Router();

  // Strict role guard: ADMIN only
  router.use(authenticate, requireRole(['ADMIN']));

  router.get('/stats', adminController.getStats);
  router.get('/donors', adminController.getDonors);
  router.get('/hospitals', adminController.getHospitals);
  router.patch('/hospitals/:id/verification', adminController.updateHospitalVerification);
  router.patch('/users/:id/status', adminController.updateUserStatus);
  router.get('/requests', adminController.getRequests);
  router.get('/donations', adminController.getDonations);
  router.get('/audit-logs', adminController.getAuditLogs);

  return router;
}

module.exports = createAdminRoutes;
