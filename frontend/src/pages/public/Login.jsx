import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, Building2, Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('DONOR');
  const [email, setEmail] = useState('donor@demo.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password, role);
      if (userData.role === 'DONOR') navigate('/donor/dashboard');
      else if (userData.role === 'HOSPITAL') navigate('/hospital/dashboard');
      else if (userData.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (targetRole, demoEmail, demoPass) => {
    setRole(targetRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100 text-red-600 mb-2">
            <Heart className="w-6 h-6 fill-red-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to your role-based Smart Blood Donor portal</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl gap-1 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => { setRole('DONOR'); setEmail('donor@demo.com'); setPassword('Password123!'); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              role === 'DONOR' ? 'bg-white text-red-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Donor
          </button>
          <button
            type="button"
            onClick={() => { setRole('HOSPITAL'); setEmail('cityhospital@demo.com'); setPassword('Password123!'); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              role === 'HOSPITAL' ? 'bg-white text-red-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Hospital
          </button>
          <button
            type="button"
            onClick={() => { setRole('ADMIN'); setEmail('admin@demo.com'); setPassword('AdminPassword123!'); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              role === 'ADMIN' ? 'bg-white text-red-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition shadow-md shadow-red-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In to {role.charAt(0) + role.slice(1).toLowerCase()} Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill helper box */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ⚡ Quick Demo 1-Click Fill:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('DONOR', 'donor@demo.com', 'Password123!')}
                className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-100 transition truncate"
              >
                🩸 Donor (Rahul A+)
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('DONOR', 'sarah@demo.com', 'Password123!')}
                className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-100 transition truncate"
              >
                🩸 Donor (Sarah O-)
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('HOSPITAL', 'cityhospital@demo.com', 'Password123!')}
                className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-100 transition truncate"
              >
                🏥 City Hospital (Approved)
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('ADMIN', 'admin@demo.com', 'AdminPassword123!')}
                className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-100 transition truncate"
              >
                🛡️ System Admin
              </button>
            </div>
          </div>
        </div>

        {/* Links to register */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>
            Don't have an account?{' '}
            <Link to="/register-donor" className="font-semibold text-red-600 hover:underline">
              Register as Donor
            </Link>{' '}
            or{' '}
            <Link to="/register-hospital" className="font-semibold text-blue-600 hover:underline">
              Register Hospital
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
