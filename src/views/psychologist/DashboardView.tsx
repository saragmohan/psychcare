import React from 'react';
import {
  Users,
  Calendar,
  Plus,
  Clock,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  Activity,
  Sparkles,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import type { User } from '../../types';
import { storage } from '../../services/storageService';

interface DashboardViewProps {
  currentUser: User;
  setActiveTab: (tab: string) => void;
  onOpenPaywall: () => void;
  onSelectClient: (clientId: string) => void;
  theme?: 'dark' | 'light';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  setActiveTab,
  onOpenPaywall,
  onSelectClient,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const clients = storage.getClients(currentUser.id);
  const appointments = storage.getAppointments(currentUser.id);
  const trialInfo = storage.getTrialTimeRemaining(currentUser);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const highRiskClients = clients.filter((c) => c.riskLevel === 'high' || c.riskLevel === 'severe');

  const handleDeleteAppointment = (appId: string, clientName: string, time: string) => {
    if (window.confirm(`Are you sure you want to delete today's appointment with ${clientName} at ${time}?`)) {
      storage.deleteAppointment(appId);
    }
  };

  // Dynamic Theme Styling Helper
  const cardBg = isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white shadow-xl';
  const cardSubBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800';
  const textMuted = isLight ? 'text-slate-600' : 'text-slate-400';
  const borderDivider = isLight ? 'border-slate-200' : 'border-slate-800';

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Welcome Banner */}
      <div className={`p-4 sm:p-6 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
        isLight
          ? 'bg-gradient-to-r from-teal-50 via-indigo-50 to-white border-teal-200 text-slate-900'
          : 'bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border-indigo-800/40 text-white'
      }`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 ${
              isLight ? 'text-teal-700' : 'text-indigo-300'
            }`}>
              <span>{currentUser.clinicName || 'Clinical OS'}</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">License Active</span>
            </div>
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Good day, {currentUser.name} 👋
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-xl ${textMuted}`}>
              You have <strong className={isLight ? 'text-indigo-700 font-bold' : 'text-white'}>{todayAppointments.length} sessions</strong> scheduled for today. All clinical data is securely encrypted.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('notes')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New SOAP Note</span>
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Run PHQ-9 / GAD-7</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trial Banner */}
      {currentUser.plan === 'trial' && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs ${
          isLight
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${isLight ? 'bg-amber-200' : 'bg-amber-500/20'}`}>
              <Clock className={`w-5 h-5 animate-pulse ${isLight ? 'text-amber-800' : 'text-amber-400'}`} />
            </div>
            <div>
              <div className={`font-bold text-sm ${isLight ? 'text-amber-950' : 'text-amber-100'}`}>3-Day All-Access Trial Active</div>
              <div className={textMuted}>
                You have <strong>{trialInfo.formatted}</strong> remaining before free tier locks apply.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenPaywall}
            className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade to Unlimited Premium
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Active Patients</div>
            <div className={`text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{clients.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3" /> 100% HIPAA compliant
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Today's Sessions</div>
            <div className={`text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{todayAppointments.length}</div>
            <div className={`text-[11px] font-medium flex items-center gap-1 mt-1 ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
              Next at {todayAppointments[0]?.time || 'Completed'}
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${isLight ? 'bg-teal-50 text-teal-600' : 'bg-teal-500/10 text-teal-400'}`}>
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>High Risk Flags</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{highRiskClients.length}</div>
            <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> Priority review
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/10 text-amber-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Average PHQ-9 Delta</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">-3.4 pts</div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3" /> Positive improvement
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Agenda & Patient Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 border rounded-3xl p-6 space-y-4 ${cardBg}`}>
          <div className={`flex items-center justify-between border-b pb-4 ${borderDivider}`}>
            <div className="flex items-center gap-2 font-bold text-base">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Today's Appointment Agenda ({todayStr})</span>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Full Calendar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className={`text-center py-8 text-xs ${textMuted}`}>
              No sessions scheduled for today. Use the calendar tab to schedule new appointments.
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((app) => (
                <div
                  key={app.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${cardSubBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-2 font-extrabold text-sm rounded-xl border text-center shrink-0 ${
                      isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                    }`}>
                      {app.time}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{app.clientName}</div>
                      <div className={`text-xs ${textMuted}`}>
                        {app.type} • {app.durationMinutes} mins
                      </div>
                      {app.notes && (
                        <div className={`text-[11px] mt-1 line-clamp-1 italic ${textMuted}`}>
                          "{app.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        onSelectClient(app.clientId);
                        setActiveTab('notes');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm"
                    >
                      Note
                    </button>
                    <button
                      onClick={() => {
                        onSelectClient(app.clientId);
                        setActiveTab('assessments');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 text-teal-600" /> Test
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(app.id, app.clientName, app.time)}
                      className={`p-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isLight
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border-rose-800/80'
                      }`}
                      title="Delete appointment"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`border rounded-3xl p-6 space-y-4 ${cardBg}`}>
          <div className={`flex items-center justify-between border-b pb-4 ${borderDivider}`}>
            <div className="font-bold text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Priority Patient Records</span>
            </div>
          </div>

          <div className="space-y-3">
            {clients.length === 0 ? (
              <div className={`text-center py-8 text-xs ${textMuted}`}>
                No patient records found. Click "Patient Directory" to register a new intake.
              </div>
            ) : (
              clients.map((client) => (
              <div
                key={client.id}
                onClick={() => {
                  onSelectClient(client.id);
                  setActiveTab('clients');
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isLight ? 'bg-slate-50 hover:bg-indigo-50/50 border-slate-200' : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800'
                }`}
              >
                <div>
                  <div className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{client.fullName}</div>
                  <div className={`text-[11px] mt-0.5 line-clamp-1 ${textMuted}`}>
                    {client.primaryDiagnosis}
                  </div>
                  <div className={`text-[10px] mt-1 ${textMuted}`}>
                    {client.totalSessions} sessions completed
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      client.riskLevel === 'high' || client.riskLevel === 'severe'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : client.riskLevel === 'medium'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {client.riskLevel}
                  </span>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
