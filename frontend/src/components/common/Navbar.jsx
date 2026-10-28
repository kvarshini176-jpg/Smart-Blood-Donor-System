import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  HeartHandshake,
  Bell,
  LogOut,
  User,
  Activity,
  PlusCircle,
  FileText,
  ShieldCheck,
  CheckCheck,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-red-600 transition">
                Smart Blood <span className="text-red-600">Donor</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Lifesaving Healthcare Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/about') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  About
                </Link>
                <Link
                  to="/how-it-works"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/how-it-works') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  How It Works
                </Link>
                <Link
                  to="/contact"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/contact') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Contact
                </Link>
              </>
            ) : user.role === 'DONOR' ? (
              <>
                <Link
                  to="/donor/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/donor/dashboard') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/donor/requests"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/donor/requests') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Available Requests
                </Link>
                <Link
                  to="/donor/history"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/donor/history') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Donation History
                </Link>
                <Link
                  to="/donor/profile"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/donor/profile') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Profile
                </Link>
              </>
            ) : user.role === 'HOSPITAL' ? (
              <>
                <Link
                  to="/hospital/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/hospital/dashboard') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/hospital/create-request"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm flex items-center gap-1.5 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Blood Request
                </Link>
                <Link
                  to="/hospital/requests"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/hospital/requests') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Manage Requests
                </Link>
                <Link
                  to="/hospital/donations"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/hospital/donations') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Donations
                </Link>
                <Link
                  to="/hospital/profile"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/hospital/profile') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hospital Profile
                </Link>
              </>
            ) : user.role === 'ADMIN' ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/dashboard') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin Overview
                </Link>
                <Link
                  to="/admin/verifications"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/verifications') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Verifications
                </Link>
                <Link
                  to="/admin/donors"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/donors') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Donors
                </Link>
                <Link
                  to="/admin/hospitals"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/hospitals') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hospitals
                </Link>
                <Link
                  to="/admin/requests"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/requests') ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Requests
                </Link>
              </>
            ) : null}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/register-donor"
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20 transition"
                  >
                    Register as Donor
                  </Link>
                  <Link
                    to="/register-hospital"
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Hospital Portal
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notification Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-scale-up">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">
                          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => !n.isRead && markAsRead(n.id)}
                              className={`p-3.5 text-left transition cursor-pointer hover:bg-slate-50 ${
                                !n.isRead ? 'bg-red-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                  {n.title}
                                </h4>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="hidden sm:block text-right">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[130px]">
                      {user.donorProfile?.fullName || user.hospitalProfile?.hospitalName || user.email.split('@')[0]}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {!isAuthenticated ? (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Home</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">About</Link>
              <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">How It Works</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Contact</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-red-600">Log In</Link>
              <Link to="/register-donor" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Register as Donor</Link>
              <Link to="/register-hospital" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Hospital Portal</Link>
            </>
          ) : (
            <>
              {user.role === 'DONOR' && (
                <>
                  <Link to="/donor/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Dashboard</Link>
                  <Link to="/donor/requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Available Requests</Link>
                  <Link to="/donor/history" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">History</Link>
                  <Link to="/donor/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Profile</Link>
                </>
              )}
              {user.role === 'HOSPITAL' && (
                <>
                  <Link to="/hospital/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Dashboard</Link>
                  <Link to="/hospital/create-request" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-red-600">+ Create Blood Request</Link>
                  <Link to="/hospital/requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Manage Requests</Link>
                  <Link to="/hospital/donations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Donations</Link>
                </>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Overview</Link>
                  <Link to="/admin/verifications" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Verifications</Link>
                  <Link to="/admin/donors" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Donors</Link>
                  <Link to="/admin/hospitals" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Hospitals</Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
