import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import {
  ArrowLeft,
  FolderGit2,
  Layers,
  MapPin,
  Building2,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

export function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/incidents/${id}`);
      if (res.data?.success) {
        setIncident(res.data.incident);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400 text-xs">
        Loading master incident telemetry...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-slate-400">Incident not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Incidents</span>
      </button>

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-indigo-400 font-mono">
              #{incident.incidentNumber}
            </span>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>

          <div className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>{incident.reportCount || 1} Clustered Student Submissions</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-100">{incident.title}</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {incident.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <b>{incident.department?.name || 'Department'}</b>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {incident.zoneName || 'Campus'} ({incident.locationDetail || 'Location'})
          </span>
          <span>•</span>
          <span>
            Logged {new Date(incident.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Grid: Before Evidence vs After Resolution Evidence Proof */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Initial Before Photo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Initial Student Camera Evidence (Before)
          </h3>

          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            {incident.primaryEvidence?.imageUrl ? (
              <img
                src={
                  incident.primaryEvidence.imageUrl.startsWith('http')
                    ? incident.primaryEvidence.imageUrl
                    : `http://localhost:5000${incident.primaryEvidence.imageUrl}`
                }
                alt="Before"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No initial image
              </div>
            )}
          </div>
        </div>

        {/* After Resolution Photo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Department Resolution Proof (After)
          </h3>

          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            {incident.resolution?.afterEvidence?.imageUrl ? (
              <img
                src={
                  incident.resolution.afterEvidence.imageUrl.startsWith('http')
                    ? incident.resolution.afterEvidence.imageUrl
                    : `http://localhost:5000${incident.resolution.afterEvidence.imageUrl}`
                }
                alt="After"
                className="w-full h-full object-cover"
              />
            ) : incident.status === 'RESOLVED' ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-emerald-400 p-4 text-center">
                <FileCheck className="w-8 h-8 mb-2 opacity-80" />
                <span>Verified resolved on-site by department technicians.</span>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Resolution photo pending...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Notes Box if Resolved */}
      {incident.status === 'RESOLVED' && incident.resolution?.notes && (
        <div className="p-6 bg-emerald-950/20 border border-emerald-500/40 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Official Resolution Documentation
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">
            "{incident.resolution.notes}"
          </p>
          <div className="text-[11px] text-slate-400 pt-1">
            Resolved by: <b>{incident.resolution.resolvedBy?.name || 'Department Staff'}</b> on{' '}
            {new Date(incident.resolution.resolvedAt || incident.updatedAt).toLocaleString()}
          </div>
        </div>
      )}

      {/* Clustered Student Complaints Accordion / List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            Clustered Student Reports ({incident.linkedComplaints?.length || 0})
          </h2>
          <p className="text-xs text-slate-400">
            Semantic Vector Search condensed these individual student reports into this 1 master incident.
          </p>
        </div>

        <div className="space-y-3">
          {incident.linkedComplaints?.map((cmp) => (
            <div
              key={cmp._id}
              className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 font-mono">
                    #{cmp.complaintNumber}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-medium">
                    Student: {cmp.student?.name || 'Student'} ({cmp.student?.studentId || 'ID'})
                  </span>
                </div>
                <p className="text-slate-300 italic">"{cmp.description}"</p>
              </div>

              <div className="text-right shrink-0">
                <Link
                  to={`/student/complaints/${cmp._id}`}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  View Report & AI Breakdown →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifecycle Timeline */}
      {incident.timeline?.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Incident Action Timeline
          </h2>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
            {incident.timeline.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                  {idx + 1}
                </div>
                <div className="flex-1 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">{step.status}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{step.note}</p>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    By: {step.performedByName || 'Staff / Reviewer'} ({step.performedByRole || 'SYSTEM'})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
