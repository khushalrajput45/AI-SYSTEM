import React from 'react';

export function StatusBadge({ status }) {
  const configs = {
    PENDING_REVIEW: {
      label: 'Pending Review',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
    },
    APPROVED: {
      label: 'Approved & Routed',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      dot: 'bg-blue-400',
    },
    REPORTED: {
      label: 'Reported',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      dot: 'bg-indigo-400',
    },
    ACCEPTED: {
      label: 'Accepted by Staff',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      dot: 'bg-cyan-400',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      dot: 'bg-purple-400 animate-pulse',
    },
    MERGED_INTO_INCIDENT: {
      label: 'Clustered in Incident',
      bg: 'bg-teal-500/10',
      text: 'text-teal-400',
      border: 'border-teal-500/30',
      dot: 'bg-teal-400',
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-400',
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      dot: 'bg-slate-400',
    },
  };

  const current = configs[status] || {
    label: status,
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      {current.label}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const configs = {
    CRITICAL: {
      label: 'CRITICAL',
      bg: 'bg-red-500/15',
      text: 'text-red-400 font-bold',
      border: 'border-red-500/40',
      icon: '🚨',
    },
    HIGH: {
      label: 'HIGH',
      bg: 'bg-orange-500/15',
      text: 'text-orange-400 font-semibold',
      border: 'border-orange-500/40',
      icon: '⚠️',
    },
    MEDIUM: {
      label: 'MEDIUM',
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: '⚡',
    },
    LOW: {
      label: 'LOW',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: 'ℹ️',
    },
  };

  const current = configs[severity] || configs.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs border ${current.bg} ${current.text} ${current.border}`}
    >
      <span>{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
}
