import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import { Check, Play, CheckCircle } from 'lucide-react';

export function StaffDashboard() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff/incidents');
      if (res.data?.success) setIncidents(res.data.incidents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.patch(`/staff/incidents/${id}/accept`);
      fetchIncidents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProgress = async (id) => {
    try {
      await api.patch(`/staff/incidents/${id}/progress`, { note: 'Technician on-site.' });
      fetchIncidents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolvingId) return;
    try {
      const formData = new FormData();
      formData.append('notes', notes || 'Issue resolved.');
      await api.post(`/staff/incidents/${resolvingId}/resolve`, formData);
      setResolvingId(null);
      setNotes('');
      fetchIncidents();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100">
            {user?.department?.name || 'Department'} Queue
          </h1>
          <p className="text-xs text-slate-400">Assigned campus repair and maintenance tasks.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs">Loading tasks...</div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No incidents currently assigned to your department.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {incidents.map((inc) => (
              <div key={inc._id} className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 font-mono">#{inc.incidentNumber}</span>
                    <SeverityBadge severity={inc.severity} />
                    <StatusBadge status={inc.status} />
                  </div>
                  <span className="text-slate-400 text-[11px]">📍 {inc.zoneName}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-200">{inc.title}</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">{inc.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-teal-300">
                    Includes {inc.reportCount || 1} student report(s)
                  </span>

                  <div className="flex items-center gap-2">
                    {inc.status === 'REPORTED' && (
                      <button
                        onClick={() => handleAccept(inc._id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
                      >
                        Accept Task
                      </button>
                    )}

                    {inc.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleProgress(inc._id)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                      >
                        Start Work
                      </button>
                    )}

                    {inc.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => {
                          setResolvingId(inc._id);
                          setNotes('Issue successfully resolved and verified.');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
                      >
                        Resolve Task
                      </button>
                    )}

                    {inc.status === 'RESOLVED' && (
                      <span className="text-emerald-400 font-medium text-[11px]">✓ Resolved</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Resolve Modal */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleResolve} className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-w-md w-full space-y-3 text-xs">
            <h3 className="font-bold text-slate-100">Complete Resolution</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was fixed?"
              rows={2}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setResolvingId(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg">Mark Resolved</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
