import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    locationDetail: {
      type: String,
      default: '',
      trim: true,
    },
    evidence: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evidence',
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number, default: 5 },
      zone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CampusZone',
        default: null,
      },
      zoneName: { type: String, default: 'Unknown Zone' },
      isInsideCampus: { type: Boolean, default: true },
    },
    aiAnalysis: {
      detectedObjects: [{ type: String }],
      environment: { type: String, default: '' },
      condition: { type: String, default: '' },
      matchConfidence: { type: Number, default: 0 }, // 0 to 100
      isEvidenceMismatch: { type: Boolean, default: false },
      suggestedCategory: { type: String, default: 'General' },
      suggestedDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null,
      },
      suggestedSeverity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM',
      },
      reason: { type: String, default: '' },
      embedding: [{ type: Number }],
      duplicateConfidence: { type: Number, default: 0 },
      similarComplaints: [
        {
          complaint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Complaint',
          },
          complaintNumber: String,
          similarityScore: Number,
        },
      ],
      suggestedIncident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        default: null,
      },
    },
    status: {
      type: String,
      enum: [
        'PENDING_REVIEW',
        'APPROVED',
        'REJECTED',
        'MERGED_INTO_INCIDENT',
        'IN_PROGRESS',
        'RESOLVED',
      ],
      default: 'PENDING_REVIEW',
      index: true,
    },
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
    finalCategory: {
      type: String,
      default: null,
    },
    finalSeverity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', null],
      default: null,
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    reviewerNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Complaint = mongoose.model('Complaint', complaintSchema);
