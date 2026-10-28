import React from 'react';
import { ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
          Mission & Architecture
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">About Smart Blood Donor System</h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          An advanced healthcare platform connecting voluntary donors with certified hospitals in need of lifesaving transfusions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Our Core Principles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" /> 100% Voluntary Donation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We uphold the World Health Organization guidelines promoting regular, voluntary, non-remunerated blood donation to safeguard supply integrity.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Privacy & Consent Protection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donor contact numbers and exact street addresses are strictly hidden from public and hospital view until the donor expresses interest and the hospital accepts them.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" /> Machine Learning Assistance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our Random Forest prioritization model estimates logistical suitability based on recovery intervals, distance, and historical reliability, ensuring critical requests find donors fast.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" /> Clinical Safety Screening
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Preliminary digital compatibility checks are not a replacement for clinical testing. Hospitals perform complete serological screening before collection.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-slate-300 rounded-2xl p-8 space-y-4">
        <h3 className="text-xl font-bold text-white">System Technical Stack</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Smart Blood Donor System is designed with enterprise-grade reliability:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <li>• <strong>Frontend:</strong> React, Vite, Tailwind CSS, React Router v6, Chart.js</li>
          <li>• <strong>Backend:</strong> Node.js, Express.js REST API with JWT Authentication</li>
          <li>• <strong>Database:</strong> Relational SQLite with strict foreign keys & transactions</li>
          <li>• <strong>ML Engine:</strong> Python FastAPI, Scikit-Learn Random Forest Pipeline</li>
          <li>• <strong>Compatibility:</strong> Strict 8-group ABO & RhD antigen compatibility service</li>
        </ul>
      </div>
    </div>
  );
};
