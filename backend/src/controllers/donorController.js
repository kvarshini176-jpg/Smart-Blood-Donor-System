const { isCompatible, getCompatibilityLevel } = require('../services/bloodCompatibility');
const { calculateDistanceKm } = require('../utils/distance');

class DonorController {
  constructor(prisma, notificationService, auditLogService) {
    this.prisma = prisma;
    this.notificationService = notificationService;
    this.auditLogService = auditLogService;
  }

  // Get Donor's profile with key summary metrics
  getProfile = async (req, res, next) => {
    try {
      const donor = await this.prisma.donorProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          user: { select: { email: true, isActive: true, createdAt: true } },
          _count: {
            select: {
              donations: true,
              responses: true
            }
          }
        }
      });

      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found.' });
      }

      // Compute days since last donation
      let daysSinceLastDonation = null;
      let isEligibleByDate = true;
      if (donor.lastDonationDate) {
        const diffMs = Date.now() - new Date(donor.lastDonationDate).getTime();
        daysSinceLastDonation = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (daysSinceLastDonation < 56) {
          isEligibleByDate = false;
        }
      }

      return res.status(200).json({
        success: true,
        profile: {
          ...donor,
          daysSinceLastDonation,
          isEligibleByDate,
          totalCompletedDonations: donor._count.donations,
          totalResponses: donor._count.responses
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // Update Donor's profile (availability, address, coordinates, etc.)
  updateProfile = async (req, res, next) => {
    try {
      const {
        phone,
        state,
        city,
        locality,
        address,
        isAvailable,
        lastDonationDate,
        latitude,
        longitude
      } = req.body;

      const updated = await this.prisma.donorProfile.update({
        where: { userId: req.user.id },
        data: {
          ...(phone ? { phone: phone.trim() } : {}),
          ...(state ? { state: state.trim() } : {}),
          ...(city ? { city: city.trim() } : {}),
          ...(locality ? { locality: locality.trim() } : {}),
          ...(address ? { address: address.trim() } : {}),
          ...(isAvailable !== undefined ? { isAvailable: Boolean(isAvailable) } : {}),
          ...(lastDonationDate ? { lastDonationDate: new Date(lastDonationDate) } : {}),
          ...(latitude != null ? { latitude: parseFloat(latitude) } : {}),
          ...(longitude != null ? { longitude: parseFloat(longitude) } : {})
        }
      });

      await this.auditLogService.log({
        userId: req.user.id,
        action: 'DONOR_PROFILE_UPDATED',
        entityType: 'DonorProfile',
        entityId: updated.id,
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        profile: updated
      });
    } catch (err) {
      next(err);
    }
  };

  // Get Compatible Blood Requests matching donor's blood group
  getMatchingRequests = async (req, res, next) => {
    try {
      const donor = await this.prisma.donorProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found.' });
      }

      // Fetch open or responses-received requests from verified hospitals
      const requests = await this.prisma.bloodRequest.findMany({
        where: {
          status: { in: ['OPEN', 'RESPONSES_RECEIVED', 'IN_PROGRESS'] },
          requiredDate: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // not expired beyond 1 day
        },
        include: {
          hospital: {
            select: {
              id: true,
              hospitalName: true,
              city: true,
              state: true,
              locality: true,
              latitude: true,
              longitude: true,
              verificationStatus: true
            }
          },
          responses: {
            where: { donorId: donor.id },
            select: { id: true, status: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Filter by blood compatibility
      const compatibleRequests = requests
        .filter(r => isCompatible(donor.bloodGroup, r.bloodGroup))
        .map(r => {
          const distanceKm = calculateDistanceKm(
            donor.latitude,
            donor.longitude,
            r.hospital.latitude,
            r.hospital.longitude
          );

          const hasResponded = r.responses.length > 0;
          const userResponse = hasResponded ? r.responses[0] : null;

          return {
            id: r.id,
            patientNameOrId: r.patientNameOrId,
            patientAge: r.patientAge,
            bloodGroup: r.bloodGroup,
            unitsRequired: r.unitsRequired,
            unitsFulfilled: r.unitsFulfilled,
            urgency: r.urgency,
            requiredDate: r.requiredDate,
            notes: r.notes,
            status: r.status,
            createdAt: r.createdAt,
            hospital: {
              id: r.hospital.id,
              hospitalName: r.hospital.hospitalName,
              city: r.hospital.city,
              state: r.hospital.state,
              locality: r.hospital.locality
            },
            distanceKm,
            compatibilityLevel: getCompatibilityLevel(donor.bloodGroup, r.bloodGroup),
            hasResponded,
            userResponseStatus: userResponse ? userResponse.status : null,
            userResponseId: userResponse ? userResponse.id : null
          };
        });

      // Sort by Urgency priority then distance
      const urgencyRank = { CRITICAL: 3, HIGH: 2, NORMAL: 1 };
      compatibleRequests.sort((a, b) => {
        const uDiff = (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0);
        if (uDiff !== 0) return uDiff;
        return a.distanceKm - b.distanceKm;
      });

      return res.status(200).json({
        success: true,
        count: compatibleRequests.length,
        requests: compatibleRequests
      });
    } catch (err) {
      next(err);
    }
  };

  // Express interest in donating for a request
  expressInterest = async (req, res, next) => {
    try {
      const { requestId } = req.params;
      const { notes } = req.body;

      const donor = await this.prisma.donorProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found.' });
      }

      const request = await this.prisma.bloodRequest.findUnique({
        where: { id: requestId },
        include: {
          hospital: {
            select: { id: true, userId: true, hospitalName: true }
          }
        }
      });

      if (!request) {
        return res.status(404).json({ success: false, message: 'Blood request not found.' });
      }

      if (['FULFILLED', 'CANCELLED', 'EXPIRED'].includes(request.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot express interest in a ${request.status.toLowerCase()} request.`
        });
      }

      // Check compatibility
      if (!isCompatible(donor.bloodGroup, request.bloodGroup)) {
        return res.status(400).json({
          success: false,
          message: `Your blood group (${donor.bloodGroup}) is not compatible with recipient request (${request.bloodGroup}).`
        });
      }

      // Check duplicate response
      const existing = await this.prisma.donorResponse.findUnique({
        where: {
          requestId_donorId: {
            requestId: request.id,
            donorId: donor.id
          }
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted your interest for this blood request.',
          response: existing
        });
      }

      // Create DonorResponse and update Request status
      const response = await this.prisma.$transaction(async (tx) => {
        const resp = await tx.donorResponse.create({
          data: {
            requestId: request.id,
            donorId: donor.id,
            status: 'INTERESTED',
            notes: notes || null
          }
        });

        if (request.status === 'OPEN') {
          await tx.bloodRequest.update({
            where: { id: request.id },
            data: { status: 'RESPONSES_RECEIVED' }
          });
        }

        return resp;
      });

      // Audit Log
      await this.auditLogService.log({
        userId: req.user.id,
        action: 'DONOR_INTEREST_EXPRESSED',
        entityType: 'DonorResponse',
        entityId: response.id,
        details: { requestId: request.id, hospitalName: request.hospital.hospitalName },
        ipAddress: req.ip
      });

      // Notify Hospital
      await this.notificationService.createNotification({
        userId: request.hospital.userId,
        title: 'New Interested Donor',
        message: `${donor.fullName} (${donor.bloodGroup}) expressed interest in your blood request for ${request.patientNameOrId} (${request.bloodGroup}).`,
        type: 'INTEREST_EXPRESSED',
        relatedEntityId: request.id
      });

      // Notify Donor Confirmation
      await this.notificationService.createNotification({
        userId: req.user.id,
        title: 'Donation Interest Submitted',
        message: `Your interest to donate for ${request.hospital.hospitalName} has been recorded. The hospital will review your response shortly.`,
        type: 'INTEREST_EXPRESSED',
        relatedEntityId: request.id
      });

      return res.status(201).json({
        success: true,
        message: 'Your interest has been submitted successfully to the hospital.',
        response
      });
    } catch (err) {
      next(err);
    }
  };

  // Withdraw interest
  withdrawInterest = async (req, res, next) => {
    try {
      const { requestId } = req.params;

      const donor = await this.prisma.donorProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found.' });
      }

      const existing = await this.prisma.donorResponse.findUnique({
        where: {
          requestId_donorId: {
            requestId,
            donorId: donor.id
          }
        },
        include: {
          request: {
            include: { hospital: { select: { userId: true, hospitalName: true } } }
          }
        }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Response record not found.' });
      }

      if (['COMPLETED'].includes(existing.status)) {
        return res.status(400).json({ success: false, message: 'Cannot withdraw a completed donation.' });
      }

      const updated = await this.prisma.donorResponse.update({
        where: { id: existing.id },
        data: { status: 'WITHDRAWN' }
      });

      await this.auditLogService.log({
        userId: req.user.id,
        action: 'DONOR_INTEREST_WITHDRAWN',
        entityType: 'DonorResponse',
        entityId: updated.id,
        ipAddress: req.ip
      });

      await this.notificationService.createNotification({
        userId: existing.request.hospital.userId,
        title: 'Donor Withdrew Interest',
        message: `${donor.fullName} withdrew interest for request ${existing.request.patientNameOrId}.`,
        type: 'STATUS_CHANGE',
        relatedEntityId: requestId
      });

      return res.status(200).json({
        success: true,
        message: 'Your response has been withdrawn.',
        response: updated
      });
    } catch (err) {
      next(err);
    }
  };

  // List all responses submitted by this donor
  getDonorResponses = async (req, res, next) => {
    try {
      const donor = await this.prisma.donorProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found.' });
      }

      const responses = await this.prisma.donorResponse.findMany({
        where: { donorId: donor.id },
        include: {
          request: {
            include: {
              hospital: {
                select: {
                  hospitalName: true,
                  contactPhone: true,
                  email: true,
                  city: true,
                  state: true,
                  address: true
                }
              }
            }
          },
          donation: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        responses
      });
    } catch (err) {
      next(err);
    }
  };

  // Donation History & Impact Metrics
  getHistory = async (req, res, next) => {
    try {
      const donor = await this.prisma.donorProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found.' });
      }

      const donations = await this.prisma.donation.findMany({
        where: { donorId: donor.id, status: 'CONFIRMED' },
        include: {
          hospital: {
            select: { hospitalName: true, city: true, state: true }
          },
          request: {
            select: { patientNameOrId: true, bloodGroup: true, urgency: true }
          }
        },
        orderBy: { donationDate: 'desc' }
      });

      const totalUnits = donations.reduce((sum, d) => sum + d.unitsDonated, 0);
      const estimatedLivesSaved = totalUnits * 3;

      return res.status(200).json({
        success: true,
        donations,
        summary: {
          totalDonations: donations.length,
          totalUnits,
          estimatedLivesSaved
        }
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = DonorController;
