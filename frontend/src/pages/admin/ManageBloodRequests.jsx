import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatusBadge, BloodGroupBadge } from '../../components/common/StatusBadge';
import { Activity, Search } from 'lucide-react';

export const ManageBloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/requests');
        if (res.data.success) {
          setRequests(res.data.requests);
        }
      } catch (err) {
        console.error('Error fetching admin requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filtered = requests.filter(r =>
    r.patientNameOrId.toLowerCase().includes(search.toLowerCase()) ||
    r.bloodGroup.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-purple-600" />
            System-Wide Blood Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">Global audit of all hospital transfusion requirements</p>
        </div>

        <input
          type="text"
          placeholder="Filter by patient or blood group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No blood requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-6">Patient Identifier</th>
                  <th className="py-3.5 px-6">Blood Type</th>
                  <th className="py-3.5 px-6">Hospital Facility</th>
                  <th className="py-3.5 px-6">Urgency</th>
                  <th className="py-3.5 px-6">Fulfillment Ratio</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{req.patientNameOrId}</td>
                    <td className="py-4 px-6"><BloodGroupBadge group={req.bloodGroup} size="sm" /></td>
                    <td className="py-4 px-6 font-semibold text-slate-700">{req.hospital?.hospitalName || 'Facility'}</td>
                    <td className="py-4 px-6"><StatusBadge status={req.urgency} type="urgency" /></td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <span className="text-emerald-600">{req.unitsFulfilled}</span> / {req.unitsRequired} Units
                    </td>
                    <td className="py-4 px-6"><StatusBadge status={req.status} /></td>
                    <td className="py-4 px-6 text-slate-400">{new Date(req.createdAt).toLocaleString()}</td>
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
