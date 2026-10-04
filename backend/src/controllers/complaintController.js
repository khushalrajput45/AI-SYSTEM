import { Complaint } from '../models/Complaint.js';
import { Evidence } from '../models/Evidence.js';
import { Notification } from '../models/Notification.js';
import { resolveCampusZone } from '../services/geofenceService.js';
import { analyzeComplaint } from '../services/aiService.js';
import { findSimilarComplaints } from '../services/vectorService.js';
import { logAuditEvent } from '../services/auditService.js';
import { emitSocketEvent } from '../services/socketService.js';
import { sendEmail } from '../services/emailService.js';

export async function submitComplaint(req, res, next) {
  try {
    const { description, locationDetail = '', latitude, longitude, accuracy = 5 } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Live camera evidence is strictly required. Please capture a live photo.',
      });
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const accNum = parseFloat(accuracy);

    // 1. Resolve Campus Zone & Geofence Check
    const zoneInfo = await resolveCampusZone(latNum, lngNum);

    // 2. Build Image URL from uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;

    // 3. Save Evidence Document
    const evidence = new Evidence({
      captureType: 'LIVE_CAMERA',
      imageUrl,
      storageType: 'LOCAL',
      latitude: latNum,
      longitude: lngNum,
      accuracy: accNum,
      deviceInfo: {
        userAgent: req.headers['user-agent'],
      },
    });
    await evidence.save();

    // 4. Generate unique Complaint Number
    const count = await Complaint.countDocuments();
    const complaintNumber = `CMP-${1000 + count + 1}`;

    // 5. Run AI Vision + Classification + Embedding Pipeline
    const aiResult = await analyzeComplaint({
      description,
      imagePath: req.file.path,
      zoneName: zoneInfo.zoneName,
    });

    // 6. Run Vector Duplicate Detection & Clustering Engine
    const vectorResult = await findSimilarComplaints(aiResult.embedding, {
      zoneId: zoneInfo.zone ? zoneInfo.zone._id : null,
      similarityThreshold: 0.75,
    });

    // 7. Save Complaint
    const complaint = new Complaint({
      complaintNumber,
      student: req.user._id,
      description,
      locationDetail: locationDetail || zoneInfo.zoneName,
      evidence: evidence._id,
      location: {
        latitude: latNum,
        longitude: lngNum,
        accuracy: accNum,
        zone: zoneInfo.zone ? zoneInfo.zone._id : null,
        zoneName: zoneInfo.zoneName,
        isInsideCampus: zoneInfo.isInsideCampus,
      },
      aiAnalysis: {
        detectedObjects: aiResult.detectedObjects,
        environment: aiResult.environment,
        condition: aiResult.condition,
        matchConfidence: aiResult.matchConfidence,
        isEvidenceMismatch: aiResult.isEvidenceMismatch,
        suggestedCategory: aiResult.suggestedCategory,
        suggestedDepartment: aiResult.suggestedDepartment,
        suggestedSeverity: aiResult.suggestedSeverity,
        reason: aiResult.reason,
        embedding: aiResult.embedding,
        duplicateConfidence: vectorResult.maxSimilarity,
        similarComplaints: vectorResult.similarComplaints,
        suggestedIncident: vectorResult.suggestedIncident,
      },
      status: 'PENDING_REVIEW',
    });

    await complaint.save();
    evidence.complaintId = complaint._id;
    await evidence.save();

    // 8. Audit Log
    await logAuditEvent({
      action: 'COMPLAINT_SUBMITTED',
      entityType: 'COMPLAINT',
      entityId: complaint._id,
      entityIdentifier: complaint.complaintNumber,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      details: {
        zoneName: zoneInfo.zoneName,
        matchConfidence: aiResult.matchConfidence,
        suggestedCategory: aiResult.suggestedCategory,
        suggestedSeverity: aiResult.suggestedSeverity,
        similarCount: vectorResult.similarComplaints.length,
      },
      ipAddress: req.ip,
    });

    // 9. Create Student In-App Notification
    const notification = new Notification({
      recipient: req.user._id,
      title: 'Complaint Submitted',
      message: `Your report #${complaintNumber} has been received and is undergoing AI & Reviewer verification.`,
      type: 'COMPLAINT_SUBMITTED',
      relatedComplaint: complaint._id,
    });
    await notification.save();

    // 10. Real-time Socket Dispatch
    emitSocketEvent({
      room: `user:${req.user._id}`,
      event: 'notification:new',
      data: notification,
    });

    emitSocketEvent({
      room: 'role:REVIEWER',
      event: 'complaint:created',
      data: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        category: aiResult.suggestedCategory,
        severity: aiResult.suggestedSeverity,
        matchConfidence: aiResult.matchConfidence,
        duplicateConfidence: vectorResult.maxSimilarity,
      },
    });

    emitSocketEvent({
      room: 'role:ADMIN',
      event: 'complaint:created',
      data: {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
      },
    });

    // 11. Send Email Notification
    sendEmail({
      to: req.user.email,
      subject: `[SmartCampus] Report Received: #${complaintNumber}`,
      text: `Hello ${req.user.name},\n\nYour complaint "${description}" in ${zoneInfo.zoneName} has been received (ID: ${complaintNumber}).\nOur AI system has verified the real-time camera evidence (${aiResult.matchConfidence}% confidence) and forwarded it to campus reviewers.\n\nYou can track the status live on your SmartCampus dashboard.`,
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('student', 'name email studentId')
      .populate('evidence')
      .populate('location.zone')
      .populate('aiAnalysis.suggestedDepartment')
      .populate('aiAnalysis.suggestedIncident');

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted and verified by SmartCampus AI.',
      complaint: populatedComplaint,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyComplaints(req, res, next) {
  try {
    const complaints = await Complaint.find({ student: req.user._id })
      .populate('evidence')
      .populate('location.zone')
      .populate('incident', 'incidentNumber title status severity')
      .populate('assignedDepartment')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (err) {
    next(err);
  }
}

export async function getComplaintById(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email studentId phone')
      .populate('evidence')
      .populate('location.zone')
      .populate('incident')
      .populate('aiAnalysis.suggestedDepartment')
      .populate('aiAnalysis.suggestedIncident')
      .populate('aiAnalysis.similarComplaints.complaint')
      .populate('assignedDepartment')
      .populate('reviewedBy', 'name email role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Authorization check: Student can only view their own complaint unless reviewer/staff/admin
    if (
      req.user.role === 'STUDENT' &&
      complaint.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You cannot view reports submitted by other students.',
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (err) {
    next(err);
  }
}
