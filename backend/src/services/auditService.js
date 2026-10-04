import { AuditLog } from '../models/AuditLog.js';

/**
 * Records an immutable audit log entry
 */
export async function logAuditEvent({
  action,
  entityType,
  entityId = null,
  entityIdentifier = '',
  performedBy = null,
  performedByName = 'System',
  performedByRole = 'SYSTEM',
  details = {},
  ipAddress = '',
}) {
  try {
    const log = new AuditLog({
      action,
      entityType,
      entityId,
      entityIdentifier,
      performedBy,
      performedByName,
      performedByRole,
      details,
      ipAddress,
    });
    await log.save();
    return log;
  } catch (err) {
    console.error(`⚠️ [Audit Log Error]: ${err.message}`);
  }
}
