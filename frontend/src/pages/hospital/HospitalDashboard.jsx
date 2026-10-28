import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, BloodGroupBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  PlusCircle,
  Activity,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Heart
} from 'lucide-react';

export const HospitalDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profRes, reqRes] = await Promise.all([
          api.get('/hospitals/profile'),
          api.get('/hospitals/requests')
        ]);
        if (profRes.data.success) setProfile(profRes.data.profile);
        if (reqRes.data.success) setRequests(reqRes.data.requests);
      } catch (err) {
        console.error('Error fetching hospital dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500 mt-3">Loading hospital control center...</p>
      </div>
    );
  }

  const activeRequests = requests.filter(r => ['OPEN', 'RESPONSES_RECEIVED', 'IN_PROGRESS'].includes(r.status));
  const fulfilledRequests = requests.filter(r => r.status === 'FULFILLED');
  const isApproved = profile?.verificationStatus === 'APPROVED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Verification Warning if Pending */}
      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong>Facility Status: PENDING VERIFICATION.</strong> An administrator is reviewing your healthcare credentials (License #{profile?.regNumber}). You can draft requests and view the system, but broadcast notifications are throttled until verified.
          </div>
        </div>
      )}

      {/* Hospital Facility Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{profile?.hospitalName}</h1>
                <StatusBadge status={profile?.verificationStatus} />
              </div>
              <p className="text-xs text-slate-500">
                License #{profile?.regNumber} • {profile?.contactPerson} ({profile?.contactPhone})
              </p>
            </div>
          </div>

          <Link
            to="/hospital/create-request"
            className="px-5 py-3 rounded-2xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 transition flex items-center gap-2 self-start md:self-center"
          >
            <PlusCircle className="w-4 h-4" />
            Create Blood Request
          </Link>

        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Active Blood Requests
            </span>
            <div className="text-2xl font-black text-blue-950 mt-0.5">
              {activeRequests.length}
            </div>
            <span className="text-[10px] text-slate-500">Currently awaiting donors</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Requests Created
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {requests.length}
            </div>
            <span className="text-[10px] text-slate-500">All historical postings</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Fulfilled Requests
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {fulfilledRequests.length}
            </div>
            <span className="text-[10px] text-slate-500">100% units collected</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Completed Donations
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {profile?.totalCompletedDonations || 0}
            </div>
            <span className="text-[10px] text-slate-500">Verified clinical collections</span>
          </div>
        </div>
      </div>

      {/* Active Requests with Quick Match Link */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              Active Blood Requests ({activeRequests.length})
            </h2>
            <p className="text-xs text-slate-500">Track incoming donor responses and ML compatible matches</p>
          </div>
          <Link
            to="/hospital/requests"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No active blood requests at this moment. Click "Create Blood Request" above to broadcast an urgent patient requirement.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <StatusBadge status={req.urgency} type="urgency" />
                    <BloodGroupBadge group={req.bloodGroup} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{req.patientNameOrId}</h3>
                    <p className="text-xs text-slate-500">
                      Age: {req.patientAge} • Needed: {new Date(req.requiredDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block">Units Required:</span>
                      <span className="font-bold text-slate-800">{req.unitsRequired}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Fulfilled:</span>
                      <span className="font-bold text-emerald-600">{req.unitsFulfilled}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Donor Responses:</span>
                      <span className="font-bold text-purple-700">{req.totalResponses || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                  <Link
                    to={`/hospital/requests/${req.id}/compatible-donors`}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    ML Match Donors
                  </Link>

                  <Link
                    to={`/hospital/requests/${req.id}/responses`}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Review Responses ({req.totalResponses || 0})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
