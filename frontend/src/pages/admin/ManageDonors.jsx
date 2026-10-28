import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BloodGroupBadge } from '../../components/common/StatusBadge';
import { Users, Search, MapPin, Power, CheckCircle2, XCircle } from 'lucide-react';

export const ManageDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/donors');
      if (res.data.success) {
        setDonors(res.data.donors);
      }
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleToggleUserStatus = async (donor) => {
    const currentStatus = donor.user.isActive;
    const confirmMsg = currentStatus
      ? `Are you sure you want to deactivate ${donor.fullName}'s account?`
      : `Activate ${donor.fullName}'s account?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.patch(`/admin/users/${donor.userId}/status`, {
        isActive: !currentStatus
      });
      if (res.data.success) {
        fetchDonors();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update account status.');
    }
  };

  const filtered = donors.filter((d) => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase());
    const matchesBlood = bloodFilter === 'ALL' || d.bloodGroup === bloodFilter;
    return matchesSearch && matchesBlood;
  });

  const bloodGroups = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-red-600" />
            Manage Registered Donors
          </h1>
          <p className="text-xs text-slate-500 mt-1">Directory of voluntary donors with account moderation controls</p>
        </div>

        {/* Search & Blood Group Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search donor or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg === 'ALL' ? 'All Blood Types' : bg}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Donors List</h3>
          <span className="text-xs text-slate-400">{filtered.length} shown</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No donors match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-6">Donor Full Name</th>
                  <th className="py-3.5 px-6">Blood Type</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Contact Phone</th>
                  <th className="py-3.5 px-6">Availability</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6">Moderate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>
                        <span>{d.fullName}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{d.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <BloodGroupBadge group={d.bloodGroup} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {d.locality}, {d.city}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-700">
                      {d.phone}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        d.isAvailable ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        {d.isAvailable ? '● Available' : '○ Resting'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        d.user?.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {d.user?.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleUserStatus(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          d.user?.isActive !== false
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {d.user?.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
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
