import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Activity,
  Shield,
  Zap,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Building2
} from 'lucide-react';
import api from '../../services/api';
import { StatusBadge, BloodGroupBadge } from '../../components/common/StatusBadge';

export const Home = () => {
  const [stats, setStats] = useState({
    totalDonors: 124,
    totalHospitals: 18,
    totalRequests: 46,
    totalDonations: 82,
    livesSaved: 246
  });

  useEffect(() => {
    // Optionally fetch public health/stats if available
    api.get('/health').catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/60 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligent Blood Donor Network with Machine Learning
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Save Lives with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
                  Precision Blood Matching
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect directly with nearby verified hospitals needing blood. Our automated red blood cell compatibility engine and ML-assisted donor ranker ensure urgent blood reaches patients quickly.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/register-donor"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  Become a Blood Donor
                </Link>
                <Link
                  to="/register-hospital"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
                >
                  <Building2 className="w-5 h-5 text-red-600" />
                  Hospital Registration
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-slate-600 hover:text-red-600 transition text-center"
                >
                  Sign In →
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="font-extrabold text-xl text-slate-900">ABO & RhD</div>
                  <div className="text-xs text-slate-500">Exact Transfusion Rules</div>
                </div>
                <div>
                  <div className="font-extrabold text-xl text-slate-900">ML-Ranked</div>
                  <div className="text-xs text-slate-500">Proximity & Urgency Prioritization</div>
                </div>
                <div>
                  <div className="font-extrabold text-xl text-slate-900">100% Private</div>
                  <div className="text-xs text-slate-500">Consent-Gated Contact Details</div>
                </div>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Blood Request</span>
                  </div>
                  <StatusBadge status="CRITICAL" type="urgency" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">City General Hospital</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> Metro City (3.2 km away)
                      </p>
                    </div>
                    <BloodGroupBadge group="A+" size="lg" />
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Patient Identifier:</span>
                      <span className="font-semibold text-slate-800">Case #CGH-9021 (Age 29)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Required Units:</span>
                      <span className="font-semibold text-slate-800">2 Units (0 Fulfilled)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ML Match Score:</span>
                      <span className="font-bold text-emerald-600">92.4 / 100 (HIGH PRIORITY)</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-800 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>Compatible with donor blood groups: <strong>O-, O+, A-, A+</strong></span>
                  </div>
                </div>

                <Link
                  to="/register-donor"
                  className="w-full block py-3 text-center text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-md shadow-red-500/20"
                >
                  Register to Respond to Matches
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900">How the Intelligent Platform Works</h2>
          <p className="text-sm text-slate-600">
            A modernized, clinical-standard system connecting the voluntary donation ecosystem with certified hospital blood banks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Verified Healthcare Facilities</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Only verified hospitals with legitimate registration licenses can issue blood requests, preventing fraudulent campaigns.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Machine Learning Ranking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trained Scikit-Learn models estimate candidate suitability by analyzing proximity, recovery days, engagement reliability, and urgency.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Real-time Lifecycle Sync</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donors express interest with one click, appointments are coordinated securely, and completed donations update patient fulfillment instantaneously.
            </p>
          </div>

        </div>
      </section>

      {/* ABO Blood Compatibility Reference Table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Red Blood Cell Compatibility Matrix</h3>
              <p className="text-xs text-slate-500 mt-1">Official transfusion standards embedded into the matching engine</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 self-start">
              ABO & RhD Compatible
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-3 px-4">Recipient Blood Group</th>
                  <th className="py-3 px-4">Compatible Donors (Red Cells)</th>
                  <th className="py-3 px-4">Compatibility Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">O-</td>
                  <td className="py-2.5 px-4"><span className="font-semibold text-red-700">O- only</span></td>
                  <td className="py-2.5 px-4 text-slate-500">Universal Donor Type (Requires O- only)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">O+</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">O-, O+</td>
                  <td className="py-2.5 px-4 text-slate-500">Compatible with all O donors</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">A-</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">O-, A-</td>
                  <td className="py-2.5 px-4 text-slate-500">Requires Rh-negative blood</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">A+</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">O-, O+, A-, A+</td>
                  <td className="py-2.5 px-4 text-slate-500">Accepts O & A variants</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">B-</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">O-, B-</td>
                  <td className="py-2.5 px-4 text-slate-500">Requires Rh-negative blood</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">B+</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">O-, O+, B-, B+</td>
                  <td className="py-2.5 px-4 text-slate-500">Accepts O & B variants</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">AB-</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">O-, A-, B-, AB-</td>
                  <td className="py-2.5 px-4 text-slate-500">Accepts all Rh-negative types</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">AB+</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-700">All 8 Blood Groups (Universal Recipient)</td>
                  <td className="py-2.5 px-4 text-slate-500">Universal Recipient for red blood cells</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
};
