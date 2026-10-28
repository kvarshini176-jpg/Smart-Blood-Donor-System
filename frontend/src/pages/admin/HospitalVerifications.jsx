import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ShieldCheck, Building2, CheckCircle2, XCircle, Phone, Mail, MapPin } from 'lucide-react';

export const HospitalVerifications = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalTarget, setReviewModalTarget] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleUpdateStatus = async (status) => {
    if (!reviewModalTarget) return;
    try {
      setActionLoading(true);
      const res = await api.patch(`/admin/hospitals/${reviewModalTarget.id}/verification`, {
        status,
        reviewNotes: reviewNotes || `Admin reviewed and marked as ${status}`
      });
      if (res.data.success) {
        setReviewModalTarget(null);
        setReviewNotes('');
        fetchHospitals();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-amber-500" />
          Hospital Facility Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review healthcare registration credentials and grant request privileges</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Registered Healthcare Centers</h3>
          <span className="text-xs text-slate-400">{hospitals.length} facilities</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No registered hospitals found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-6">Hospital Name</th>
                  <th className="py-3.5 px-6">License / Reg Number</th>
                  <th className="py-3.5 px-6">Authorized Contact</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Verification Status</th>
                  <th className="py-3.5 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>
                        <span>{h.hospitalName}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{h.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-700">
                      {h.regNumber}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <div>
                        <span className="font-semibold block">{h.contactPerson}</span>
                        <span className="text-[10px] text-slate-400">{h.contactPhone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {h.locality}, {h.city}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={h.verificationStatus} />
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => { setReviewModalTarget(h); setReviewNotes(''); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                      >
                        Review Verification
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(reviewModalTarget)}
        onClose={() => setReviewModalTarget(null)}
        title="Hospital Accreditation Review"
      >
        {reviewModalTarget && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Hospital:</span>
                <span className="font-bold text-slate-900">{reviewModalTarget.hospitalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License Number:</span>
                <span className="font-mono font-bold text-slate-800">{reviewModalTarget.regNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact Officer:</span>
                <span className="font-semibold text-slate-800">{reviewModalTarget.contactPerson} ({reviewModalTarget.contactPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <StatusBadge status={reviewModalTarget.verificationStatus} />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Review Notes / Verification Remarks
              </label>
              <textarea
                rows="3"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. License verified against state medical registry. Approved for transfusion requests."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
              >
                Reject Facility
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('APPROVED')}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Approve & Verify Hospital'}
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
