import { Complaint } from '../models/Complaint.js';
import { Incident } from '../models/Incident.js';
import { Department } from '../models/Department.js';
import { Notification } from '../models/Notification.js';
import { logAuditEvent } from '../services/auditService.js';
import { emitSocketEvent } from '../services/socketService.js';
import { sendEmail } from '../services/emailService.js';

export async function getReviewQueue(req, res, next) {
  try {
    const { status = 'PENDING_REVIEW', category, severity } = req.query;

    const query = {};
    if (status !== 'ALL') {
      query.status = status;
    }
    if (category) {
      query['aiAnalysis.suggestedCategory'] = category;
    }
    if (severity) {
      query['aiAnalysis.suggestedSeverity'] = severity;
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'name email studentId')
      .populate('evidence')
      .populate('location.zone')
      .populate('aiAnalysis.suggestedDepartment')
      .populate('aiAnalysis.suggestedIncident')
      .populate('assignedDepartment')
      .populate('incident')
      .sort({
        // Prioritize CRITICAL & HIGH severities
        'aiAnalysis.suggestedSeverity': 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (err) {
    next(err);
  }
}

export async function processReview(req, res, next) {
  try {
    const { id } = req.params;
    const {
      action, // 'APPROVE', 'REJECT', 'MERGE'
      finalCategory,
      finalSeverity,
      assignedDepartment,
      targetIncidentId,
      reviewerNotes = '',
    } = req.body;

    const complaint = await Complaint.findById(id)
      .populate('student')
      .populate('evidence')
      .populate('location.zone');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.status !== 'PENDING_REVIEW' && action !== 'MERGE') {
      return res.status(400).json({
        success: false,
        message: `Complaint has already been reviewed (Status: ${complaint.status}).`,
      });
    }

    const category = finalCategory || complaint.aiAnalysis.suggestedCategory || 'General';
    const severity = finalSeverity || complaint.aiAnalysis.suggestedSeverity || 'MEDIUM';

    // Find Department
    let deptId = assignedDepartment || complaint.aiAnalysis.suggestedDepartment;
    if (!deptId) {
      const foundDept = await Department.findOne({
        $or: [
          { categories: category },
          { name: new RegExp(category, 'i') },
          { code: 'MAINTENANCE' },
        ],
      });
      deptId = foundDept ? foundDept._id : null;
    }

    complaint.reviewerNotes = reviewerNotes;
    complaint.reviewedBy = req.user._id;
    complaint.reviewedAt = new Date();
    complaint.finalCategory = category;
    complaint.finalSeverity = severity;
    complaint.assignedDepartment = deptId;

    let targetIncident = null;

    if (action === 'APPROVE') {
      // Check if Reviewer picked an existing incident or we create a new one
      if (targetIncidentId) {
        targetIncident = await Incident.findById(targetIncidentId);
        if (targetIncident) {
          if (!targetIncident.linkedComplaints.includes(complaint._id)) {
            targetIncident.linkedComplaints.push(complaint._id);
            targetIncident.reportCount = targetIncident.linkedComplaints.length;
            targetIncident.timeline.push({
              status: targetIncident.status,
              note: `Complaint #${complaint.complaintNumber} merged into this incident by Reviewer ${req.user.name}.`,
              performedBy: req.user._id,
              performedByName: req.user.name,
              performedByRole: req.user.role,
            });
            await targetIncident.save();
          }
          complaint.status = 'MERGED_INTO_INCIDENT';
          complaint.incident = targetIncident._id;
        }
      }

      if (!targetIncident) {
        // Create Master Incident
        const incCount = await Incident.countDocuments();
        const incidentNumber = `INC-${200 + incCount + 1}`;
        const title = `${complaint.location.zoneName}: ${category} Issue (${complaint.locationDetail || 'Reported Issue'})`;

        targetIncident = new Incident({
          incidentNumber,
          title,
          description: complaint.description,
          category,
          department: deptId,
          zone: complaint.location.zone?._id || null,
          zoneName: complaint.location.zoneName,
          locationDetail: complaint.locationDetail,
          severity,
          status: 'REPORTED',
          linkedComplaints: [complaint._id],
          reportCount: 1,
          primaryEvidence: complaint.evidence._id,
          timeline: [
            {
              status: 'REPORTED',
              note: `Incident created and automatically routed to department after reviewer approval.`,
              performedBy: req.user._id,
              performedByName: req.user.name,
              performedByRole: req.user.role,
            },
          ],
        });
        await targetIncident.save();

        complaint.status = 'APPROVED';
        complaint.incident = targetIncident._id;
      }

      await complaint.save();

      // Student Notification
      const studentNotif = new Notification({
        recipient: complaint.student._id,
        title: 'Complaint Verified & Approved',
        message: `Your complaint #${complaint.complaintNumber} has been verified by the reviewer and routed to the department under Incident #${targetIncident.incidentNumber}.`,
        type: 'COMPLAINT_APPROVED',
        relatedComplaint: complaint._id,
        relatedIncident: targetIncident._id,
      });
      await studentNotif.save();

      // Socket updates
      emitSocketEvent({
        room: `user:${complaint.student._id}`,
        event: 'notification:new',
        data: studentNotif,
      });

      emitSocketEvent({
        room: `dept:${deptId}`,
        event: 'incident:new',
        data: targetIncident,
      });

      emitSocketEvent({
        room: 'role:ADMIN',
        event: 'incident:updated',
        data: targetIncident,
      });

      // Audit Log
      await logAuditEvent({
        action: 'REVIEWER_APPROVED_COMPLAINT',
        entityType: 'COMPLAINT',
        entityId: complaint._id,
        entityIdentifier: complaint.complaintNumber,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        details: {
          assignedDepartment: deptId,
          incidentNumber: targetIncident.incidentNumber,
          severity,
        },
        ipAddress: req.ip,
      });

      // Email student
      sendEmail({
        to: complaint.student.email,
        subject: `[SmartCampus] Report Approved: #${complaint.complaintNumber}`,
        text: `Hello ${complaint.student.name},\n\nYour complaint #${complaint.complaintNumber} has been approved and linked to Incident #${targetIncident.incidentNumber} ("${targetIncident.title}").\n\nThe campus department is now handling this issue.`,
      });

    } else if (action === 'MERGE') {
      if (!targetIncidentId) {
        return res.status(400).json({
          success: false,
          message: 'Target incident ID is required for merging.',
        });
      }

      targetIncident = await Incident.findById(targetIncidentId);
      if (!targetIncident) {
        return res.status(404).json({ success: false, message: 'Target incident not found.' });
      }

      if (!targetIncident.linkedComplaints.includes(complaint._id)) {
        targetIncident.linkedComplaints.push(complaint._id);
        targetIncident.reportCount = targetIncident.linkedComplaints.length;
        targetIncident.timeline.push({
          status: targetIncident.status,
          note: `Complaint #${complaint.complaintNumber} clustered into this incident.`,
          performedBy: req.user._id,
          performedByName: req.user.name,
          performedByRole: req.user.role,
        });
        await targetIncident.save();
      }

      complaint.status = 'MERGED_INTO_INCIDENT';
      complaint.incident = targetIncident._id;
      await complaint.save();

      const notif = new Notification({
        recipient: complaint.student._id,
        title: 'Report Clustered into Campus Incident',
        message: `Your report #${complaint.complaintNumber} was identified as part of Incident #${targetIncident.incidentNumber} ("${targetIncident.title}"). Total ${targetIncident.reportCount} reports linked.`,
        type: 'COMPLAINT_MERGED',
        relatedComplaint: complaint._id,
        relatedIncident: targetIncident._id,
      });
      await notif.save();

      emitSocketEvent({
        room: `user:${complaint.student._id}`,
        event: 'notification:new',
        data: notif,
      });

      await logAuditEvent({
        action: 'REVIEWER_MERGED_COMPLAINT',
        entityType: 'COMPLAINT',
        entityId: complaint._id,
        entityIdentifier: complaint.complaintNumber,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        details: { targetIncidentNumber: targetIncident.incidentNumber },
        ipAddress: req.ip,
      });

    } else if (action === 'REJECT') {
      complaint.status = 'REJECTED';
      await complaint.save();

      const rejectNotif = new Notification({
        recipient: complaint.student._id,
        title: 'Complaint Not Approved',
        message: `Your complaint #${complaint.complaintNumber} was not approved. Reason: ${reviewerNotes || 'Evidence mismatch or outside campus jurisdiction.'}`,
        type: 'COMPLAINT_REJECTED',
        relatedComplaint: complaint._id,
      });
      await rejectNotif.save();

      emitSocketEvent({
        room: `user:${complaint.student._id}`,
        event: 'notification:new',
        data: rejectNotif,
      });

      await logAuditEvent({
        action: 'REVIEWER_REJECTED_COMPLAINT',
        entityType: 'COMPLAINT',
        entityId: complaint._id,
        entityIdentifier: complaint.complaintNumber,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        details: { reason: reviewerNotes },
        ipAddress: req.ip,
      });

      sendEmail({
        to: complaint.student.email,
        subject: `[SmartCampus] Update on Report #${complaint.complaintNumber}`,
        text: `Hello ${complaint.student.name},\n\nYour complaint #${complaint.complaintNumber} could not be approved for resolution.\nNotes: ${reviewerNotes || 'Evidence mismatch or invalid location.'}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Complaint successfully processed with action: ${action}.`,
      complaint,
      incident: targetIncident,
    });
  } catch (err) {
    next(err);
  }
}
