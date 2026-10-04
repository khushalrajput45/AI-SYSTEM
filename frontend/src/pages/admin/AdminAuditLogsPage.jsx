import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, User, Clock, RefreshCw, Activity, Shield } from 'lucide-react';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = entityFilter ? `/admin/audit-logs?entityType=${entityFilter}` : '/admin/audit-logs';
      const res = await api.get(url);
      if (res.data?.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'COMPLAINT_SUBMITTED':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-semibold">Report Submitted</span>;
      case 'REVIEWER_APPROVED_COMPLAINT':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">Report Approved</span>;
      case 'REVIEWER_REJECTED_COMPLAINT':
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-semibold">Report Rejected</span>;
      case 'REVIEWER_CLUSTERED_INCIDENT':
      case 'REVIEWER_MERGED_COMPLAINT':
        return <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] font-semibold">Reports Clustered</span>;
      case 'STAFF_ACCEPTED_INCIDENT':
        return <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold">Task Accepted</span>;
      case 'STAFF_IN_PROGRESS_INCIDENT':
        return <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[11px] font-semibold">Work Started</span>;
      case 'STAFF_RESOLVED_INCIDENT':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">Issue Resolved</span>;
      case 'USER_LOGIN':
      case 'DEMO_QUICK_LOGIN':
        return <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">User Login</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">{action.replace(/_/g, ' ')}</span>;
    }
  };

  const formatLogSummary = (log) => {
    const d = log.details || {};
    switch (log.action) {
      case 'COMPLAINT_SUBMITTED':
        return `Student submitted issue at ${d.zoneName || 'Campus'} (AI Match: ${d.matchConfidence ?? d.confidence ?? 85}%, Severity: ${d.suggestedSeverity || 'Normal'}).`;
      case 'REVIEWER_APPROVED_COMPLAINT':
        return `Reviewer approved report and assigned to department (Severity: ${d.severity || 'HIGH'}${d.incidentNumber ? `, Incident #${d.incidentNumber}` : ''}).`;
      case 'REVIEWER_REJECTED_COMPLAINT':
        return `Reviewer rejected report with note: "${d.reason || 'Evidence mismatch or invalid campus report'}".`;
      case 'REVIEWER_CLUSTERED_INCIDENT':
        return `AI grouped ${d.clusteredReports?.length || 'multiple'} similar student reports into unified master incident.`;
      case 'REVIEWER_MERGED_COMPLAINT':
        return `Merged student report into existing master incident.`;
      case 'STAFF_ACCEPTED_INCIDENT':
        return `Department staff acknowledged and accepted repair assignment for ${d.department || 'facility'}.`;
      case 'STAFF_IN_PROGRESS_INCIDENT':
        return `Technician arrived on-site and began active maintenance work.`;
      case 'STAFF_RESOLVED_INCIDENT':
        return `Repair completed successfully. Staff Note: "${d.notes || 'Issue resolved and verified'}".`;
      case 'DEMO_QUICK_LOGIN':
      case 'USER_LOGIN':
        return `Session authenticated as ${log.performedByName || 'User'} (${d.demoRole || d.role || log.performedByRole || 'Member'}).`;
      default:
        if (typeof d === 'string') return d;
        if (Object.keys(d).length === 0) return 'System event recorded.';
        return Object.entries(d)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1')}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join(' • ');
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Campus Activity & Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological record of all student reports, reviewer decisions, and staff resolutions.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Activities</option>
            <option value="COMPLAINT">Student Reports</option>
            <option value="INCIDENT">Department Incidents</option>
            <option value="AUTH">User Logins</option>
          </select>
          <button
            onClick={fetchLogs}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Clean Log List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs">Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">No activity logs recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {logs.map((log) => (
              <div
                key={log._id}
                className="p-3.5 hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    {log.entityIdentifier && (
                      <span className="font-bold text-emerald-400 font-mono text-[11px]">
                        #{log.entityIdentifier}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed font-normal">
                    {formatLogSummary(log)}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0 space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
                  <div className="text-slate-300 font-medium flex items-center sm:justify-end gap-1 text-[11px]">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{log.performedByName || 'System'}</span>
                    <span className="text-slate-500">({log.performedByRole})</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center sm:justify-end gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
