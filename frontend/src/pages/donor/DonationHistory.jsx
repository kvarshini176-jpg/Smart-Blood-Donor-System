import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Heart, Award, Calendar, Building2, CheckCircle2 } from 'lucide-react';

export const DonationHistory = () => {
  const [history, setHistory] = useState({ donations: [], summary: { totalDonations: 0, totalUnits: 0, estimatedLivesSaved: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/donors/history');
        if (res.data.success) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error('Error fetching donation history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <Award className="w-7 h-7 text-red-600" />
          Donation History & Life Impact
        </h1>
        <p className="text-xs text-slate-500 mt-1">Official records of your verified blood donations</p>
      </div>

      {/* Lifesaving Impact Certificate Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-red-950 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">
              Verified Healthcare Donor Impact
            </span>
            <h2 className="text-2xl font-black">Estimated Lives Saved: {history.summary.estimatedLivesSaved}</h2>
          </div>
          <div className="p-3 bg-red-600/30 border border-red-500/40 rounded-2xl flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <div>
              <span className="text-xl font-black block">{history.summary.totalUnits} Units</span>
              <span className="text-[10px] text-red-200">Total Whole Blood Donated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Verified Donation Records</h3>
          <span className="text-xs text-slate-400">{history.donations.length} records</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : history.donations.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No completed donation records yet. When you complete a donation at an authorized hospital, it will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100">
                  <th className="py-3 px-6">Hospital Facility</th>
                  <th className="py-3 px-6">Patient Identifier</th>
                  <th className="py-3 px-6">Units</th>
                  <th className="py-3 px-6">Donation Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <div>
                          <span>{d.hospital.hospitalName}</span>
                          <span className="text-[10px] text-slate-400 block">{d.hospital.city}, {d.hospital.state}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {d.request?.patientNameOrId || 'Emergency Patient'}
                    </td>
                    <td className="py-4 px-6 font-bold text-red-600">
                      {d.unitsDonated} Unit
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(d.donationDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 italic max-w-xs truncate">
                      {d.remarks || 'Standard whole blood donation'}
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
