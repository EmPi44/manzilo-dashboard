import React from "react";
import Image from "next/image";

// Key logo SVG with status dot
function KeyLogo() {
  return (
    <span className="relative inline-block w-8 h-8">
      {/* Key icon */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="w-8 h-8" stroke="#6E41F4" strokeWidth="2">
        <circle cx="16" cy="16" r="12" stroke="#6E41F4" strokeWidth="2" fill="#E9E3FF" />
        <rect x="20" y="13" width="6" height="2" rx="1" fill="#6E41F4" />
        <circle cx="16" cy="16" r="4" stroke="#6E41F4" strokeWidth="2" fill="#fff" />
        <rect x="14" y="10" width="4" height="8" rx="2" fill="#6E41F4" />
      </svg>
      {/* Status dot */}
      <span className="absolute top-0 right-0 w-1 h-1 bg-[#6E41F4] rounded-full border-2 border-white" style={{width: '16%', height: '16%'}} />
    </span>
  );
}

// Navigation icons (stroke, 24x24, 2px)
const navIcons = {
  Dashboard: (
    <svg width="24" height="24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>
  ),
  Buildings: (
    <svg width="24" height="24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="12" rx="2"/><rect x="7" y="12" width="2" height="4"/><rect x="11" y="12" width="2" height="4"/><rect x="15" y="12" width="2" height="4"/><rect x="9" y="8" width="6" height="4"/></svg>
  ),
  Tenants: (
    <svg width="24" height="24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M2 21v-2a4 4 0 014-4h12a4 4 0 014 4v2"/></svg>
  ),
  Reports: (
    <svg width="24" height="24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17v-6h2v6m4 0v-4h2v4"/></svg>
  ),
  Parking: (
    <svg width="24" height="24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
  ),
  Services: (
    <svg width="24" height="24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
  ),
  Subcontractors: (
    <svg width="24" height="24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12h10"/><path d="M12 7v10"/><circle cx="12" cy="12" r="10"/></svg>
  ),
};

const navItems = [
  "Dashboard",
  "Buildings",
  "Tenants",
  "Reports",
  "Parking",
  "Services",
  "Subcontractors",
];

const dmList = [
  { name: "Adem Barnes", message: "Hi! I'm moving out t...", unread: true },
  { name: "Cora Richards", message: "Thank you!", unread: false },
  { name: "Sumaya O'Neill", message: "Looking forward for...", unread: false },
  { name: "Lukas Mogowan", message: "That suits me well, t...", unread: false },
  { name: "Jaden Fischer", message: "Sure, 11 AM is fine for...", unread: false },
];

export default function Sidebar() {
  const activeNav = "Dashboard";
  return (
    <aside className="w-[200px] flex flex-col h-screen bg-white px-4 py-6">
      {/* Header/Brand */}
      <div className="flex items-center gap-2 mb-6">
        <Image src="/Manzilo_logo_Idee_2.jpeg" alt="Manzilo Logo" width={32} height={32} className="rounded" />
        <span className="text-[14px] font-semibold text-[#111827]">Manzilo</span>
      </div>
      {/* Nav */}
      <nav className="flex flex-col gap-1 mb-2">
        {navItems.map((label) => {
          const isActive = label === activeNav;
          return (
            <button
              key={label}
              className={`flex items-center gap-2 rounded-md relative transition text-[14px] font-medium ${
                isActive
                  ? "bg-[#F5F7FA] text-[#111827]"
                  : "hover:bg-[#F9FAFB] text-[#111827]"
              }`}
              style={{ fontWeight: 500, padding: '10px 14px' }}
            >
              {/* Active bar */}
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 rounded-r bg-[#6E41F4]" style={{width:3}} />
              )}
              <span className="flex items-center" style={{ minWidth: 18, minHeight: 18 }}>
                {navIcons[label]}
              </span>
              <span className="ml-2" style={{fontSize:14}}>{label}</span>
            </button>
          );
        })}
      </nav>
      {/* CTA Button */}
      <button className="mt-auto w-full h-10 bg-[#6E41F4] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-semibold shadow-none hover:bg-[#5a3fdc] transition" style={{borderRadius:10}}>
        {/* Brand icon */}
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="2"><circle cx="16" cy="16" r="12" stroke="#fff" strokeWidth="2" fill="#6E41F4" /><rect x="20" y="13" width="6" height="2" rx="1" fill="#fff" /><circle cx="16" cy="16" r="4" stroke="#fff" strokeWidth="2" fill="#6E41F4" /><rect x="14" y="10" width="4" height="8" rx="2" fill="#fff" /></svg>
        Broadcast
      </button>
    </aside>
  );
} 