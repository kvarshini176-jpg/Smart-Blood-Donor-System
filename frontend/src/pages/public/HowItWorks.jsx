import React from 'react';
import { UserCheck, Building, Search, Bell, Heart, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
      
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
          Step-by-Step Workflow
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">How the Platform Connects Donors & Hospitals</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          An automated, transparent, and synchronized workflow that saves critical minutes during emergencies.
        </p>
      </div>

      {/* For Donors Workflow */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">For Blood Donors</h2>
            <p className="text-xs text-slate-500">How you can make a lifesaving impact in 4 steps</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center">1</div>
            <h3 className="font-bold text-slate-800 text-sm">Register & Set Blood Type</h3>
            <p className="text-xs text-slate-600">Provide your verified blood group, location, and availability status.</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center">2</div>
            <h3 className="font-bold text-slate-800 text-sm">Receive Compatible Alerts</h3>
            <p className="text-xs text-slate-600">Get notified when a nearby hospital publishes a request that matches your blood type.</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center">3</div>
            <h3 className="font-bold text-slate-800 text-sm">Express Interest</h3>
            <p className="text-xs text-slate-600">Click "Interested in Donating". The hospital reviews your profile and coordinates appointment timing.</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center">4</div>
            <h3 className="font-bold text-slate-800 text-sm">Donate & Track Impact</h3>
            <p className="text-xs text-slate-600">Complete donation at the facility. Your profile reflects the lives saved and updates your next eligibility date.</p>
          </div>
        </div>
      </div>

      {/* For Hospitals Workflow */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">For Hospitals & Healthcare Facilities</h2>
            <p className="text-xs text-slate-500">Rapid donor mobilization and end-to-end transfusion management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">1</div>
            <h3 className="font-bold text-slate-800 text-sm">Admin Verification</h3>
            <p className="text-xs text-slate-600">Register facility credentials. Administrators verify legitimate healthcare registration.</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</div>
            <h3 className="font-bold text-slate-800 text-sm">Post Blood Request</h3>
            <p className="text-xs text-slate-600">Specify required blood group, units, required date, and urgency level (Critical, High, Normal).</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">3</div>
            <h3 className="font-bold text-slate-800 text-sm">ML Prioritized Donors</h3>
            <p className="text-xs text-slate-600">The system ranks compatible candidates using distance, recovery interval, and response metrics.</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">4</div>
            <h3 className="font-bold text-slate-800 text-sm">Accept & Confirm</h3>
            <p className="text-xs text-slate-600">Accept interested donors, schedule time, and mark donation completed to fulfill patient request.</p>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="p-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl text-white text-center space-y-4 shadow-xl shadow-red-500/20">
        <h3 className="text-2xl font-bold">Ready to be part of the network?</h3>
        <p className="text-sm text-red-100 max-w-xl mx-auto">
          Sign up today as a voluntary donor or register your hospital to streamline emergency blood mobilization.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/register-donor"
            className="px-6 py-2.5 rounded-xl font-bold bg-white text-red-600 hover:bg-red-50 transition"
          >
            Register as Donor
          </Link>
          <Link
            to="/register-hospital"
            className="px-6 py-2.5 rounded-xl font-bold bg-red-800/60 text-white hover:bg-red-800 transition"
          >
            Hospital Portal
          </Link>
        </div>
      </div>

    </div>
  );
};
