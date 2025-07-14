import React from "react";

const iconMap = {
  "ticket-open": (
    <svg width="28" height="28" fill="none" stroke="#6E41F4" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7V3h10v4"/></svg>
  ),
  "ticket-closed": (
    <svg width="28" height="28" fill="none" stroke="#22C55E" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7V3h10v4"/><path d="M9 14l2 2l4-4"/></svg>
  ),
  "clock": (
    <svg width="28" height="28" fill="none" stroke="#F59E42" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  ),
  "check-circle": (
    <svg width="28" height="28" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>
  ),
  "users": (
    <svg width="28" height="28" fill="none" stroke="#F43F5E" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><circle cx="17" cy="17" r="4"/><path d="M17 13a4 4 0 0 0-8 0"/></svg>
  ),
};

export default function MetricsBar({ metrics }) {
  return (
    <div className="w-full flex flex-wrap gap-6 justify-between items-center mb-8">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex-1 min-w-[180px] max-w-[220px] bg-white/80 rounded-2xl shadow p-4 flex items-center gap-4"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: metric.color + '22' }}>
            {iconMap[metric.icon]}
          </div>
          <div>
            <div className="text-2xl font-bold text-[#232946]">{metric.value}</div>
            <div className="text-sm font-medium text-[#6B7280]">{metric.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 