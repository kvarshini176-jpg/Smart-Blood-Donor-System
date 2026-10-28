const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { isValidEmail, isValidPhone, isValidBloodGroup } = require('../utils/validator');
const { normalizeGroup } = require('../services/bloodCompatibility');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

class AuthController {
  constructor(prisma, notificationService, auditLogService) {
    this.prisma = prisma;
    this.notificationService = notificationService;
    this.auditLogService = auditLogService;
  }

  // 1. Register Donor
  registerDonor = async (req, res, next) => {
    try {
      const {
        fullName,
        email,
        password,
        bloodGroup,
        phone,
        gender,
        dateOfBirth,
        age,
        state,
        city,
        locality,
        address,
        latitude,
        longitude,
        lastDonationDate,
        isAvailable
      } = req.body;

      // Validation
      if (!fullName || !email || !password || !bloodGroup || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Full name, email, password, blood group, and phone number are required.'
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address format.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }

      if (!isValidBloodGroup(bloodGroup)) {
        return res.status(400).json({ success: false, message: 'Invalid blood group. Supported: A+, A-, B+, B-, AB+, AB-, O+, O-.' });
      }

      if (!isValidPhone(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (existingUser) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const normalizedBlood = normalizeGroup(bloodGroup);

      // Create User and DonorProfile
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase().trim(),
            passwordHash,
            role: 'DONOR',
            isActive: true
          }
        });

        const profile = await tx.donorProfile.create({
          data: {
            userId: user.id,
            fullName: fullName.trim(),
            bloodGroup: normalizedBlood,
            phone: phone.trim(),
            gender: gender || null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            age: age ? parseInt(age, 10) : 25,
            state: state || 'State',
            city: city || 'City',
            locality: locality || 'Locality',
            address: address || 'Address',
            latitude: latitude != null ? parseFloat(latitude) : null,
            longitude: longitude != null ? parseFloat(longitude) : null,
            lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
            isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
          }
        });

        return { user, profile };
      });

      // Audit Log & Welcome Notification
      await this.auditLogService.log({
        userId: result.user.id,
        action: 'DONOR_REGISTERED',
        entityType: 'User',
        entityId: result.user.id,
        details: { bloodGroup: normalizedBlood, city },
        ipAddress: req.ip
      });

      await this.notificationService.createNotification({
        userId: result.user.id,
        title: 'Welcome to Smart Blood Donor System',
        message: 'Thank you for registering as a life-saving blood donor! You will receive alerts when compatible requests match your blood type.',
        type: 'SYSTEM_WELCOME'
      });

      const token = generateToken(result.user);

      return res.status(201).json({
        success: true,
        message: 'Donor account registered successfully.',
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          donorProfile: result.profile
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // 2. Register Hospital
  registerHospital = async (req, res, next) => {
    try {
      const {
        hospitalName,
        regNumber,
        contactPerson,
        contactPhone,
        email,
        password,
        address,
        state,
        city,
        locality,
        latitude,
        longitude
      } = req.body;

      if (!hospitalName || !regNumber || !email || !password || !contactPhone || !contactPerson) {
        return res.status(400).json({
          success: false,
          message: 'Hospital name, registration number, authorized contact, phone, email, and password are required.'
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address format.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (existingUser) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase().trim(),
            passwordHash,
            role: 'HOSPITAL',
            isActive: true
          }
        });

        const profile = await tx.hospitalProfile.create({
          data: {
            userId: user.id,
            hospitalName: hospitalName.trim(),
            regNumber: regNumber.trim(),
            contactPerson: contactPerson.trim(),
            contactPhone: contactPhone.trim(),
            email: email.toLowerCase().trim(),
            address: address || 'Hospital Address',
            state: state || 'State',
            city: city || 'City',
            locality: locality || 'Locality',
            latitude: latitude != null ? parseFloat(latitude) : null,
            longitude: longitude != null ? parseFloat(longitude) : null,
            verificationStatus: 'PENDING'
          }
        });

        await tx.hospitalVerification.create({
          data: {
            hospitalId: profile.id,
            status: 'PENDING',
            reviewNotes: 'New registration submitted. Pending admin review.'
          }
        });

        return { user, profile };
      });

      await this.auditLogService.log({
        userId: result.user.id,
        action: 'HOSPITAL_REGISTERED',
        entityType: 'HospitalProfile',
        entityId: result.profile.id,
        details: { hospitalName, regNumber },
        ipAddress: req.ip
      });

      await this.notificationService.createNotification({
        userId: result.user.id,
        title: 'Hospital Registration Pending Review',
        message: 'Your healthcare facility registration has been submitted and is currently pending administrator verification.',
        type: 'VERIFICATION_UPDATE',
        relatedEntityId: result.profile.id
      });

      const token = generateToken(result.user);

      return res.status(201).json({
        success: true,
        message: 'Hospital registered successfully. Account is pending administrator verification.',
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          hospitalProfile: result.profile
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // 3. Login
  login = async (req, res, next) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
          donorProfile: true,
          hospitalProfile: true
        }
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact administration.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (role && user.role.toUpperCase() !== role.toUpperCase()) {
        return res.status(403).json({
          success: false,
          message: `This account is registered with role '${user.role}', not '${role}'. Please use the appropriate login portal.`
        });
      }

      const token = generateToken(user);

      await this.auditLogService.log({
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        details: { role: user.role },
        ipAddress: req.ip
      });

      const userResponse = {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        donorProfile: user.donorProfile,
        hospitalProfile: user.hospitalProfile
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: userResponse
      });
    } catch (err) {
      next(err);
    }
  };

  // 4. Current User Profile (/me)
  getMe = async (req, res, next) => {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          donorProfile: true,
          hospitalProfile: true
        }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const unreadCount = await this.prisma.notification.count({
        where: { userId: user.id, isRead: false }
      });

      return res.status(200).json({
        success: true,
        user: {
          ...user,
          unreadNotifications: unreadCount
        }
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = AuthController;
