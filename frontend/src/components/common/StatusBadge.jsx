import React from 'react';

export const StatusBadge = ({ status, type = 'default' }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  // Urgency styling
  if (type === 'urgency') {
    if (normalized === 'CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          CRITICAL
        </span>
      );
    }
    if (normalized === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          HIGH URGENCY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        NORMAL
      </span>
    );
  }

  // Request Status styling
  const styles = {
    OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
    RESPONSES_RECEIVED: 'bg-purple-50 text-purple-700 border-purple-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    FULFILLED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200',

    // Donor response statuses
    INTERESTED: 'bg-sky-50 text-sky-700 border-sky-200',
    CONTACTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SCHEDULED: 'bg-teal-50 text-teal-700 border-teal-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-300 font-bold',
    DECLINED: 'bg-rose-50 text-rose-700 border-rose-200',
    WITHDRAWN: 'bg-gray-100 text-gray-600 border-gray-200',
    DEFERRED: 'bg-orange-50 text-orange-700 border-orange-200',

    // Verification
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const style = styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export const BloodGroupBadge = ({ group, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-bold',
  };

  return (
    <span className={`inline-flex items-center font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg shadow-sm ${sizeClasses[size]}`}>
      🩸 {group}
    </span>
  );
};
