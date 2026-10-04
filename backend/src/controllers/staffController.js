import { Incident } from '../models/Incident.js';
import { Complaint } from '../models/Complaint.js';
import { Evidence } from '../models/Evidence.js';
import { Notification } from '../models/Notification.js';
import { logAuditEvent } from '../services/auditService.js';
import { emitSocketEvent } from '../services/socketService.js';
import { sendEmail } from '../services/emailService.js';

export async function getDepartmentIncidents(req, res, next) {
  try {
    const { status } = req.query;

    const query = {};
    if (req.user.role === 'STAFF') {
      query.department = req.user.department?._id || req.user.department;
    } else if (req.query.departmentId) {
      query.department = req.query.departmentId;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const incidents = await Incident.find(query)
      .populate('department')
      .populate('zone')
      .populate('primaryEvidence')
      .populate('assignedStaff', 'name email role phone')
      .populate({
        path: 'linkedComplaints',
        populate: [
          { path: 'student', select: 'name email studentId' },
          { path: 'evidence' },
        ],
      })
      .populate('resolution.resolvedBy', 'name email')
      .populate('resolution.afterEvidence')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (err) {
    next(err);
  }
}

export async function acceptIncident(req, res, next) {
  try {
    const { id } = req.params;

    const incident = await Incident.findById(id).populate('department');
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    // RBAC check
    if (
      req.user.role === 'STAFF' &&
      incident.department._id.toString() !== req.user.department._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Incident belongs to another department.',
      });
    }

    incident.status = 'ACCEPTED';
    incident.assignedStaff = req.user._id;
    incident.acceptedAt = new Date();
    incident.timeline.push({
      status: 'ACCEPTED',
      note: `Incident accepted by staff member ${req.user.name}.`,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
    });

    await incident.save();

    // Update linked complaints status to IN_PROGRESS
    await Complaint.updateMany(
      { _id: { $in: incident.linkedComplaints } },
      { status: 'IN_PROGRESS' }
    );

    // Audit log
    await logAuditEvent({
      action: 'STAFF_ACCEPTED_INCIDENT',
      entityType: 'INCIDENT',
      entityId: incident._id,
      entityIdentifier: incident.incidentNumber,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      details: { department: incident.department.name },
      ipAddress: req.ip,
    });

    emitSocketEvent({
      event: 'incident:status_changed',
      data: {
        incidentId: incident._id,
        incidentNumber: incident.incidentNumber,
        status: incident.status,
        staffName: req.user.name,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Incident accepted by department staff.',
      incident,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProgress(req, res, next) {
  try {
    const { id } = req.params;
    const { note = 'Staff is actively working on resolving the incident.' } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    incident.status = 'IN_PROGRESS';
    incident.inProgressAt = new Date();
    incident.timeline.push({
      status: 'IN_PROGRESS',
      note,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
    });

    await incident.save();

    emitSocketEvent({
      event: 'incident:status_changed',
      data: {
        incidentId: incident._id,
        incidentNumber: incident.incidentNumber,
        status: incident.status,
        note,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Incident marked In Progress.',
      incident,
    });
  } catch (err) {
    next(err);
  }
}

export async function resolveIncident(req, res, next) {
  try {
    const { id } = req.params;
    const { notes = 'Issue successfully fixed and verified by department staff.' } = req.body;

    const incident = await Incident.findById(id).populate({
      path: 'linkedComplaints',
      populate: { path: 'student' },
    });

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    let afterEvidence = null;
    if (req.file) {
      afterEvidence = new Evidence({
        incidentId: incident._id,
        captureType: 'STAFF_RESOLUTION',
        imageUrl: `/uploads/${req.file.filename}`,
        latitude: incident.zone?.center?.latitude || 0,
        longitude: incident.zone?.center?.longitude || 0,
      });
      await afterEvidence.save();
    }

    incident.status = 'RESOLVED';
    incident.resolution = {
      notes,
      resolvedAt: new Date(),
      resolvedBy: req.user._id,
      afterEvidence: afterEvidence ? afterEvidence._id : null,
    };
    incident.timeline.push({
      status: 'RESOLVED',
      note: `Incident resolved by ${req.user.name}: ${notes}`,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
    });

    await incident.save();

    // Mark all linked complaints as RESOLVED
    await Complaint.updateMany(
      { _id: { $in: incident.linkedComplaints } },
      { status: 'RESOLVED' }
    );

    // Notify all linked students
    for (const complaint of incident.linkedComplaints) {
      if (complaint.student) {
        const notif = new Notification({
          recipient: complaint.student._id,
          title: `Campus Issue Resolved: #${incident.incidentNumber}`,
          message: `The reported issue "${incident.title}" has been resolved by the department.\nNotes: ${notes}`,
          type: 'INCIDENT_RESOLVED',
          relatedIncident: incident._id,
          relatedComplaint: complaint._id,
        });
        await notif.save();

        emitSocketEvent({
          room: `user:${complaint.student._id}`,
          event: 'notification:new',
          data: notif,
        });

        sendEmail({
          to: complaint.student.email,
          subject: `[SmartCampus] Issue Resolved: ${incident.title}`,
          text: `Hello ${complaint.student.name},\n\nWe are pleased to inform you that the issue you reported (#${complaint.complaintNumber}) has been RESOLVED by our department staff.\n\nResolution Notes:\n${notes}\n\nThank you for making our campus better!`,
        });
      }
    }

    // Audit Log
    await logAuditEvent({
      action: 'STAFF_RESOLVED_INCIDENT',
      entityType: 'INCIDENT',
      entityId: incident._id,
      entityIdentifier: incident.incidentNumber,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      details: {
        resolvedReportsCount: incident.linkedComplaints.length,
        notes,
      },
      ipAddress: req.ip,
    });

    emitSocketEvent({
      event: 'incident:status_changed',
      data: {
        incidentId: incident._id,
        incidentNumber: incident.incidentNumber,
        status: 'RESOLVED',
        resolutionNotes: notes,
      },
    });

    const populatedIncident = await Incident.findById(incident._id)
      .populate('department')
      .populate('zone')
      .populate('primaryEvidence')
      .populate('resolution.afterEvidence')
      .populate('resolution.resolvedBy', 'name email');

    return res.status(200).json({
      success: true,
      message: `Incident #${incident.incidentNumber} resolved. All ${incident.linkedComplaints.length} reporting students notified!`,
      incident: populatedIncident,
    });
  } catch (err) {
    next(err);
  }
}
