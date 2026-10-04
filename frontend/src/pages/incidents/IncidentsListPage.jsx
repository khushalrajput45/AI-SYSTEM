import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, SeverityBadge } from '../../components/StatusBadge';
import { FolderGit2, Layers, MapPin, Search, ArrowRight, Building2 } from 'lucide-react';

export function IncidentsListPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'ALL' ? '/incidents' : `/incidents?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setIncidents(res.data.incidents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = incidents.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.incidentNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      (i.zoneName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Campus Incident Registry
          </span>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-indigo-400" />
            Master Incidents Directory
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Clustered campus operations tickets consolidating multiple student reports into single actionable resolutions.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          {['ALL', 'REPORTED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by incident title, number (#INC-284), category, or campus zone..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Incidents Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Loading incidents...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No incidents matched your query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((inc) => (
              <div
                key={inc._id}
                className="bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 p-5 rounded-2xl transition space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400 font-mono">
                        #{inc.incidentNumber}
                      </span>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <StatusBadge status={inc.status} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {inc.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-teal-300 font-medium">
                      <Layers className="w-3.5 h-3.5" />
                      {inc.reportCount || 1} Student Reports
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {inc.department?.name || 'Department'}
                    </span>
                    <span>•</span>
                    <span>📍 {inc.zoneName || 'Campus'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Created {new Date(inc.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    to={`/incidents/${inc._id}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Inspect Incident</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
