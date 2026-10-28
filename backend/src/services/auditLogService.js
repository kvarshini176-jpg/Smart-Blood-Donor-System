/**
 * Audit Logging Service
 * Records administrative and critical donation lifecycle actions.
 */

class AuditLogService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async log({ userId = null, action, entityType, entityId, details = null, ipAddress = null }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId: String(entityId),
          details: details ? (typeof details === 'object' ? JSON.stringify(details) : String(details)) : null,
          ipAddress
        }
      });
    } catch (error) {
      console.error('AuditLog error:', error);
      return null;
    }
  }

  async getRecentLogs(limit = 100) {
    return await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, email: true, role: true }
        }
      }
    });
  }
}

module.exports = AuditLogService;
