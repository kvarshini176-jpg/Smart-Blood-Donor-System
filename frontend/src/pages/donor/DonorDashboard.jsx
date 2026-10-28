import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, BloodGroupBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Heart,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Bell
} from 'lucide-react';

export const DonorDashboard = () => {
  const { user, refreshMe } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [matchingRequests, setMatchingRequests] = useState([]);
  const [myResponses, setMyResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interest Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [interestNotes, setInterestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profRes, reqRes, respRes] = await Promise.all([
        api.get('/donors/profile'),
        api.get('/donors/matching-requests'),
        api.get('/donors/responses'),
      ]);

      if (profRes.data.success) setProfileData(profRes.data.profile);
      if (reqRes.data.success) setMatchingRequests(reqRes.data.requests);
      if (respRes.data.success) setMyResponses(respRes.data.responses);
    } catch (err) {
      console.error('Error fetching donor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Toggle availability
  const toggleAvailability = async () => {
    if (!profileData) return;
    try {
      const updatedStatus = !profileData.isAvailable;
      const res = await api.put('/donors/profile', { isAvailable: updatedStatus });
      if (res.data.success) {
        setProfileData((prev) => ({ ...prev, isAvailable: updatedStatus }));
      }
    } catch (err) {
      alert('Failed to update availability status.');
    }
  };

  // Submit Interest in Donating
  const handleExpressInterest = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmitting(true);
    setFeedbackMsg('');

    try {
      const res = await api.post(`/donors/responses/${selectedRequest.id}/interest`, {
        notes: interestNotes
      });
      if (res.data.success) {
        setFeedbackMsg('Your interest was sent successfully! The hospital has been notified.');
        setTimeout(() => {
          setSelectedRequest(null);
          setInterestNotes('');
          setFeedbackMsg('');
          fetchDashboardData();
        }, 1500);
      }
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Failed to submit interest.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500 mt-3">Loading donor portal...</p>
      </div>
    );
  }

  const profile = profileData || user?.donorProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Donor Profile Header & Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-red-500/25">
              {profile?.bloodGroup || '🩸'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{profile?.fullName}</h1>
                <BloodGroupBadge group={profile?.bloodGroup} size="sm" />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {profile?.locality}, {profile?.city}, {profile?.state}
              </p>
            </div>
          </div>

          {/* Availability Toggle & Recovery Indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Availability Status
              </span>
              <span className={`text-xs font-bold ${profile?.isAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
                {profile?.isAvailable ? '● Active & Ready to Donate' : '○ Resting / Unavailable'}
              </span>
            </div>

            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                profile?.isAvailable
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {profile?.isAvailable ? 'Pause Availability' : 'Mark Available'}
            </button>
          </div>

        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
              Lives Saved
            </span>
            <div className="text-2xl font-black text-red-950 mt-0.5">
              {(profile?.totalCompletedDonations || 0) * 3}
            </div>
            <span className="text-[10px] text-slate-500">Based on whole blood units</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Completed Donations
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {profile?.totalCompletedDonations || 0}
            </div>
            <span className="text-[10px] text-slate-500">Official hospital collections</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Days Since Last Donation
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {profile?.daysSinceLastDonation !== null ? `${profile?.daysSinceLastDonation} d` : 'First Time'}
            </div>
            <span className={`text-[10px] font-semibold ${profile?.isEligibleByDate ? 'text-emerald-600' : 'text-amber-600'}`}>
              {profile?.isEligibleByDate ? '✓ Medically eligible (56+ days)' : 'Rest period active'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Responses
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {myResponses.filter(r => !['COMPLETED', 'DECLINED', 'WITHDRAWN'].includes(r.status)).length}
            </div>
            <span className="text-[10px] text-slate-500">In coordination with hospitals</span>
          </div>
        </div>
      </div>

      {/* Grid: Compatible Blood Requests & My Active Responses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Matching Hospital Blood Requests */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                Matching Blood Requests ({matchingRequests.length})
              </h2>
              <p className="text-xs text-slate-500">
                Hospital requests compatible with your {profile?.bloodGroup} blood
              </p>
            </div>
            <Link
              to="/donor/requests"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {matchingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No Urgent Blood Requests Currently Match</p>
              <p className="text-slate-400 mt-1">You will receive an automatic alert when a nearby hospital posts an emergency request.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matchingRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-red-50 text-red-600 font-extrabold text-lg flex items-center justify-center">
                        🩸 {req.bloodGroup}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{req.hospital.hospitalName}</h3>
                          <StatusBadge status={req.urgency} type="urgency" />
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {req.hospital.locality}, {req.hospital.city} ({req.distanceKm} km away)
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="text-xs font-bold text-slate-900 block">
                        {req.unitsRequired} Unit(s) Needed
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {req.unitsFulfilled} already fulfilled
                      </span>
                    </div>
                  </div>

                  {/* Patient & Urgency Notes */}
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Patient Identifier:</span>
                      <span className="font-semibold text-slate-800">{req.patientNameOrId} (Age {req.patientAge})</span>
                    </div>
                    {req.notes && (
                      <div className="text-slate-500 italic pt-0.5">"{req.notes}"</div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Needed by: {new Date(req.requiredDate).toLocaleDateString()}
                    </span>

                    {req.hasResponded ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Status: {req.userResponseStatus}
                      </span>
                    ) : (
                      <button
                        onClick={() => { setSelectedRequest(req); setFeedbackMsg(''); }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20 transition flex items-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        Interested in Donating
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Active Responses & Scheduled Appointments */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
              <span>My Donation Responses</span>
              <Link to="/donor/history" className="text-xs text-red-600 font-semibold hover:underline">
                History →
              </Link>
            </h3>

            {myResponses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                You haven't responded to any blood requests yet.
              </p>
            ) : (
              <div className="space-y-3">
                {myResponses.slice(0, 5).map((resp) => (
                  <div key={resp.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{resp.request.hospital.hospitalName}</h4>
                        <span className="text-[11px] text-slate-500">Patient: {resp.request.patientNameOrId}</span>
                      </div>
                      <StatusBadge status={resp.status} />
                    </div>

                    {resp.scheduledAt && (
                      <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg text-[11px] text-teal-800 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        Appointment: {new Date(resp.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    )}

                    {resp.status === 'ACCEPTED' && (
                      <p className="text-[10px] text-emerald-700 font-medium">
                        ✓ Hospital accepted your offer. They will call you to schedule.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical Readiness Checklist */}
          <div className="p-6 rounded-3xl bg-slate-900 text-slate-300 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Pre-Donation Checklist
            </h4>
            <ul className="text-xs space-y-2 text-slate-300">
              <li>• Rested at least 6-8 hours before donation</li>
              <li>• Hydrated well with water/electrolytes</li>
              <li>• Avoided fatty foods 3 hours before donation</li>
              <li>• Weight at least 50 kg (110 lbs)</li>
              <li>• Valid photo ID for hospital registry</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Express Interest Modal */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title="Express Interest in Donating"
      >
        {selectedRequest && (
          <form onSubmit={handleExpressInterest} className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Hospital:</span>
                <span className="font-bold text-slate-800">{selectedRequest.hospital.hospitalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-semibold text-slate-800">{selectedRequest.patientNameOrId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Required Blood:</span>
                <span className="font-bold text-red-600">🩸 {selectedRequest.bloodGroup} ({selectedRequest.unitsRequired} units)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Urgency:</span>
                <StatusBadge status={selectedRequest.urgency} type="urgency" />
              </div>
            </div>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {feedbackMsg}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Optional Message or Arrival Time
              </label>
              <textarea
                rows="3"
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                placeholder="e.g. I work 10 minutes away and can be there within 30 minutes."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm & Notify Hospital'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
