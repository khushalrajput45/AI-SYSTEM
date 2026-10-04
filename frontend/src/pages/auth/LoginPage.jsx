import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Zap, ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const { login, demoQuickLogin, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSubmitting(true);
      const res = await login(email, password);
      redirectRole(res.user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async (role, deptCode = 'IT') => {
    try {
      setError('');
      setSubmitting(true);
      const res = await demoQuickLogin(role, deptCode);
      redirectRole(res.user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const redirectRole = (role) => {
    switch (role) {
      case 'STUDENT':
        navigate('/student');
        break;
      case 'REVIEWER':
        navigate('/reviewer');
        break;
      case 'STAFF':
        navigate('/staff');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Col: Hero Pitch & Demo Role Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Campus Operations AI</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Evidence-Backed Campus Incident Platform
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              Transforms individual student reports into verified, clustered, and prioritized campus incidents automatically routed to the right university department.
            </p>
          </div>

          {/* 1-Click Interactive Presentation Switchers */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>1-Click Interactive Demo Profiles (Instant Sign-in):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Student Card */}
              <button
                type="button"
                onClick={() => handleDemoClick('STUDENT')}
                className="p-3.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">🎓 Student Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Live camera capture, GPS geofencing & tracking.
                </p>
              </button>

              {/* Reviewer Card */}
              <button
                type="button"
                onClick={() => handleDemoClick('REVIEWER')}
                className="p-3.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">🛡️ Reviewer & Verifier</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  AI confidence scores, duplicate clustering & routing.
                </p>
              </button>

              {/* Staff Card */}
              <button
                type="button"
                onClick={() => handleDemoClick('STAFF', 'IT')}
                className="p-3.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">💻 IT Department Staff</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Scoped queue, resolution notes & after-repair photo.
                </p>
              </button>

              {/* Admin Card */}
              <button
                type="button"
                onClick={() => handleDemoClick('ADMIN')}
                className="p-3.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">👑 Dean / Admin</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Campus heatmap, analytics & chronological audit logs.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Standard Login Form */}
        <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your university credentials to continue.
            </p>
          </div>

          {(error || authError) && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {error || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@smartcampus.edu"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Workspace'}
            </button>
          </form>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Default Seed Password:</span>
            <span className="font-mono text-emerald-400">password123</span>
          </div>

          <div className="text-center pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-400 hover:underline font-semibold">
                Sign Up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
