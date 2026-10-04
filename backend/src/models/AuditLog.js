import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['COMPLAINT', 'INCIDENT', 'USER', 'ZONE', 'DEPARTMENT', 'AUTH'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    entityIdentifier: {
      type: String, // e.g. "CMP-1042" or "INC-284"
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    performedByName: {
      type: String,
      default: 'System',
    },
    performedByRole: {
      type: String,
      default: 'SYSTEM',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
