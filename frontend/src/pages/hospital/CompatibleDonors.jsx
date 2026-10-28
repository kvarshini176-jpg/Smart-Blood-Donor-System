import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, BloodGroupBadge } from '../../components/common/StatusBadge';
import {
  Sparkles,
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Users,
  Award
} from 'lucide-react';

export const CompatibleDonors = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hospitals/requests/${id}/compatible-donors`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve compatible donors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500 mt-3">Executing ML donor ranking and logistical prioritization...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-600 font-bold text-sm">{error || 'Request not found.'}</p>
        <Link to="/hospital/requests" className="text-xs text-blue-600 font-bold hover:underline">
          ← Back to Manage Requests
        </Link>
      </div>
    );
  }

  const { request, totalCompatibleDonors, donors } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link
        to="/hospital/requests"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Requests
      </Link>

      {/* Blood Request Summary Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black text-xl">
            🩸 {request.bloodGroup}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{request.patientNameOrId}</h1>
              <StatusBadge status={request.urgency} type="urgency" />
            </div>
            <p className="text-xs text-slate-500">
              Units Required: <strong>{request.unitsRequired}</strong> • Urgency Level: <strong>{request.urgency}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/hospital/requests/${id}/responses`}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            Review Interested Donors
          </Link>
        </div>
      </div>

      {/* ML System Explanation Banner */}
      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold block">Machine Learning Donor Prioritization Active</span>
          <p className="text-purple-800 leading-relaxed">
            Candidates have first passed strict red blood cell ABO/RhD compatibility screening. The ML Random Forest model has ranked them by evaluating geographical distance, days since last whole blood collection (56-day medical recovery window), availability, and historical reliability.
          </p>
        </div>
      </div>

      {/* Ranked Donors Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Prioritized Compatible Donors</h3>
            <span className="text-xs text-slate-400">{totalCompatibleDonors} eligible donors matched</span>
          </div>
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Award className="w-4 h-4 text-purple-600" />
            Sorted by ML Suitability Score
          </div>
        </div>

        {donors.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No compatible donors found in database for blood group {request.bloodGroup}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-6">Rank & Priority</th>
                  <th className="py-3 px-6">Donor Details</th>
                  <th className="py-3 px-6">Blood Type</th>
                  <th className="py-3 px-6">Distance</th>
                  <th className="py-3 px-6">ML Suitability Score</th>
                  <th className="py-3 px-6">Contributing Ranking Factors</th>
                  <th className="py-3 px-6">Response Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donors.map((d) => (
                  <tr key={d.donorId} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black">
                          #{d.rank}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.priorityTier === 'HIGH PRIORITY'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : d.priorityTier === 'MEDIUM PRIORITY'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {d.priorityTier}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>
                        <span>{d.fullName}</span>
                        <span className="text-[10px] text-slate-400 block font-normal flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {d.locality || d.approximateCity}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <BloodGroupBadge group={d.bloodGroup} size="sm" />
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {d.distanceKm} km
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{d.suitabilityScore}</span>
                          <span className="text-[10px] text-slate-400">/ 100</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              d.suitabilityScore >= 75 ? 'bg-red-600' : d.suitabilityScore >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${d.suitabilityScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 max-w-sm">
                      <div className="space-y-1">
                        {d.contributingFactors.map((f, i) => (
                          <span
                            key={i}
                            className="inline-block text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md mr-1 mb-1 font-medium"
                          >
                            • {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {d.hasExpressedInterest ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Interest: {d.responseStatus}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Not yet responded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
