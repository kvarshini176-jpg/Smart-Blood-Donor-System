class AdminController {
  constructor(prisma, notificationService, auditLogService) {
    this.prisma = prisma;
    this.notificationService = notificationService;
    this.auditLogService = auditLogService;
  }

  // System Stats and Reports
  getStats = async (req, res, next) => {
    try {
      const [
        totalDonors,
        totalHospitals,
        pendingHospitals,
        totalRequests,
        activeRequests,
        fulfilledRequests,
        cancelledRequests,
        totalDonations,
        recentActivity
      ] = await Promise.all([
        this.prisma.donorProfile.count(),
        this.prisma.hospitalProfile.count(),
        this.prisma.hospitalProfile.count({ where: { verificationStatus: 'PENDING' } }),
        this.prisma.bloodRequest.count(),
        this.prisma.bloodRequest.count({ where: { status: 'OPEN' } }),
        this.prisma.bloodRequest.count({ where: { status: 'FULFILLED' } }),
        this.prisma.bloodRequest.count({ where: { status: 'CANCELLED' } }),
        this.prisma.donation.count(),
        this.prisma.auditLog.findMany({ take: 10 })
      ]);

      // Calculate blood group distribution among donors
      const allDonors = await this.prisma.donorProfile.findMany();
      const bloodGroupCounts = {};
      for (const d of allDonors) {
        bloodGroupCounts[d.bloodGroup] = (bloodGroupCounts[d.bloodGroup] || 0) + 1;
      }

      return res.status(200).json({
        success: true,
        stats: {
          totalDonors,
          totalHospitals,
          pendingHospitals,
          totalRequests,
          activeRequests,
          fulfilledRequests,
          cancelledRequests,
          totalDonations,
          bloodGroupDistribution: bloodGroupCounts,
          recentActivity
        }
      });
    } catch (err) {
      next(err);
    }
  };

  // View All Donors
  getDonors = async (req, res, next) => {
    try {
      const { bloodGroup, city, isAvailable } = req.query;
      const where = {};
      if (bloodGroup) where.bloodGroup = bloodGroup;
      if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';

      const donors = await this.prisma.donorProfile.findMany({ where });

      // In-memory filter for city if supplied
      const filtered = city
        ? donors.filter(d => d.city.toLowerCase().includes(city.toLowerCase()))
        : donors;

      return res.status(200).json({
        success: true,
        count: filtered.length,
        donors: filtered
      });
    } catch (err) {
      next(err);
    }
  };

  // View All Hospitals
  getHospitals = async (req, res, next) => {
    try {
      const { verificationStatus, city } = req.query;
      const where = {};
      if (verificationStatus) where.verificationStatus = verificationStatus.toUpperCase();

      const hospitals = await this.prisma.hospitalProfile.findMany({ where });

      const filtered = city
        ? hospitals.filter(h => h.city.toLowerCase().includes(city.toLowerCase()))
        : hospitals;

      return res.status(200).json({
        success: true,
        count: filtered.length,
        hospitals: filtered
      });
    } catch (err) {
      next(err);
    }
  };

  // Approve or Reject Hospital Verification
  updateHospitalVerification = async (req, res, next) => {
    try {
      const { id } = req.params; // hospitalProfile id
      const { status, reviewNotes } = req.body;

      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status?.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Status must be APPROVED, REJECTED, or PENDING.'
        });
      }

      const newStatus = status.toUpperCase();

      const hospital = await this.prisma.hospitalProfile.findUnique({
        where: { id }
      });

      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
      }

      const updated = await this.prisma.hospitalProfile.update({
        where: { id },
        data: { verificationStatus: newStatus }
      });

      await this.prisma.hospitalVerification.create({
        data: {
          hospitalId: id,
          reviewedByAdminId: req.user.id,
          status: newStatus,
          reviewNotes: reviewNotes || `Admin marked as ${newStatus}`
        }
      });

      await this.auditLogService.log({
        userId: req.user.id,
        action: `HOSPITAL_VERIFICATION_${newStatus}`,
        entityType: 'HospitalProfile',
        entityId: id,
        details: { newStatus, reviewNotes },
        ipAddress: req.ip
      });

      // Notify Hospital contact
      await this.notificationService.createNotification({
        userId: hospital.userId,
        title: `Verification Status: ${newStatus}`,
        message: newStatus === 'APPROVED'
          ? 'Congratulations! Your hospital registration has been approved. You can now publish blood requests and coordinate with donors.'
          : `Your hospital verification request has been updated to: ${newStatus}. Notes: ${reviewNotes || 'Contact support for details.'}`,
        type: 'VERIFICATION_UPDATE',
        relatedEntityId: id
      });

      return res.status(200).json({
        success: true,
        message: `Hospital verification status updated to ${newStatus}.`,
        hospital: updated
      });
    } catch (err) {
      next(err);
    }
  };

  // Activate / Deactivate any User account
  updateUserStatus = async (req, res, next) => {
    try {
      const { id } = req.params; // user id
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({ success: false, message: 'isActive boolean flag is required.' });
      }

      const updated = await this.prisma.user.update({
        where: { id },
        data: { isActive: Boolean(isActive) }
      });

      await this.auditLogService.log({
        userId: req.user.id,
        action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        entityType: 'User',
        entityId: id,
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: `User account has been ${isActive ? 'activated' : 'deactivated'}.`,
        user: { id: updated.id, email: updated.email, isActive: updated.isActive }
      });
    } catch (err) {
      next(err);
    }
  };

  // View All Blood Requests
  getRequests = async (req, res, next) => {
    try {
      const { status } = req.query;
      const where = {};
      if (status) where.status = status.toUpperCase();

      const requests = await this.prisma.bloodRequest.findMany({ where });
      return res.status(200).json({
        success: true,
        count: requests.length,
        requests
      });
    } catch (err) {
      next(err);
    }
  };

  // View All Completed Donations
  getDonations = async (req, res, next) => {
    try {
      const donations = await this.prisma.donation.findMany();
      return res.status(200).json({
        success: true,
        count: donations.length,
        donations
      });
    } catch (err) {
      next(err);
    }
  };

  // Audit Logs
  getAuditLogs = async (req, res, next) => {
    try {
      const logs = await this.auditLogService.getRecentLogs(100);
      return res.status(200).json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = AdminController;
