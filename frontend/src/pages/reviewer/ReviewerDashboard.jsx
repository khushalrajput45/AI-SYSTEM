import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { SeverityBadge } from '../../components/StatusBadge';
import { Check, X, Layers, RefreshCw } from 'lucide-react';

export function ReviewerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Merge modal
  const [mergeModalItem, setMergeModalItem] = useState(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');

  // Reject modal
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchQueue();
    fetchIncidents();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/queue');
      if (res.data?.success) setComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incidents?status=REPORTED');
      if (res.data?.success) setIncidents(res.data.incidents);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleApprove = async (complaint) => {
    try {
      await api.post(`/reviews/${complaint._id}/process`, {
        action: 'APPROVE',
        finalCategory: complaint.aiAnalysis?.suggestedCategory || 'General',
        finalSeverity: complaint.aiAnalysis?.suggestedSeverity || 'MEDIUM',
      });
      fetchQueue();
      fetchIncidents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMergeSubmit = async (e) => {
    e.preventDefault();
    if (!mergeModalItem || !selectedIncidentId) return;
    try {
      await api.post(`/reviews/${mergeModalItem._id}/process`, {
        action: 'MERGE',
        targetIncidentId: selectedIncidentId,
      });
      setMergeModalItem(null);
      fetchQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalItem) return;
    try {
      await api.post(`/reviews/${rejectModalItem._id}/process`, {
        action: 'REJECT',
        reviewerNotes: rejectReason || 'Evidence mismatch or invalid campus report.',
      });
      setRejectModalItem(null);
      fetchQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Reviewer Verification Queue</h1>
          <p className="text-xs text-slate-400">Verify and route new campus reports ({complaints.length} pending).</p>
        </div>
        <button
          onClick={fetchQueue}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs">Loading queue...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            🎉 All caught up! No pending reports to verify.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {complaints.map((c) => (
              <div key={c._id} className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400 font-mono">#{c.complaintNumber}</span>
                    <SeverityBadge severity={c.aiAnalysis?.suggestedSeverity || 'MEDIUM'} />
                    <span className="text-slate-400">Category: <b className="text-slate-200">{c.aiAnalysis?.suggestedCategory || 'General'}</b></span>
                  </div>
                  <span className="text-[11px] text-slate-400">📍 {c.location?.zoneName}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {c.evidence?.imageUrl && (
                    <img
                      src={c.evidence.imageUrl.startsWith('http') ? c.evidence.imageUrl : `http://localhost:5000${c.evidence.imageUrl}`}
                      alt="Proof"
                      className="w-24 h-18 object-cover rounded-lg bg-slate-950 shrink-0"
                    />
                  )}
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-slate-200 font-medium leading-relaxed">"{c.description}"</p>
                    <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 pt-0.5">
                      <span>Image Match: <b className="text-emerald-400">{c.aiAnalysis?.matchConfidence || 85}%</b></span>
                      {c.aiAnalysis?.duplicateConfidence >= 75 && (
                        <span className="text-purple-300">Duplicate Score: <b>{c.aiAnalysis?.duplicateConfidence}%</b></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                  <button
                    onClick={() => {
                      setRejectModalItem(c);
                      setRejectReason('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 font-medium transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setMergeModalItem(c);
                      setSelectedIncidentId(c.aiAnalysis?.suggestedIncident?._id || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-medium transition"
                  >
                    Merge with Incident
                  </button>
                  <button
                    onClick={() => handleApprove(c)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Route</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Merge Modal */}
      {mergeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleMergeSubmit} className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-w-md w-full space-y-3 text-xs">
            <h3 className="font-bold text-slate-100">Merge Report #{mergeModalItem.complaintNumber}</h3>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
            >
              <option value="">-- Select Master Incident --</option>
              {incidents.map((inc) => (
                <option key={inc._id} value={inc._id}>
                  #{inc.incidentNumber}: {inc.title}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMergeModalItem(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-teal-500 text-slate-950 font-bold rounded-lg">Confirm Merge</button>
            </div>
          </form>
        </div>
      )}

      {/* Simple Reject Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-w-md w-full space-y-3 text-xs">
            <h3 className="font-bold text-slate-100">Reject Report #{rejectModalItem.complaintNumber}</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for student..."
              rows={2}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setRejectModalItem(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-rose-500 text-white font-bold rounded-lg">Confirm Rejection</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
