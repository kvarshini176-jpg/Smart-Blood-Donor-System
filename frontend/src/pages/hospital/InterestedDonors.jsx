import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, BloodGroupBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Heart,
  AlertCircle
} from 'lucide-react';

export const InterestedDonors = () => {
  const { id } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scheduling Modal
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(
    new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Complete Donation Modal
  const [completeTarget, setCompleteTarget] = useState(null);
  const [unitsDonated, setUnitsDonated] = useState(1);
  const [completeRemarks, setCompleteRemarks] = useState('');

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hospitals/requests/${id}/responses`);
      if (res.data.success) {
        setResponses(res.data.responses);
      }
    } catch (err) {
      console.error('Error fetching interested donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [id]);

  // Action: Accept Donor
  const handleAcceptDonor = async (responseId) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/hospitals/responses/${responseId}/status`, {
        status: 'ACCEPTED'
      });
      if (res.data.success) {
        fetchResponses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept donor.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Decline Donor
  const handleDeclineDonor = async (responseId) => {
    if (!window.confirm('Are you sure you want to decline this donor response?')) return;
    try {
      const res = await api.patch(`/hospitals/responses/${responseId}/status`, {
        status: 'DECLINED'
      });
      if (res.data.success) {
        fetchResponses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline response.');
    }
  };

  // Action: Schedule Appointment
  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!selectedResponse) return;
    try {
      setActionLoading(true);
      const res = await api.patch(`/hospitals/responses/${selectedResponse.id}/status`, {
        status: 'SCHEDULED',
        scheduledAt: scheduleDate,
        notes: scheduleNotes
      });
      if (res.data.success) {
        setSelectedResponse(null);
        fetchResponses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Complete Donation
  const handleConfirmComplete = async (e) => {
    e.preventDefault();
    if (!completeTarget) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/hospitals/requests/${id}/complete-donation`, {
        donorResponseId: completeTarget.id,
        unitsDonated: parseInt(unitsDonated, 10),
        remarks: completeRemarks
      });
      if (res.data.success) {
        alert('Donation completed successfully! Donor history and request fulfillment updated.');
        setCompleteTarget(null);
        fetchResponses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete donation.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link
        to="/hospital/requests"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Requests
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Review Interested Donors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept donors, schedule collection appointments, and record completed blood units
          </p>
        </div>

        <Link
          to={`/hospital/requests/${id}/compatible-donors`}
          className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition self-start"
        >
          View All Compatible Donors (ML) →
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No donors have expressed interest in this blood request yet. Compatible donors have been notified.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {responses.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <StatusBadge status={r.status} />
                  <BloodGroupBadge group={r.donor.bloodGroup} size="sm" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{r.donor.fullName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {r.donor.locality}, {r.donor.city} ({r.distanceKm} km away)
                  </p>
                </div>

                {/* Contact Phone (Unmasked once Accepted/Scheduled) */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Contact: {r.donor.phone}</span>
                  </div>
                  {r.notes && (
                    <p className="text-slate-600 italic pt-1">Donor note: "{r.notes}"</p>
                  )}
                  {r.scheduledAt && (
                    <div className="pt-1 text-teal-800 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      Scheduled for: {new Date(r.scheduledAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons based on lifecycle status */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                {r.status === 'INTERESTED' && (
                  <>
                    <button
                      onClick={() => handleAcceptDonor(r.id)}
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                    >
                      Accept Donor
                    </button>
                    <button
                      onClick={() => handleDeclineDonor(r.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Decline
                    </button>
                  </>
                )}

                {r.status === 'ACCEPTED' && (
                  <button
                    onClick={() => setSelectedResponse(r)}
                    className="w-full py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Collection Appointment
                  </button>
                )}

                {r.status === 'SCHEDULED' && (
                  <button
                    onClick={() => setCompleteTarget(r)}
                    className="w-full py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition flex items-center justify-center gap-1.5"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    Confirm Blood Collection & Complete Donation
                  </button>
                )}

                {r.status === 'COMPLETED' && (
                  <div className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Donation Completed & Recorded
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Appointment Modal */}
      <Modal
        isOpen={Boolean(selectedResponse)}
        onClose={() => setSelectedResponse(null)}
        title="Schedule Donation Appointment"
      >
        {selectedResponse && (
          <form onSubmit={handleConfirmSchedule} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Coordinate an appointment with <strong>{selectedResponse.donor.fullName}</strong> ({selectedResponse.donor.bloodGroup}).
            </p>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date & Time of Appointment *
              </label>
              <input
                type="datetime-local"
                required
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Instructions for Donor
              </label>
              <textarea
                rows="3"
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                placeholder="e.g. Please report to Room 204, 2nd Floor Blood Bank. Ask for Dr. Thorne."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-50"
              >
                {actionLoading ? 'Confirming...' : 'Confirm Schedule & Notify Donor'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm & Complete Donation Modal */}
      <Modal
        isOpen={Boolean(completeTarget)}
        onClose={() => setCompleteTarget(null)}
        title="Confirm & Record Completed Donation"
      >
        {completeTarget && (
          <form onSubmit={handleConfirmComplete} className="space-y-4 text-xs">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-900 space-y-1">
              <span className="font-bold block">Verified Whole Blood Collection</span>
              <p>
                Confirm that blood was clinically collected, crossmatched, and accepted from{' '}
                <strong>{completeTarget.donor.fullName}</strong>.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Units Collected
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={unitsDonated}
                onChange={(e) => setUnitsDonated(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Remarks / Lot Identifier
              </label>
              <textarea
                rows="2"
                value={completeRemarks}
                onChange={(e) => setCompleteRemarks(e.target.value)}
                placeholder="e.g. Bag #BB-9021-A verified. Serology negative. Safe for transfusion."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompleteTarget(null)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition disabled:opacity-50"
              >
                {actionLoading ? 'Recording...' : 'Confirm & Complete Donation'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
