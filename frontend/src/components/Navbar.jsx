import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  ShieldCheck,
  Bell,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, demoQuickLogin } = useAuth();
  const { unreadCount, liveNotifications, markAllAsRead, clearAllNotifications } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const demoRef = useRef(null);

  // Click outside to automatically close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (demoRef.current && !demoRef.current.contains(event.target)) {
        setShowDemoMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleSwitch = async (role, deptCode) => {
    try {
      await demoQuickLogin(role, deptCode);
      setShowDemoMenu(false);
      if (role === 'STUDENT') navigate('/student');
      else if (role === 'REVIEWER') navigate('/reviewer');
      else if (role === 'STAFF') navigate('/staff');
      else if (role === 'ADMIN') navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearNotifications = async () => {
    await clearAllNotifications();
    setShowNotifications(false); // Automatically close pop-up on clear
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-100 text-base tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm">
            SC
          </div>
          <span>SmartCampus</span>
        </Link>

        {/* Right Section */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Simple Role Switcher */}
            <div className="relative" ref={demoRef}>
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
              >
                <span className="text-slate-400">Role:</span>
                <span className="font-semibold text-emerald-400">{user.role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1 z-50 text-xs">
                  <button
                    onClick={() => handleRoleSwitch('STUDENT')}
                    className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 rounded-lg"
                  >
                    🎓 Student
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('REVIEWER')}
                    className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 rounded-lg"
                  >
                    🛡️ Reviewer
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('STAFF', 'IT')}
                    className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 rounded-lg"
                  >
                    🛠️ IT Staff
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('ADMIN')}
                    className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 rounded-lg"
                  >
                    👑 Admin
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  const nextState = !showNotifications;
                  setShowNotifications(nextState);
                  if (nextState && unreadCount > 0) markAllAsRead();
                }}
                className="relative p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="font-semibold text-slate-200">Notifications</span>
                    <button
                      onClick={handleClearNotifications}
                      className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      Clear & Close
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {liveNotifications.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No notifications.</p>
                    ) : (
                      liveNotifications.map((n, i) => (
                        <div key={n._id || i} className="p-2 rounded bg-slate-800/60 text-slate-300">
                          <p className="font-semibold text-emerald-400">{n.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
              <span className="text-slate-300 hidden sm:inline">{user.name}</span>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <Link to="/login" className="px-3 py-1.5 text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link to="/signup" className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
