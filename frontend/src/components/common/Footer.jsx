import React from 'react';
import { HeartHandshake, ShieldCheck, PhoneCall, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Healthcare Clinical Disclaimer Banner */}
        <div className="mb-10 p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Clinical Transfusion Disclaimer:</strong> Matching algorithms and Machine Learning priority ratings provided on this platform serve solely as preliminary screening and logistical prioritization. All blood donations require mandatory clinical eligibility evaluation, screening, and serological crossmatching by licensed healthcare practitioners before transfusion.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span>Smart Blood <span className="text-red-500">Donor</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bridging the gap between voluntary blood donors and hospitals in critical need through intelligent compatibility algorithms.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 tracking-wider uppercase text-[11px]">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-red-400 transition">About System</Link></li>
              <li><Link to="/how-it-works" className="hover:text-red-400 transition">How It Works</Link></li>
              <li><Link to="/register-donor" className="hover:text-red-400 transition">Become a Donor</Link></li>
              <li><Link to="/register-hospital" className="hover:text-red-400 transition">Hospital Onboarding</Link></li>
            </ul>
          </div>

          {/* Compatibility Standards */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 tracking-wider uppercase text-[11px]">Transfusion Standards</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict red blood cell antigen compatibility screening based on standard ABO and RhD antigen-antibody systems.
            </p>
            <div className="mt-2 text-xs text-red-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Healthcare Facilities
            </div>
          </div>

          {/* Emergency Helpline */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 tracking-wider uppercase text-[11px]">Emergency Support</h4>
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
                <PhoneCall className="w-4 h-4" />
                24/7 Helpline: 1800-BLOOD-HELP
              </div>
              <p className="text-[11px] text-slate-400">
                For immediate life-threatening emergency inquiries, contact nearest local trauma emergency services.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Smart Blood Donor System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400 transition">Privacy & Ethics</Link>
            <Link to="/about" className="hover:text-slate-400 transition">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-400 transition">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
