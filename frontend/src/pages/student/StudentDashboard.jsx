import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Camera, Plus, ArrowRight } from 'lucide-react';

export function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/my');
      if (res.data?.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100">My Reports</h1>
          <p className="text-xs text-slate-400">Track your submitted campus issues.</p>
        </div>

        <Link
          to="/student/submit"
          className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>New Report</span>
        </Link>
      </div>

      {/* Reports List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs">Loading reports...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 space-y-2 text-xs">
            <p className="text-slate-400">No reports submitted yet.</p>
            <Link to="/student/submit" className="text-emerald-400 hover:underline font-semibold">
              Submit your first report
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="p-3.5 sm:p-4 hover:bg-slate-800/40 transition flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400 font-mono">#{c.complaintNumber}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-slate-200 font-medium truncate">{c.description}</p>
                  <p className="text-[11px] text-slate-400">
                    📍 {c.location?.zoneName || 'Campus'} • {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  to={`/student/complaints/${c._id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 flex items-center gap-1 transition"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
