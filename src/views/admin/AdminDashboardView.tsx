import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Crown,
  Clock,
  FileText,
  Database,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  UserX,
  Trash2,
  Sparkles,
  Activity,
  Calendar,
  X,
} from 'lucide-react';
import type { User } from '../../types';
import { storage } from '../../services/storageService';

interface AdminDashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  setActiveTab,
}) => {
  const [, setRefreshKey] = useState(0);
  const forceRefresh = () => setRefreshKey((prev) => prev + 1);

  const users = storage.getUsers();
  const practitioners = users.filter((u) => u.role !== 'admin');
  const premiumUsers = practitioners.filter((u) => u.plan === 'premium');
  const trialUsers = practitioners.filter((u) => u.plan === 'trial');
  const freeUsers = practitioners.filter((u) => u.plan === 'free');
  const bannedUsers = practitioners.filter((u) => u.status === 'banned');
  const activeUsers = practitioners.filter((u) => u.status === 'active');

  const allClients = storage.getClients();
  const allNotes = storage.getAllSessionNotes();
  const allAssessments = storage.getAllAssessments();
  const allAppointments = storage.getAppointments();
  const auditLogs = storage.getAuditLogs();

  const adminClients = storage.getClients('usr_admin');
  const adminNotes = allNotes.filter((n) => n.psychologistId === 'usr_admin');
  const adminAssessments = allAssessments.filter((a) => a.psychologistId === 'usr_admin');
  const adminAppointments = storage.getAppointments('usr_admin');
  const pendingInvoices = storage.getPendingInvoices();

  // Financial Metrics Estimate
  const estimatedMRR = premiumUsers.length * 2499;

  const handleApprovePayment = (invoiceId: string) => {
    storage.adminApprovePayment(invoiceId);
    forceRefresh();
  };

  const handleRejectPayment = (invoiceId: string) => {
    const reason = window.prompt(
      'Enter reason for payment rejection (optional):',
      'Payment credit not confirmed in bank records'
    );
    if (reason !== null) {
      storage.adminRejectPayment(invoiceId, reason);
      forceRefresh();
    }
  };

  const handleGrantPremium = (userId: string) => {
    storage.adminGrantPremium(userId, 365);
    forceRefresh();
  };

  const handleExtendTrial = (userId: string) => {
    storage.adminExtendTrial(userId, 3);
    forceRefresh();
  };

  const handleBanUser = (userId: string) => {
    if (window.confirm('Are you sure you want to suspend this practitioner account?')) {
      storage.adminBanUser(userId);
      forceRefresh();
    }
  };

  const handleUnbanUser = (userId: string) => {
    storage.adminUnbanUser(userId);
    forceRefresh();
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete practitioner "${userName}"?\n\nThis will remove their account and all associated patient records.`
      )
    ) {
      storage.adminDeleteUser(userId);
      forceRefresh();
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'DELETE_USER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Trash2 className="w-3 h-3 text-rose-400" /> DELETED
          </span>
        );
      case 'BAN_USER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
            <UserX className="w-3 h-3 text-red-400" /> BANNED
          </span>
        );
      case 'UNBAN_USER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="w-3 h-3 text-emerald-400" /> UNBANNED
          </span>
        );
      case 'GRANT_PREMIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Crown className="w-3 h-3 text-amber-400" /> PRO GRANTED
          </span>
        );
      case 'EXTEND_TRIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Clock className="w-3 h-3 text-indigo-400" /> +3 DAYS
          </span>
        );
      case 'PAYMENT_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" /> UPI SUBMITTED
          </span>
        );
      case 'PAYMENT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PRO APPROVED
          </span>
        );
      case 'PAYMENT_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <X className="w-3 h-3 text-rose-400" /> PAYMENT REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Super Admin Control Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0" /> Executive Operations Center
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Super Admin Platform Operations & Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live system telemetries, practitioner licensing, data governance, and HIPAA audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('admin_users')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {/* Reviewer & Admin Clinical Testing Suite */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-teal-950/30 border border-indigo-500/30 p-4 sm:p-5 rounded-3xl shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Clinical Tools & Features Testing Suite</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Directly test patient records, SOAP notes, evaluations, and PDF reports
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setActiveTab('clients')}
            className="p-3 bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition flex flex-col items-start gap-1.5 cursor-pointer text-left group"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                Patients & Intake
              </div>
              <div className="text-[10px] text-slate-400">
                {adminClients.length} test records
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className="p-3 bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition flex flex-col items-start gap-1.5 cursor-pointer text-left group"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                SOAP Notes & Voice
              </div>
              <div className="text-[10px] text-slate-400">
                {adminNotes.length} test notes & PDF
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('assessments')}
            className="p-3 bg-slate-950/80 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/50 rounded-2xl transition flex flex-col items-start gap-1.5 cursor-pointer text-left group"
          >
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-105 transition">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                PHQ-9 & GAD-7 Tests
              </div>
              <div className="text-[10px] text-slate-400">
                {adminAssessments.length} test evaluations
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className="p-3 bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition flex flex-col items-start gap-1.5 cursor-pointer text-left group"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                Clinical Calendar
              </div>
              <div className="text-[10px] text-slate-400">
                {adminAppointments.length} test appointments
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* High-Level KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Practitioners */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Practitioners</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{practitioners.length}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 font-medium">
            <span className="text-emerald-400 font-semibold">{activeUsers.length} Active</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{bannedUsers.length} Suspended</span>
          </div>
        </div>

        {/* Premium Pro MRR */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Premium Tier</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{premiumUsers.length} Pro</div>
          <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>~₹{estimatedMRR.toLocaleString('en-IN')} / mo Subscription Volume</span>
          </div>
        </div>

        {/* 3-Day Trials */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Trials</span>
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{trialUsers.length} In-Trial</div>
          <div className="text-[11px] text-slate-400 font-medium">
            <span>{freeUsers.length} Free Tier Accounts</span>
          </div>
        </div>

        {/* Hosted Clinical Records */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Clinical Records</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {allClients.length + allNotes.length + allAssessments.length}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
            <span>{allClients.length} Patients</span>
            <span>•</span>
            <span>{allNotes.length} SOAP</span>
            <span>•</span>
            <span>{allAssessments.length} Tests</span>
          </div>
        </div>
      </div>

      {/* Pending UPI Payment Verifications Card */}
      {pendingInvoices.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/30 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Pending UPI Payment Verifications</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 animate-pulse">
                  {pendingInvoices.length} ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Practitioners have transferred funds and submitted their 12-digit UTR numbers. Check your bank/UPI statement to confirm the credit, then manually activate their subscription.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">PRACTITIONER</th>
                  <th className="py-2.5 px-3">PLAN & FEE</th>
                  <th className="py-2.5 px-3">12-DIGIT UPI UTR</th>
                  <th className="py-2.5 px-3">SUBMITTED AT</th>
                  <th className="py-2.5 px-3 text-right">MANUAL ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-950/60 transition">
                    <td className="py-3 px-3 font-medium text-white">
                      <div className="font-bold">{inv.userName}</div>
                      <div className="text-[11px] text-slate-400">{inv.userEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-indigo-300">{inv.planName}</div>
                      <div className="text-xs font-black text-white">₹{inv.amount.toLocaleString('en-IN')} INR</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 font-mono font-bold text-amber-300">
                        <span>{inv.paymentMethod.utrNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(inv.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprovePayment(inv.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Grant Access</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectPayment(inv.id)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Administrative Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Practitioner Roster & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> Practitioner Directory Snapshot
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recent practitioner accounts with instant license modification controls.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('admin_users')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                Full User Manager <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {practitioners.slice(0, 5).map((user: User) => (
                <div
                  key={user.id}
                  className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {user.clinicName || 'Private Practice'} • {user.licenseNumber || 'PSY-PENDING'}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    {user.plan === 'premium' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ⭐ PRO
                      </span>
                    ) : user.plan === 'trial' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        ⏱️ TRIAL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        FREE
                      </span>
                    )}

                    {user.status === 'banned' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                        BANNED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    )}

                    {/* Quick Overrides */}
                    {user.plan !== 'premium' ? (
                      <button
                        onClick={() => handleGrantPremium(user.id)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg cursor-pointer transition shadow-sm"
                      >
                        Grant Pro
                      </button>
                    ) : (
                      <button
                        onClick={() => handleExtendTrial(user.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-[10px] rounded-lg border border-slate-700 cursor-pointer transition"
                      >
                        +3d Trial
                      </button>
                    )}

                    {user.status === 'banned' ? (
                      <button
                        onClick={() => handleUnbanUser(user.id)}
                        className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[10px] font-semibold rounded-lg border border-emerald-800 cursor-pointer transition inline-flex items-center justify-center"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBanUser(user.id)}
                        className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 text-[10px] font-semibold rounded-lg border border-red-800 cursor-pointer transition inline-flex items-center justify-center"
                      >
                        Ban
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="px-2.5 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-[10px] font-semibold rounded-lg border border-rose-800/80 cursor-pointer transition inline-flex items-center justify-center gap-1"
                      title="Permanently Delete Practitioner Account"
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Breakdown Progress & Database Integrity */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" /> Platform Tier Distribution
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Premium Pro Subscribers ({premiumUsers.length})</span>
                  <span>{Math.round((premiumUsers.length / (practitioners.length || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-2.5 rounded-full"
                    style={{ width: `${Math.round((premiumUsers.length / (practitioners.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>3-Day Trialing Accounts ({trialUsers.length})</span>
                  <span>{Math.round((trialUsers.length / (practitioners.length || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2.5 rounded-full"
                    style={{ width: `${Math.round((trialUsers.length / (practitioners.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Free / Basic Tier ({freeUsers.length})</span>
                  <span>{Math.round((freeUsers.length / (practitioners.length || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-slate-700 h-2.5 rounded-full"
                    style={{ width: `${Math.round((freeUsers.length / (practitioners.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Security Audit Feed & Cloud Status */}
        <div className="space-y-6">
          {/* Security & Audit Events Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" /> Security Audit Feed
              </h3>
              <button
                onClick={() => setActiveTab('admin_logs')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                All Logs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No admin actions recorded yet.</div>
              ) : (
                auditLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {getActionBadge(log.action)}
                        <span className="font-bold text-white text-[11px] truncate">{log.targetUserName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {log.details}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Storage & Health */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" /> System Storage & Health
            </h3>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Storage Engine:</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Local Secure Store
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Database Records:</span>
                <span className="text-white font-bold">
                  {users.length + allClients.length + allNotes.length + allAssessments.length + allAppointments.length} objects
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Audit Events Logged:</span>
                <span className="text-amber-300 font-bold">{auditLogs.length} events</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
