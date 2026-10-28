const express = require('express');
const authenticate = require('../middlewares/auth');
const requireRole = require('../middlewares/roleCheck');

function createHospitalRoutes(hospitalController) {
  const router = express.Router();

  // Protect all hospital endpoints with JWT and role HOSPITAL (or ADMIN)
  router.use(authenticate, requireRole(['HOSPITAL', 'ADMIN']));

  router.get('/profile', hospitalController.getProfile);
  router.put('/profile', hospitalController.updateProfile);

  // Blood Request management
  router.post('/requests', hospitalController.createRequest);
  router.get('/requests', hospitalController.getRequests);
  router.get('/requests/:id', hospitalController.getRequestById);
  router.put('/requests/:id', hospitalController.updateRequest);
  router.patch('/requests/:id/cancel', hospitalController.cancelRequest);

  // Compatible Donors & ML Ranking
  router.get('/requests/:id/compatible-donors', hospitalController.getCompatibleDonors);
  router.get('/requests/:id/responses', hospitalController.getInterestedDonors);

  // Status Lifecycle & Donation Confirmation
  router.patch('/responses/:responseId/status', hospitalController.updateResponseStatus);
  router.post('/requests/:id/complete-donation', hospitalController.completeDonation);
  router.get('/donations', hospitalController.getDonations);

  return router;
}

module.exports = createHospitalRoutes;
