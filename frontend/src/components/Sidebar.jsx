import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Camera,
  CheckSquare,
  Wrench,
  BarChart3,
  MapPin,
  FileText,
  FolderGit2,
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const studentLinks = [
    { to: '/student', label: 'My Reports', icon: LayoutDashboard },
    { to: '/student/submit', label: 'Submit Report', icon: Camera },
  ];

  const reviewerLinks = [
    { to: '/reviewer', label: 'Review Queue', icon: CheckSquare },
    { to: '/incidents', label: 'All Incidents', icon: FolderGit2 },
    { to: '/admin/heatmap', label: 'Campus Map', icon: MapPin },
  ];

  const staffLinks = [
    { to: '/staff', label: 'My Department Tasks', icon: Wrench },
    { to: '/incidents', label: 'All Incidents', icon: FolderGit2 },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: BarChart3 },
    { to: '/admin/heatmap', label: 'Campus Map', icon: MapPin },
    { to: '/incidents', label: 'Incidents', icon: FolderGit2 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  let links = studentLinks;
  if (user.role === 'REVIEWER') links = reviewerLinks;
  else if (user.role === 'STAFF') links = staffLinks;
  else if (user.role === 'ADMIN') links = adminLinks;

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 p-3 shrink-0 flex flex-col justify-between">
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/student' || link.to === '/reviewer' || link.to === '/staff' || link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        SmartCampus Portal
      </div>
    </aside>
  );
}
