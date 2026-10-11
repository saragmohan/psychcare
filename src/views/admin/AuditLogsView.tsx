import React from 'react';
import { ShieldCheck, History, Trash2, UserX, UserCheck, Crown, Clock } from 'lucide-react';
import { storage } from '../../services/storageService';

export const AuditLogsView: React.FC = () => {
  const logs = storage.getAuditLogs();

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'DELETE_USER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-[10px]">
            <Trash2 className="w-3 h-3 text-rose-400" /> DELETED
          </span>
        );
      case 'BAN_USER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-red-500/20 text-red-300 font-bold border border-red-500/30 text-[10px]">
            <UserX className="w-3 h-3 text-red-400" /> BANNED
          </span>
        );
      case 'UNBAN_USER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
            <UserCheck className="w-3 h-3 text-emerald-400" /> UNBANNED
          </span>
        );
      case 'GRANT_PREMIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px]">
            <Crown className="w-3 h-3 text-amber-400" /> PRO GRANTED
          </span>
        );
      case 'EXTEND_TRIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 text-[10px]">
            <Clock className="w-3 h-3 text-indigo-400" /> TRIAL EXTENDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700 text-[10px]">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400 shrink-0" /> Admin Audit Logs & Security History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system logs recording administrative interventions, license changes, and account removals.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-300 shrink-0 self-start sm:self-auto">
          {logs.length} Total System Events
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">No admin actions recorded yet.</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getActionBadge(log.action)}
                    <span className="font-bold text-white truncate">{log.targetUserName}</span>
                  </div>
                  <div className="text-slate-300 text-xs leading-relaxed">{log.details}</div>
                </div>
              </div>

              <div className="sm:text-right text-[11px] text-slate-500 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end w-full sm:w-auto">
                <div className="font-semibold text-slate-400">By Admin: {log.adminName}</div>
                <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
