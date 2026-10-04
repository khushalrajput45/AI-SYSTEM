import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ShieldCheck, User, Mail, Lock, Phone, GraduationCap, Building2, ArrowRight, Sparkles } from 'lucide-react';

export function SignupPage() {
  const { register, demoQuickLogin, error: authError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data?.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (err) {
      console.warn('Could not fetch departments for signup', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSubmitting(true);

      const payload = {
        name,
        email,
        password,
        role,
        studentId: role === 'STUDENT' ? studentId : undefined,
        department: role === 'STAFF' ? department : undefined,
        phone,
      };

      const res = await register(payload);
      if (res?.user) {
        if (res.user.role === 'STUDENT') navigate('/student');
        else if (res.user.role === 'REVIEWER') navigate('/reviewer');
        else if (res.user.role === 'STAFF') navigate('/staff');
        else if (res.user.role === 'ADMIN') navigate('/admin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full bg-slate-900/95 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto">
            <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create SmartCampus Account</h1>
          <p className="text-xs text-slate-400">
            Join the verified campus incident reporting and management ecosystem.
          </p>
        </div>

        {(error || authError) && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  role === 'STUDENT'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setRole('STAFF')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  role === 'STAFF'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                🛠️ Staff
              </button>
              <button
                type="button"
                onClick={() => setRole('REVIEWER')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  role === 'REVIEWER'
                    ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                🛡️ Reviewer
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">University Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@smartcampus.edu"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password (min 6 chars) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Conditional Student ID */}
          {role === 'STUDENT' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Student Roll / ID Number</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-2026-099"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {/* Conditional Staff Department */}
          {role === 'STAFF' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Assigned Department *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="">-- Select Your Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Phone (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {submitting ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:underline font-semibold">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
