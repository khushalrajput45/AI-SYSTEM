import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
    captureType: {
      type: String,
      enum: ['LIVE_CAMERA', 'STAFF_RESOLUTION'],
      default: 'LIVE_CAMERA',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: null,
    },
    storageType: {
      type: String,
      enum: ['CLOUDINARY', 'LOCAL'],
      default: 'LOCAL',
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      default: 10, // in meters
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Evidence = mongoose.model('Evidence', evidenceSchema);
