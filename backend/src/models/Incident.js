import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    incidentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampusZone',
      required: true,
    },
    zoneName: {
      type: String,
      default: '',
    },
    locationDetail: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['REPORTED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'REPORTED',
      index: true,
    },
    linkedComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
      },
    ],
    reportCount: {
      type: Number,
      default: 1,
    },
    primaryEvidence: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evidence',
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    inProgressAt: {
      type: Date,
      default: null,
    },
    resolution: {
      notes: { type: String, default: '' },
      resolvedAt: { type: Date, default: null },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      afterEvidence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
        default: null,
      },
    },
    timeline: [
      {
        status: String,
        note: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        performedByName: String,
        performedByRole: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Incident = mongoose.model('Incident', incidentSchema);
