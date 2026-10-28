const express = require('express');
const authenticate = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

function createAuthRoutes(authController) {
  const router = express.Router();

  router.post('/register-donor', authLimiter, authController.registerDonor);
  router.post('/register-hospital', authLimiter, authController.registerHospital);
  router.post('/login', authLimiter, authController.login);
  router.get('/me', authenticate, authController.getMe);

  return router;
}

module.exports = createAuthRoutes;
