import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'COMPLAINT_SUBMITTED',
        'COMPLAINT_APPROVED',
        'COMPLAINT_REJECTED',
        'COMPLAINT_MERGED',
        'INCIDENT_ASSIGNED',
        'INCIDENT_IN_PROGRESS',
        'INCIDENT_RESOLVED',
        'SYSTEM_ALERT',
      ],
      default: 'COMPLAINT_SUBMITTED',
    },
    relatedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    relatedIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
