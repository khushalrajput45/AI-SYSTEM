import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Building2, ShieldCheck, Mail, Phone, Tag } from 'lucide-react';

export function AdminManagementPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsersAndDepartments();
  }, []);

  const fetchUsersAndDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/system-users');
      if (res.data?.success) {
        setUsers(res.data.users);
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-1">
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
          System Administration
        </span>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Users, Roles & Department Registry
        </h1>
        <p className="text-xs text-slate-400">
          RBAC user profiles and authorized university maintenance departments.
        </p>
      </div>

      {/* Grid: Departments and Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Campus Departments ({departments.length})
          </h2>

          <div className="space-y-3">
            {departments.map((d) => (
              <div
                key={d._id}
                className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-sm">{d.name}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                    {d.code}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{d.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {d.categories?.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Active Role Accounts ({users.length})
          </h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {users.map((u) => (
              <div
                key={u._id}
                className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{u.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : u.role === 'REVIEWER'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : u.role === 'STAFF'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {u.role} {u.department ? `(${u.department.name})` : ''}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{u.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
