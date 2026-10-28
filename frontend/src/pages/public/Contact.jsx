import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
          24/7 Support & Hospital Inquiries
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Contact Emergency Helpdesk</h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Need assistance with verification, emergency hospital blood matching, or donor accounts? Reach our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="p-6 bg-red-600 text-white rounded-2xl space-y-3 shadow-lg shadow-red-500/20">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <PhoneCall className="w-5 h-5" /> 24/7 Emergency Blood Helpline
            </h3>
            <p className="text-xs text-red-100">
              For emergency trauma blood stock requests or high-urgency coordination:
            </p>
            <div className="text-2xl font-black tracking-wide">
              1800-BLOOD-HELP
            </div>
            <div className="text-xs text-red-200">
              Toll-Free • Available 24 Hours • Medical Dispatch
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <span className="font-bold text-slate-800 block">General Support Email</span>
                support@smartblooddonor.org
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2Icon className="w-5 h-5 text-slate-400" />
              <div>
                <span className="font-bold text-slate-800 block">Hospital Onboarding Bureau</span>
                verification@smartblooddonor.org
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <div>
                <span className="font-bold text-slate-800 block">Central Coordination Hub</span>
                700 Healthcare Boulevard, Metro City
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-900 text-base">Message Transmitted</h4>
              <p className="text-xs text-slate-500">
                Our support team has logged your query. If urgent, our clinical dispatch will contact you within 15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Send Inquiry</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Message / Clinical Need</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

function Building2Icon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
  );
}
