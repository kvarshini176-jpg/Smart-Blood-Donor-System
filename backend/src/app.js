const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const db = require('./db');

const NotificationService = require('./services/notificationService');
const AuditLogService = require('./services/auditLogService');

const AuthController = require('./controllers/authController');
const DonorController = require('./controllers/donorController');
const HospitalController = require('./controllers/hospitalController');
const AdminController = require('./controllers/adminController');
const NotificationController = require('./controllers/notificationController');

const createAuthRoutes = require('./routes/authRoutes');
const createDonorRoutes = require('./routes/donorRoutes');
const createHospitalRoutes = require('./routes/hospitalRoutes');
const createAdminRoutes = require('./routes/adminRoutes');
const createNotificationRoutes = require('./routes/notificationRoutes');

const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');

function createApp() {
  const app = express();

  // Security & Middleware
  app.use(helmet());
  app.use(cors({
    origin: '*', // Allows development from local frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // General API Rate Limiter
  app.use('/api', apiLimiter);

  // Initialize Services & Controllers
  const notificationService = new NotificationService(db);
  const auditLogService = new AuditLogService(db);

  const authController = new AuthController(db, notificationService, auditLogService);
  const donorController = new DonorController(db, notificationService, auditLogService);
  const hospitalController = new HospitalController(db, notificationService, auditLogService);
  const adminController = new AdminController(db, notificationService, auditLogService);
  const notificationController = new NotificationController(notificationService);

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      system: 'Smart Blood Donor Backend API',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Modules
  app.use('/api/auth', createAuthRoutes(authController));
  app.use('/api/donors', createDonorRoutes(donorController));
  app.use('/api/hospitals', createHospitalRoutes(hospitalController));
  app.use('/api/admin', createAdminRoutes(adminController));
  app.use('/api/notifications', createNotificationRoutes(notificationController));

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
