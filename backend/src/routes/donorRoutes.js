const express = require('express');
const authenticate = require('../middlewares/auth');
const requireRole = require('../middlewares/roleCheck');

function createDonorRoutes(donorController) {
  const router = express.Router();

  // Protect all donor endpoints with JWT and role DONOR
  router.use(authenticate, requireRole(['DONOR']));

  router.get('/profile', donorController.getProfile);
  router.put('/profile', donorController.updateProfile);
  router.get('/matching-requests', donorController.getMatchingRequests);
  router.post('/responses/:requestId/interest', donorController.expressInterest);
  router.delete('/responses/:requestId/withdraw', donorController.withdrawInterest);
  router.get('/responses', donorController.getDonorResponses);
  router.get('/history', donorController.getHistory);

  return router;
}

module.exports = createDonorRoutes;
