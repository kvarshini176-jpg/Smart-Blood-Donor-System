import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Heart, Building2, CheckCircle2 } from 'lucide-react';
import { BloodGroupBadge } from '../../components/common/StatusBadge';

export const DonationTracking = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hospitals/donations');
        if (res.data.success) {
          setDonations(res.data.donations);
        }
      } catch (err) {
        console.error('Error fetching hospital donations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-7 h-7 text-red-600 fill-red-600" />
          Hospital Donation Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1">Official collection log of confirmed donor blood transfusions</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Completed Blood Collections</h3>
          <span className="text-xs text-slate-400">{donations.length} total collections</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No completed donations recorded yet. When you complete collections from scheduled donors, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-6">Donor Name</th>
                  <th className="py-3.5 px-6">Blood Type</th>
                  <th className="py-3.5 px-6">Patient Case</th>
                  <th className="py-3.5 px-6">Units Collected</th>
                  <th className="py-3.5 px-6">Collection Timestamp</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Clinical Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>
                        <span>{d.donor.fullName}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{d.donor.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <BloodGroupBadge group={d.donor.bloodGroup} size="sm" />
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {d.request?.patientNameOrId || 'Patient Request'}
                    </td>
                    <td className="py-4 px-6 font-bold text-red-600">
                      {d.unitsDonated} Unit(s)
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(d.donationDate).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 italic max-w-xs truncate">
                      {d.remarks || 'Standard verified collection'}
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
