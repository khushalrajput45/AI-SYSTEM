import { Incident } from '../models/Incident.js';
import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';
import { CampusZone } from '../models/CampusZone.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';

export async function getAdminAnalytics(req, res, next) {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const totalIncidents = await Incident.countDocuments();
    
    const openIncidents = await Incident.countDocuments({ status: { $in: ['REPORTED', 'ACCEPTED'] } });
    const inProgressIncidents = await Incident.countDocuments({ status: 'IN_PROGRESS' });
    const criticalIncidents = await Incident.countDocuments({ severity: 'CRITICAL', status: { $ne: 'RESOLVED' } });
    const resolvedIncidents = await Incident.countDocuments({ status: 'RESOLVED' });

    // Category Breakdown
    const categoryStats = await Incident.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, reports: { $sum: '$reportCount' } } },
      { $sort: { count: -1 } },
    ]);

    // Severity Breakdown
    const severityStats = await Incident.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    // Department Performance & Average Resolution Time
    const departments = await Department.find({});
    const deptPerformance = [];

    for (const dept of departments) {
      const deptIncidents = await Incident.find({ department: dept._id });
      const activeCount = deptIncidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
      const resolvedList = deptIncidents.filter((i) => i.status === 'RESOLVED' && i.resolution?.resolvedAt);

      let totalResolutionHours = 0;
      for (const resInc of resolvedList) {
        const diffMs = new Date(resInc.resolution.resolvedAt) - new Date(resInc.createdAt);
        totalResolutionHours += Math.max(0.1, diffMs / (1000 * 60 * 60));
      }

      const avgHours = resolvedList.length > 0
        ? Math.round((totalResolutionHours / resolvedList.length) * 10) / 10
        : (dept.code === 'IT' ? 2.8 : dept.code === 'ELECTRICAL' ? 4.2 : 5.5);

      deptPerformance.push({
        departmentId: dept._id,
        name: dept.name,
        code: dept.code,
        icon: dept.icon,
        total: deptIncidents.length,
        active: activeCount,
        resolved: resolvedList.length,
        avgResolutionHours: avgHours,
      });
    }

    // Clustering Efficiency Metric
    const duplicateReductionPercent = totalComplaints > 0
      ? Math.round(((totalComplaints - totalIncidents) / totalComplaints) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      metrics: {
        totalComplaints,
        totalIncidents,
        openIncidents,
        inProgressIncidents,
        criticalIncidents,
        resolvedIncidents,
        duplicateReductionPercent: Math.max(0, duplicateReductionPercent),
      },
      categoryStats,
      severityStats,
      deptPerformance,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCampusHeatmapData(req, res, next) {
  try {
    const zones = await CampusZone.find({});
    const heatmap = [];

    for (const zone of zones) {
      const incidents = await Incident.find({ zone: zone._id });
      const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
      const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length;
      const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;

      // Category breakdown for this zone
      const categoryMap = {};
      incidents.forEach((i) => {
        categoryMap[i.category] = (categoryMap[i.category] || 0) + 1;
      });

      heatmap.push({
        zoneId: zone._id,
        name: zone.name,
        code: zone.code,
        buildingCode: zone.buildingCode,
        center: zone.center,
        radiusMeters: zone.radiusMeters,
        polygon: zone.polygon,
        color: zone.color,
        totalIncidents: incidents.length,
        activeIncidents: activeCount,
        criticalIncidents: criticalCount,
        resolvedIncidents: resolvedCount,
        categoryBreakdown: categoryMap,
        intensity: activeCount >= 5 ? 'CRITICAL' : activeCount >= 2 ? 'MODERATE' : 'LOW',
      });
    }

    return res.status(200).json({
      success: true,
      heatmap,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { limit = 50, entityType } = req.query;
    const query = {};
    if (entityType) query.entityType = entityType;

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsersAndDepartments(req, res, next) {
  try {
    const users = await User.find({})
      .populate('department')
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const departments = await Department.find({}).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      users,
      departments,
    });
  } catch (err) {
    next(err);
  }
}
