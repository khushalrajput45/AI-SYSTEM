import { Incident } from '../models/Incident.js';

export async function getAllIncidents(req, res, next) {
  try {
    const { status, category, department, zone } = req.query;

    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (category) query.category = category;
    if (department) query.department = department;
    if (zone) query.zone = zone;

    const incidents = await Incident.find(query)
      .populate('department')
      .populate('zone')
      .populate('primaryEvidence')
      .populate('assignedStaff', 'name email role')
      .populate({
        path: 'linkedComplaints',
        populate: [
          { path: 'student', select: 'name email studentId' },
          { path: 'evidence' },
        ],
      })
      .populate('resolution.afterEvidence')
      .populate('resolution.resolvedBy', 'name email')
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

export async function getIncidentById(req, res, next) {
  try {
    const incident = await Incident.findById(req.params.id)
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
      .populate('resolution.afterEvidence')
      .populate('resolution.resolvedBy', 'name email');

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    return res.status(200).json({
      success: true,
      incident,
    });
  } catch (err) {
    next(err);
  }
}
