import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, BloodGroupBadge } from '../../components/common/StatusBadge';
import { Activity, PlusCircle, Sparkles, Users, Ban, CheckCircle2 } from 'lucide-react';

export const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hospitals/requests');
      if (res.data.success) {
        setRequests(res.data.requests);
        setFiltered(res.data.requests);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFiltered(requests);
    } else {
      setFiltered(requests.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, requests]);

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this blood request?')) return;
    try {
      const res = await api.patch(`/hospitals/requests/${id}/cancel`);
      if (res.data.success) {
        fetchRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-red-600" />
            Manage Blood Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review, monitor, and coordinate blood requirements</p>
        </div>

        <Link
          to="/hospital/create-request"
          className="px-5 py-2.5 rounded-2xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition flex items-center gap-2 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Request
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {['ALL', 'OPEN', 'RESPONSES_RECEIVED', 'IN_PROGRESS', 'FULFILLED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2 rounded-xl transition ${
              statusFilter === st ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No blood requests found under status "{statusFilter}".
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-6">Patient Identifier</th>
                  <th className="py-3.5 px-6">Blood Group</th>
                  <th className="py-3.5 px-6">Urgency</th>
                  <th className="py-3.5 px-6">Units Fulfilled</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>
                        <span>{req.patientNameOrId}</span>
                        <span className="text-[10px] text-slate-400 block">Age {req.patientAge} • Needed {new Date(req.requiredDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-red-600">
                      <BloodGroupBadge group={req.bloodGroup} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={req.urgency} type="urgency" />
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <span className="text-emerald-600 font-black">{req.unitsFulfilled}</span> / {req.unitsRequired} Units
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/hospital/requests/${req.id}/compatible-donors`}
                          className="px-2.5 py-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold flex items-center gap-1 transition"
                          title="ML Donor Match"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> ML Matches
                        </Link>

                        <Link
                          to={`/hospital/requests/${req.id}/responses`}
                          className="px-2.5 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold flex items-center gap-1 transition"
                          title="Review Responses"
                        >
                          <Users className="w-3.5 h-3.5" /> Responses ({req.totalResponses || 0})
                        </Link>

                        {!['FULFILLED', 'CANCELLED'].includes(req.status) && (
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Cancel Request"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
