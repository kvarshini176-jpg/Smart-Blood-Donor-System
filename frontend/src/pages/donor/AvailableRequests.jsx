import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatusBadge, BloodGroupBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Sparkles, MapPin, Clock, Heart, CheckCircle2, Filter } from 'lucide-react';

export const AvailableRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  // Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [interestNotes, setInterestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donors/matching-requests');
      if (res.data.success) {
        setRequests(res.data.requests);
        setFilteredRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Error fetching matching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (urgencyFilter === 'ALL') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.urgency === urgencyFilter));
    }
  }, [urgencyFilter, requests]);

  const handleExpressInterest = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmitting(true);
    setFeedback('');

    try {
      const res = await api.post(`/donors/responses/${selectedRequest.id}/interest`, {
        notes: interestNotes
      });
      if (res.data.success) {
        setFeedback('Your interest was sent successfully! The hospital has received your offer.');
        setTimeout(() => {
          setSelectedRequest(null);
          setInterestNotes('');
          setFeedback('');
          fetchRequests();
        }, 1500);
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to submit interest.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-red-600" />
            Compatible Blood Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Actively matching hospital needs within transit distance
          </p>
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          {['ALL', 'CRITICAL', 'HIGH', 'NORMAL'].map((u) => (
            <button
              key={u}
              onClick={() => setUrgencyFilter(u)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                urgencyFilter === u ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500 mt-3">Searching compatible hospital requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Matching Requests In This Filter</h3>
          <p className="text-xs text-slate-400">All local requirements have currently been addressed or fulfilled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <StatusBadge status={req.urgency} type="urgency" />
                  <BloodGroupBadge group={req.bloodGroup} size="sm" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{req.hospital.hospitalName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {req.hospital.locality}, {req.hospital.city} ({req.distanceKm} km away)
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient Identifier:</span>
                    <span className="font-bold text-slate-800">{req.patientNameOrId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Required Units:</span>
                    <span className="font-bold text-slate-800">{req.unitsRequired} Unit(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deadline:</span>
                    <span className="font-semibold text-slate-700">{new Date(req.requiredDate).toLocaleDateString()}</span>
                  </div>
                  {req.notes && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/50">
                      "{req.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                {req.hasResponded ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Response Submitted: {req.userResponseStatus}
                  </div>
                ) : (
                  <button
                    onClick={() => { setSelectedRequest(req); setFeedback(''); }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition flex items-center justify-center gap-1.5"
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

      {/* Interest Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title="Confirm Interest in Donating"
      >
        {selectedRequest && (
          <form onSubmit={handleExpressInterest} className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Facility:</span>
                <span className="font-bold text-slate-800">{selectedRequest.hospital.hospitalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Required:</span>
                <span className="font-bold text-red-600">🩸 {selectedRequest.bloodGroup} ({selectedRequest.unitsRequired} units)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Urgency:</span>
                <StatusBadge status={selectedRequest.urgency} type="urgency" />
              </div>
            </div>

            {feedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold">
                {feedback}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Optional Message / Availability Window
              </label>
              <textarea
                rows="3"
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                placeholder="e.g. Can donate tomorrow at 10 AM. Traveling by personal car."
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
                {submitting ? 'Submitting...' : 'Send Interest to Hospital'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
