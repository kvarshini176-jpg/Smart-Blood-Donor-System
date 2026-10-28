import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CreateBloodRequest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientNameOrId: '',
    patientAge: 30,
    bloodGroup: 'A+',
    unitsRequired: 2,
    urgency: 'NORMAL',
    requiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencies = [
    { value: 'NORMAL', label: 'Normal (Scheduled Surgery / Maintenance)' },
    { value: 'HIGH', label: 'High (Immediate Need within 24-48h)' },
    { value: 'CRITICAL', label: 'Critical (Trauma / Emergency / Life-threatening)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/hospitals/requests', formData);
      if (res.data.success) {
        setSuccessData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create blood request.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Blood Request Created & Broadcasted!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {successData.matchedDonorsCount} compatible donor(s) were notified in your locality.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(`/hospital/requests/${successData.request.id}/compatible-donors`)}
            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25 transition"
          >
            View ML Prioritized Donors →
          </button>
          <button
            onClick={() => navigate('/hospital/dashboard')}
            className="px-6 py-3 rounded-2xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            Hospital Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      
      <Link
        to="/hospital/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-red-600" />
            Issue New Blood Request
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify patient blood specifications and urgency level to notify compatible donors
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Patient Identifier / Case ID *
              </label>
              <input
                type="text"
                required
                value={formData.patientNameOrId}
                onChange={(e) => setFormData({ ...formData, patientNameOrId: e.target.value })}
                placeholder="e.g. Ananya Sen (Case #CGH-9021)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Patient Age *
              </label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={formData.patientAge}
                onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Required Blood Group *
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-red-600 bg-red-50/40 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>🩸 {bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Number of Blood Units Required *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={formData.unitsRequired}
                onChange={(e) => setFormData({ ...formData, unitsRequired: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Urgency Level *
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {urgencies.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Required Deadline Date *
              </label>
              <input
                type="date"
                required
                value={formData.requiredDate}
                onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical / Logistical Notes (Optional)
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Patient scheduled for elective cardiac bypass surgery tomorrow morning."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/hospital/dashboard')}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Broadcasting...' : 'Publish Request & Notify Donors'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
