import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CampusHeatmap } from '../../components/CampusHeatmap';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FolderGit2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [deptPerformance, setDeptPerformance] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, incidentsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/incidents?limit=5'),
      ]);

      if (analyticsRes.data?.success) {
        setMetrics(analyticsRes.data.metrics);
        setDeptPerformance(analyticsRes.data.deptPerformance || []);
      }
      if (incidentsRes.data?.success) {
        setRecentIncidents(incidentsRes.data.incidents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-xs">
        Loading admin telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Admin Control Center</h1>
          <p className="text-xs text-slate-400">Saveetha Engineering College Incident Operations</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Essential KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400">Total Reports</span>
            <div className="text-2xl font-bold text-slate-100">{metrics.totalComplaints}</div>
            <span className="text-[11px] text-slate-500">Student submissions</span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400">Clustered Incidents</span>
            <div className="text-2xl font-bold text-teal-400">{metrics.totalIncidents}</div>
            <span className="text-[11px] text-teal-500/80 font-medium">
              {metrics.duplicateReductionPercent}% duplicate reduction
            </span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400">Critical Issues</span>
            <div className={`text-2xl font-bold ${metrics.criticalIncidents > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {metrics.criticalIncidents}
            </div>
            <span className="text-[11px] text-slate-500">Immediate priority</span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400">Resolved Incidents</span>
            <div className="text-2xl font-bold text-emerald-400">{metrics.resolvedIncidents}</div>
            <span className="text-[11px] text-emerald-500/80">Completed repairs</span>
          </div>
        </div>
      )}

      {/* 2-Column Grid: Departments & Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* Department SLA Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Department Workload & SLA</span>
            </h2>
            <span className="text-[11px] text-slate-400">Avg Resolution</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {deptPerformance.map((dept) => (
              <div key={dept.departmentId} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{dept.name}</span>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="text-amber-400">● {dept.active} active</span>
                    <span className="text-emerald-400">● {dept.resolved} resolved</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-100 font-bold font-mono text-xs">
                    {dept.avgResolutionHours}h
                  </span>
                  <span className="text-[10px] text-slate-500 block">avg SLA</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-200 flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-teal-400" />
              <span>Active Campus Incidents</span>
            </h2>
            <Link to="/incidents" className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentIncidents.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No active incidents.</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentIncidents.slice(0, 4).map((inc) => (
                <div key={inc._id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-emerald-400 font-mono text-[11px]">#{inc.incidentNumber}</span>
                      <SeverityBadge severity={inc.severity} />
                      <StatusBadge status={inc.status} />
                    </div>
                    <p className="text-slate-200 font-medium truncate text-xs">{inc.title}</p>
                    <span className="text-[11px] text-slate-500 block">📍 {inc.zoneName}</span>
                  </div>
                  <Link
                    to={`/incidents/${inc._id}`}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg shrink-0"
                    title="View details"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Spatial Campus Heatmap */}
      <CampusHeatmap />
    </div>
  );
}
