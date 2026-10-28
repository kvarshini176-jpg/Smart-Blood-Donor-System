import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ShieldCheck,
  Users,
  Building2,
  Activity,
  Heart,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500 mt-3">Aggregating system telemetry...</p>
      </div>
    );
  }

  // Blood group distribution chart data
  const bgCounts = stats?.bloodGroupDistribution || {};
  const bgLabels = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const bgData = bgLabels.map(bg => bgCounts[bg] || 0);

  const doughnutData = {
    labels: bgLabels,
    datasets: [
      {
        data: bgData,
        backgroundColor: [
          '#ef4444', '#f87171', '#3b82f6', '#60a5fa',
          '#a855f7', '#c084fc', '#10b981', '#34d399'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-red-600" />
            System Administration & Health Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">Platform analytics, hospital accreditation, and audit logs</p>
        </div>

        {stats?.pendingHospitals > 0 && (
          <Link
            to="/admin/verifications"
            className="px-4 py-2 rounded-2xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 animate-bounce self-start"
          >
            <AlertTriangle className="w-4 h-4" />
            {stats.pendingHospitals} Pending Hospital Verification(s)
          </Link>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Donors</span>
            <Users className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalDonors}</div>
          <span className="text-[10px] text-slate-500">Registered voluntary donors</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hospitals</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalHospitals}</div>
          <span className="text-[10px] text-amber-600 font-semibold">{stats?.pendingHospitals} pending verification</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Requests</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalRequests}</div>
          <span className="text-[10px] text-slate-500">{stats?.activeRequests} currently active</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Donations</span>
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{stats?.totalDonations}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">~{stats?.totalDonations * 3} lives impacted</span>
        </div>
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Donor Blood Distribution Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Donor Blood Group Distribution</h3>
            <span className="text-xs text-slate-400">Total: {stats?.totalDonors}</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
              }}
            />
          </div>
        </div>

        {/* Right Col: Recent System Audit Trail */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Live System Audit Trail
            </h3>
            <span className="text-xs text-slate-400">Latest actions</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
            {stats?.recentActivity?.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No recent logs recorded.</p>
            ) : (
              stats?.recentActivity?.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-slate-500">
                      Entity: {log.entityType} #{log.entityId.slice(0, 8)}... {log.details ? `• ${log.details}` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Navigation to Management Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/verifications"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-sm space-y-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Hospital Verifications</h4>
          <p className="text-xs text-slate-500">Accredit new medical centers and blood banks</p>
        </Link>

        <Link
          to="/admin/donors"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-sm space-y-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
            <Users className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Manage Donors</h4>
          <p className="text-xs text-slate-500">View registered donors and manage account statuses</p>
        </Link>

        <Link
          to="/admin/hospitals"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-sm space-y-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
            <Building2 className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Manage Hospitals</h4>
          <p className="text-xs text-slate-500">View hospital directory and modify credentials</p>
        </Link>
      </div>

    </div>
  );
};
