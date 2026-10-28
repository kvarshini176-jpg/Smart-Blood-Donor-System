const { isCompatible, getCompatibilityLevel, normalizeGroup } = require('../services/bloodCompatibility');
const { calculateDistanceKm } = require('../utils/distance');
const { rankDonors } = require('../services/mlClient');

class HospitalController {
  constructor(prisma, notificationService, auditLogService) {
    this.prisma = prisma;
    this.notificationService = notificationService;
    this.auditLogService = auditLogService;
  }

  // Get Hospital Profile
  getProfile = async (req, res, next) => {
    try {
      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          user: { select: { email: true, isActive: true, createdAt: true } },
          _count: {
            select: {
              bloodRequests: true,
              donations: true
            }
          }
        }
      });

      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
      }

      return res.status(200).json({
        success: true,
        profile: {
          ...hospital,
          totalRequests: hospital._count.bloodRequests,
          totalCompletedDonations: hospital._count.donations
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // Update Hospital Profile
  updateProfile = async (req, res, next) => {
    try {
      const {
        hospitalName,
        contactPerson,
        contactPhone,
        address,
        state,
        city,
        locality,
        latitude,
        longitude
      } = req.body;

      const updated = await this.prisma.hospitalProfile.update({
        where: { userId: req.user.id },
        data: {
          ...(hospitalName ? { hospitalName: hospitalName.trim() } : {}),
          ...(contactPerson ? { contactPerson: contactPerson.trim() } : {}),
          ...(contactPhone ? { contactPhone: contactPhone.trim() } : {}),
          ...(address ? { address: address.trim() } : {}),
          ...(state ? { state: state.trim() } : {}),
          ...(city ? { city: city.trim() } : {}),
          ...(locality ? { locality: locality.trim() } : {}),
          ...(latitude != null ? { latitude: parseFloat(latitude) } : {}),
          ...(longitude != null ? { longitude: parseFloat(longitude) } : {})
        }
      });

      await this.auditLogService.log({
        userId: req.user.id,
        action: 'HOSPITAL_PROFILE_UPDATED',
        entityType: 'HospitalProfile',
        entityId: updated.id,
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: 'Hospital profile updated successfully.',
        profile: updated
      });
    } catch (err) {
      next(err);
    }
  };

  // Create Blood Request
  createRequest = async (req, res, next) => {
    try {
      const {
        patientNameOrId,
        patientAge,
        bloodGroup,
        unitsRequired,
        urgency,
        requiredDate,
        notes
      } = req.body;

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
      }

      if (!patientNameOrId || !bloodGroup || !unitsRequired || !requiredDate) {
        return res.status(400).json({
          success: false,
          message: 'Patient identifier, blood group, units required, and required date are mandatory.'
        });
      }

      const normalizedBlood = normalizeGroup(bloodGroup);
      const units = parseInt(unitsRequired, 10);
      const validUrgencies = ['NORMAL', 'HIGH', 'CRITICAL'];
      const reqUrgency = urgency && validUrgencies.includes(urgency.toUpperCase())
        ? urgency.toUpperCase()
        : 'NORMAL';

      const request = await this.prisma.bloodRequest.create({
        data: {
          hospitalId: hospital.id,
          patientNameOrId: patientNameOrId.trim(),
          patientAge: patientAge ? parseInt(patientAge, 10) : 30,
          bloodGroup: normalizedBlood,
          unitsRequired: units,
          unitsFulfilled: 0,
          urgency: reqUrgency,
          requiredDate: new Date(requiredDate),
          notes: notes || null,
          status: 'OPEN'
        }
      });

      await this.auditLogService.log({
        userId: req.user.id,
        action: 'BLOOD_REQUEST_CREATED',
        entityType: 'BloodRequest',
        entityId: request.id,
        details: { bloodGroup: normalizedBlood, unitsRequired: units, urgency: reqUrgency },
        ipAddress: req.ip
      });

      // Find compatible active donors and notify them
      const allDonors = await this.prisma.donorProfile.findMany({
        where: {
          isAvailable: true,
          user: { isActive: true }
        },
        include: { user: { select: { id: true } } }
      });

      const matchedDonors = allDonors.filter(d => isCompatible(d.bloodGroup, normalizedBlood));

      const notifications = matchedDonors.map(d => ({
        userId: d.user.id,
        title: `Blood Request Alert: ${reqUrgency} Urgency`,
        message: `${hospital.hospitalName} urgently requires ${units} unit(s) of ${normalizedBlood} blood (compatible with your ${d.bloodGroup} type).`,
        type: 'DONOR_MATCH',
        relatedEntityId: request.id
      }));

      // Fire and forget notification batch
      this.notificationService.notifyMany(notifications).catch(e => console.error(e));

      return res.status(201).json({
        success: true,
        message: 'Blood request created successfully. Compatible donors have been notified.',
        request,
        matchedDonorsCount: matchedDonors.length
      });
    } catch (err) {
      next(err);
    }
  };

  // Get all blood requests created by this hospital
  getRequests = async (req, res, next) => {
    try {
      const { status } = req.query;

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
      }

      const whereClause = { hospitalId: hospital.id };
      if (status) {
        whereClause.status = status.toUpperCase();
      }

      const requests = await this.prisma.bloodRequest.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { responses: true, donations: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        count: requests.length,
        requests: requests.map(r => ({
          ...r,
          totalResponses: r._count.responses,
          totalDonations: r._count.donations
        }))
      });
    } catch (err) {
      next(err);
    }
  };

  // Get specific blood request details
  getRequestById = async (req, res, next) => {
    try {
      const { id } = req.params;

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      const request = await this.prisma.bloodRequest.findUnique({
        where: { id },
        include: {
          hospital: true,
          responses: {
            include: {
              donor: {
                select: {
                  id: true,
                  fullName: true,
                  bloodGroup: true,
                  phone: true, // Only if response is accepted or scheduled
                  city: true,
                  locality: true,
                  isAvailable: true,
                  lastDonationDate: true
                }
              }
            }
          },
          donations: true
        }
      });

      if (!request) {
        return res.status(404).json({ success: false, message: 'Blood request not found.' });
      }

      if (request.hospitalId !== hospital.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Access denied to requests of other hospitals.' });
      }

      // Privacy mask phone numbers unless ACCEPTED, SCHEDULED, or COMPLETED
      const sanitizedResponses = request.responses.map(resp => {
        const canViewContact = ['ACCEPTED', 'SCHEDULED', 'COMPLETED'].includes(resp.status);
        return {
          ...resp,
          donor: {
            ...resp.donor,
            phone: canViewContact ? resp.donor.phone : 'Protected (Available after accepting donor)'
          }
        };
      });

      return res.status(200).json({
        success: true,
        request: {
          ...request,
          responses: sanitizedResponses
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // Update Blood Request
  updateRequest = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { unitsRequired, urgency, notes, requiredDate } = req.body;

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      const existing = await this.prisma.bloodRequest.findUnique({ where: { id } });
      if (!existing || existing.hospitalId !== hospital.id) {
        return res.status(404).json({ success: false, message: 'Blood request not found.' });
      }

      const updated = await this.prisma.bloodRequest.update({
        where: { id },
        data: {
          ...(unitsRequired ? { unitsRequired: parseInt(unitsRequired, 10) } : {}),
          ...(urgency ? { urgency: urgency.toUpperCase() } : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(requiredDate ? { requiredDate: new Date(requiredDate) } : {})
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Blood request updated successfully.',
        request: updated
      });
    } catch (err) {
      next(err);
    }
  };

  // Cancel Blood Request
  cancelRequest = async (req, res, next) => {
    try {
      const { id } = req.params;

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      const existing = await this.prisma.bloodRequest.findUnique({
        where: { id },
        include: {
          responses: {
            include: { donor: { include: { user: { select: { id: true } } } } }
          }
        }
      });

      if (!existing || existing.hospitalId !== hospital.id) {
        return res.status(404).json({ success: false, message: 'Blood request not found.' });
      }

      const updated = await this.prisma.bloodRequest.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      await this.auditLogService.log({
        userId: req.user.id,
        action: 'BLOOD_REQUEST_CANCELLED',
        entityType: 'BloodRequest',
        entityId: id,
        ipAddress: req.ip
      });

      // Notify interested donors of cancellation
      const notifications = existing.responses.map(r => ({
        userId: r.donor.user.id,
        title: 'Blood Request Cancelled',
        message: `${hospital.hospitalName} has cancelled the blood request for ${existing.patientNameOrId}.`,
        type: 'STATUS_CHANGE',
        relatedEntityId: id
      }));

      this.notificationService.notifyMany(notifications).catch(e => console.error(e));

      return res.status(200).json({
        success: true,
        message: 'Blood request has been cancelled.',
        request: updated
      });
    } catch (err) {
      next(err);
    }
  };

  // Retrieve Compatible Donors with ML Ranking and Factor Explanations
  getCompatibleDonors = async (req, res, next) => {
    try {
      const { id } = req.params;

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      const request = await this.prisma.bloodRequest.findUnique({ where: { id } });
      if (!request || request.hospitalId !== hospital.id) {
        return res.status(404).json({ success: false, message: 'Blood request not found.' });
      }

      // Fetch all registered donors
      const donors = await this.prisma.donorProfile.findMany({
        where: {
          user: { isActive: true }
        },
        include: {
          responses: {
            select: { id: true, status: true, requestId: true }
          },
          _count: {
            select: { donations: true, responses: true }
          }
        }
      });

      // 1. Mandatory red blood cell compatibility filter
      const compatibleDonors = donors.filter(d => isCompatible(d.bloodGroup, request.bloodGroup));

      // 2. Prepare candidate data for ML prioritization
      const candidates = compatibleDonors.map(d => {
        const distanceKm = calculateDistanceKm(
          hospital.latitude,
          hospital.longitude,
          d.latitude,
          d.longitude
        );

        let daysSinceLastDonation = 180; // Default high if no prior record
        if (d.lastDonationDate) {
          const diffMs = Date.now() - new Date(d.lastDonationDate).getTime();
          daysSinceLastDonation = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }

        // Response rate based on total responses and completed donations
        const totalResp = d._count.responses;
        const totalDon = d._count.donations;
        const historicalResponseRate = totalResp > 0
          ? Math.min(1.0, Math.max(0.3, (totalDon / totalResp) + 0.3))
          : 0.85;

        const compatibilityLevel = getCompatibilityLevel(d.bloodGroup, request.bloodGroup);

        return {
          donor_id: d.id,
          distance_km: distanceKm,
          days_since_last_donation: daysSinceLastDonation,
          is_available: d.isAvailable ? 1 : 0,
          historical_response_rate: historicalResponseRate,
          compatibility_level: compatibilityLevel,
          donorProfile: d
        };
      });

      // 3. Call ML Ranking Service
      const rankedResults = await rankDonors(request.urgency, candidates);

      // 4. Merge results with privacy-safe donor details
      const rankedDonors = rankedResults.map(ranked => {
        const candidate = candidates.find(c => c.donor_id === ranked.donor_id);
        const d = candidate.donorProfile;

        // Check if donor already responded to this request
        const existingResponse = d.responses.find(r => r.requestId === request.id);

        return {
          donorId: d.id,
          fullName: d.fullName,
          bloodGroup: d.bloodGroup,
          approximateCity: d.city,
          locality: d.locality,
          distanceKm: candidate.distance_km,
          isAvailable: d.isAvailable,
          daysSinceLastDonation: candidate.days_since_last_donation,
          suitabilityScore: ranked.suitability_score,
          priorityTier: ranked.priority_tier,
          rank: ranked.rank,
          contributingFactors: ranked.contributing_factors,
          isFallback: ranked.is_fallback || false,
          hasExpressedInterest: Boolean(existingResponse),
          responseStatus: existingResponse ? existingResponse.status : null
        };
      });

      return res.status(200).json({
        success: true,
        request: {
          id: request.id,
          patientNameOrId: request.patientNameOrId,
          bloodGroup: request.bloodGroup,
          urgency: request.urgency,
          unitsRequired: request.unitsRequired
        },
        totalCompatibleDonors: rankedDonors.length,
        donors: rankedDonors
      });
    } catch (err) {
      next(err);
    }
  };

  // Get donors who expressed interest for a request
  getInterestedDonors = async (req, res, next) => {
    try {
      const { id } = req.params;

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      const request = await this.prisma.bloodRequest.findUnique({ where: { id } });
      if (!request || request.hospitalId !== hospital.id) {
        return res.status(404).json({ success: false, message: 'Blood request not found.' });
      }

      const responses = await this.prisma.donorResponse.findMany({
        where: { requestId: id },
        include: {
          donor: {
            select: {
              id: true,
              fullName: true,
              bloodGroup: true,
              phone: true,
              city: true,
              locality: true,
              isAvailable: true,
              lastDonationDate: true,
              latitude: true,
              longitude: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const processed = responses.map(r => {
        const canViewPhone = ['ACCEPTED', 'SCHEDULED', 'COMPLETED'].includes(r.status);
        const distanceKm = calculateDistanceKm(
          hospital.latitude,
          hospital.longitude,
          r.donor.latitude,
          r.donor.longitude
        );

        return {
          id: r.id,
          status: r.status,
          notes: r.notes,
          scheduledAt: r.scheduledAt,
          completedAt: r.completedAt,
          createdAt: r.createdAt,
          distanceKm,
          donor: {
            id: r.donor.id,
            fullName: r.donor.fullName,
            bloodGroup: r.donor.bloodGroup,
            phone: canViewPhone ? r.donor.phone : 'Protected (Accept donor to view contact)',
            city: r.donor.city,
            locality: r.donor.locality,
            isAvailable: r.donor.isAvailable,
            lastDonationDate: r.donor.lastDonationDate
          }
        };
      });

      return res.status(200).json({
        success: true,
        count: processed.length,
        responses: processed
      });
    } catch (err) {
      next(err);
    }
  };

  // Update donor response status (ACCEPT, SCHEDULE, DECLINE, DEFER)
  updateResponseStatus = async (req, res, next) => {
    try {
      const { responseId } = req.params;
      const { status, notes, scheduledAt } = req.body;

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      const response = await this.prisma.donorResponse.findUnique({
        where: { id: responseId },
        include: {
          request: true,
          donor: { include: { user: { select: { id: true } } } }
        }
      });

      if (!response || response.request.hospitalId !== hospital.id) {
        return res.status(404).json({ success: false, message: 'Response record not found.' });
      }

      const validStatuses = ['CONTACTED', 'ACCEPTED', 'SCHEDULED', 'DECLINED', 'DEFERRED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed: [${validStatuses.join(', ')}]`
        });
      }

      const newStatus = status.toUpperCase();

      const updated = await this.prisma.$transaction(async (tx) => {
        const updatedResponse = await tx.donorResponse.update({
          where: { id: responseId },
          data: {
            status: newStatus,
            ...(notes ? { notes } : {}),
            ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {})
          }
        });

        // If scheduled, update request status to IN_PROGRESS
        if (newStatus === 'SCHEDULED' && response.request.status !== 'FULFILLED') {
          await tx.bloodRequest.update({
            where: { id: response.request.id },
            data: { status: 'IN_PROGRESS' }
          });
        }

        return updatedResponse;
      });

      // Audit Log
      await this.auditLogService.log({
        userId: req.user.id,
        action: `DONOR_RESPONSE_${newStatus}`,
        entityType: 'DonorResponse',
        entityId: response.id,
        details: { newStatus, requestId: response.request.id },
        ipAddress: req.ip
      });

      // Notify Donor
      let notifMessage = `${hospital.hospitalName} updated your donation status to: ${newStatus}.`;
      if (newStatus === 'ACCEPTED') {
        notifMessage = `Great news! ${hospital.hospitalName} has accepted your donation interest. They will contact you shortly to coordinate appointment timing.`;
      } else if (newStatus === 'SCHEDULED') {
        notifMessage = `Your blood donation appointment with ${hospital.hospitalName} has been confirmed for ${new Date(scheduledAt).toLocaleString()}.`;
      } else if (newStatus === 'DECLINED') {
        notifMessage = `Thank you for your willingness to help. The hospital has declined this request as needs have adjusted.`;
      }

      await this.notificationService.createNotification({
        userId: response.donor.user.id,
        title: `Donation Status: ${newStatus}`,
        message: notifMessage,
        type: 'STATUS_CHANGE',
        relatedEntityId: response.request.id
      });

      return res.status(200).json({
        success: true,
        message: `Donor response updated to ${newStatus}.`,
        response: updated
      });
    } catch (err) {
      next(err);
    }
  };

  // Complete Donation & Update Request Lifecycle
  completeDonation = async (req, res, next) => {
    try {
      const { id } = req.params; // blood request ID
      const { donorResponseId, unitsDonated = 1, remarks } = req.body;

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      const request = await this.prisma.bloodRequest.findUnique({
        where: { id },
        include: { responses: true }
      });

      if (!request || request.hospitalId !== hospital.id) {
        return res.status(404).json({ success: false, message: 'Blood request not found.' });
      }

      const response = await this.prisma.donorResponse.findUnique({
        where: { id: donorResponseId },
        include: { donor: { include: { user: { select: { id: true } } } } }
      });

      if (!response || response.requestId !== request.id) {
        return res.status(400).json({
          success: false,
          message: 'The selected donor response does not match this blood request.'
        });
      }

      if (response.status === 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'This donation has already been marked as completed.'
        });
      }

      const units = parseInt(unitsDonated, 10) || 1;
      const newFulfilledUnits = request.unitsFulfilled + units;
      const isFulfilled = newFulfilledUnits >= request.unitsRequired;

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create Donation Record
        const donation = await tx.donation.create({
          data: {
            requestId: request.id,
            donorId: response.donor.id,
            hospitalId: hospital.id,
            donorResponseId: response.id,
            unitsDonated: units,
            donationDate: new Date(),
            status: 'CONFIRMED',
            remarks: remarks || 'Blood collection verified and completed by hospital.'
          }
        });

        // 2. Update DonorResponse status
        await tx.donorResponse.update({
          where: { id: response.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });

        // 3. Update Donor's last donation date and reset availability
        await tx.donorProfile.update({
          where: { id: response.donor.id },
          data: {
            lastDonationDate: new Date(),
            isAvailable: true
          }
        });

        // 4. Update BloodRequest units and status
        const updatedRequest = await tx.bloodRequest.update({
          where: { id: request.id },
          data: {
            unitsFulfilled: newFulfilledUnits,
            status: isFulfilled ? 'FULFILLED' : 'IN_PROGRESS'
          }
        });

        return { donation, updatedRequest };
      });

      // Audit Log
      await this.auditLogService.log({
        userId: req.user.id,
        action: 'DONATION_COMPLETED',
        entityType: 'Donation',
        entityId: result.donation.id,
        details: {
          requestId: request.id,
          donorId: response.donor.id,
          units,
          isFulfilled
        },
        ipAddress: req.ip
      });

      // Send Congratulations Notification to Donor
      await this.notificationService.createNotification({
        userId: response.donor.user.id,
        title: 'Donation Completed! You Saved Lives Today ❤️',
        message: `Thank you, ${response.donor.fullName}! Your donation of ${units} unit(s) of ${response.donor.bloodGroup} blood at ${hospital.hospitalName} has been officially recorded. Your generosity helps save up to ${units * 3} lives!`,
        type: 'DONATION_COMPLETED',
        relatedEntityId: result.donation.id
      });

      // Send Notification to Hospital
      await this.notificationService.createNotification({
        userId: req.user.id,
        title: 'Donation Confirmed',
        message: `Donation from ${response.donor.fullName} completed. Request fulfilled: ${newFulfilledUnits}/${request.unitsRequired} units.`,
        type: 'DONATION_COMPLETED',
        relatedEntityId: request.id
      });

      return res.status(200).json({
        success: true,
        message: `Donation successfully recorded. Request is ${isFulfilled ? 'FULFILLED' : 'in progress'}.`,
        donation: result.donation,
        request: result.updatedRequest
      });
    } catch (err) {
      next(err);
    }
  };

  // Hospital Donation History
  getDonations = async (req, res, next) => {
    try {
      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { userId: req.user.id }
      });

      const donations = await this.prisma.donation.findMany({
        where: { hospitalId: hospital.id },
        include: {
          donor: {
            select: { fullName: true, bloodGroup: true, phone: true }
          },
          request: {
            select: { patientNameOrId: true, bloodGroup: true, urgency: true }
          }
        },
        orderBy: { donationDate: 'desc' }
      });

      return res.status(200).json({
        success: true,
        count: donations.length,
        donations
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = HospitalController;
