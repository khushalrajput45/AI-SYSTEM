import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import { AIScoreIndicator } from '../../components/AIScoreIndicator';
import { ArrowLeft, MapPin, Calendar, User, ShieldCheck, Layers, Building2, Clock } from 'lucide-react';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      if (res.data?.success) {
        setComplaint(res.data.complaint);
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
        Loading complaint report details...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-slate-400">Complaint not found.</p>
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Reports</span>
      </button>

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 font-mono">
              #{complaint.complaintNumber}
            </span>
            <StatusBadge status={complaint.status} />
          </div>
          <h1 className="text-lg font-bold text-slate-100">
            "{complaint.description}"
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {complaint.location?.zoneName || 'Campus'} ({complaint.locationDetail || 'Reported Location'})
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {new Date(complaint.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Department Badge */}
        {complaint.assignedDepartment && (
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-right shrink-0">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">
              Assigned Department
            </span>
            <span className="text-xs font-bold text-indigo-300">
              {complaint.assignedDepartment.name}
            </span>
          </div>
        )}
      </div>

      {/* Grid: Captured Evidence Photo & AI Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evidence Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Live Camera Evidence
          </h3>

          {complaint.evidence?.imageUrl ? (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={
                  complaint.evidence.imageUrl.startsWith('http')
                    ? complaint.evidence.imageUrl
                    : `http://localhost:5000${complaint.evidence.imageUrl}`
                }
                alt="Complaint Evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/10 text-[11px] text-slate-300 flex items-center justify-between font-mono">
                <span>📍 Lat: {complaint.location?.latitude?.toFixed(4)}, Lng: {complaint.location?.longitude?.toFixed(4)}</span>
                <span className="text-emerald-400 font-bold">✓ Watermarked</span>
              </div>
            </div>
          ) : (
            <div className="h-48 rounded-2xl bg-slate-950 flex items-center justify-center text-xs text-slate-500">
              No evidence photo attached.
            </div>
          )}
        </div>

        {/* AI Breakdown */}
        <div className="space-y-4">
          <AIScoreIndicator aiAnalysis={complaint.aiAnalysis} />
        </div>
      </div>

      {/* Linked Incident Box (If Clustered) */}
      {complaint.incident && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-teal-500/30 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Clustered into Campus Incident #{complaint.incident.incidentNumber}
              </h3>
            </div>
            <StatusBadge status={complaint.incident.status} />
          </div>

          <p className="text-xs text-slate-300">
            <b>{complaint.incident.title}</b> — {complaint.incident.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Linked Reports: {complaint.incident.reportCount || 1} student(s)</span>
            <Link
              to={`/incidents/${complaint.incident._id}`}
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              View Full Incident & Resolution Timeline →
            </Link>
          </div>
        </div>
      )}

      {/* Reviewer Remarks */}
      {complaint.reviewerNotes && (
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1.5">
          <span className="text-xs font-bold text-slate-300">Reviewer Notes:</span>
          <p className="text-xs text-slate-400 italic leading-relaxed">
            "{complaint.reviewerNotes}"
          </p>
        </div>
      )}
    </div>
  );
}
