import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Building2, Search, Power } from 'lucide-react';

export const ManageHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/hospitals');
      if (res.data.success) {
        setHospitals(res.data.hospitals);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleToggleStatus = async (h) => {
    const current = h.user?.isActive;
    const msg = current
      ? `Deactivate hospital ${h.hospitalName}?`
      : `Activate hospital ${h.hospitalName}?`;
    if (!window.confirm(msg)) return;

    try {
      const res = await api.patch(`/admin/users/${h.userId}/status`, {
        isActive: !current
      });
      if (res.data.success) {
        fetchHospitals();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle account status.');
    }
  };

  const filtered = hospitals.filter(h =>
    h.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Manage Registered Hospitals
          </h1>
          <p className="text-xs text-slate-500 mt-1">Accredited medical centers, licenses, and account operations</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search hospital or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Hospitals List</h3>
          <span className="text-xs text-slate-400">{filtered.length} total</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No hospitals found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-6">Hospital Facility</th>
                  <th className="py-3.5 px-6">License Number</th>
                  <th className="py-3.5 px-6">Contact Officer</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Accreditation</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6">Moderate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>
                        <span>{h.hospitalName}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{h.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-700">{h.regNumber}</td>
                    <td className="py-4 px-6 text-slate-700">
                      <div>
                        <span className="font-semibold block">{h.contactPerson}</span>
                        <span className="text-[10px] text-slate-400">{h.contactPhone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{h.locality}, {h.city}</td>
                    <td className="py-4 px-6"><StatusBadge status={h.verificationStatus} /></td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        h.user?.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {h.user?.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(h)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          h.user?.isActive !== false
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {h.user?.isActive !== false ? 'Deactivate' : 'Activate'}
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
