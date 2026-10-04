import React from 'react';
import { SeverityBadge } from './StatusBadge';
import { Sparkles, AlertTriangle, Layers } from 'lucide-react';

export function AIScoreIndicator({ aiAnalysis }) {
  if (!aiAnalysis) return null;

  const {
    matchConfidence = 0,
    isEvidenceMismatch = false,
    suggestedCategory = 'General',
    suggestedSeverity = 'MEDIUM',
    reason = '',
    duplicateConfidence = 0,
    similarComplaints = [],
  } = aiAnalysis;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          AI Analysis Results
        </span>
        <span className="text-[11px] text-emerald-400 font-bold">
          {matchConfidence}% Image Match
        </span>
      </div>

      {isEvidenceMismatch && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Image content may not match description. Human review required.</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Category:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold border border-slate-700">
            {suggestedCategory}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Severity:</span>
          <SeverityBadge severity={suggestedSeverity} />
        </div>

        {duplicateConfidence >= 75 && (
          <div className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium border border-purple-500/40 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Similar to {similarComplaints.length || 1} other report(s)</span>
          </div>
        )}
      </div>

      {reason && (
        <p className="text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800 leading-relaxed text-[11px]">
          {reason}
        </p>
      )}
    </div>
  );
}
