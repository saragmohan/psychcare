import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type { User as UserType } from '../../types';
import { storage } from '../../services/storageService';

interface AppointmentsViewProps {
  currentUser: UserType;
  setActiveTab: (tab: string) => void;
  onSelectClient: (clientId: string) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  currentUser,
  setActiveTab,
  onSelectClient,
}) => {
  const appointments = storage.getAppointments(currentUser.id);
  const clients = storage.getClients(currentUser.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [duration, setDuration] = useState(50);
  const [type, setType] = useState<'In-Person' | 'Telehealth' | 'Initial Intake' | 'Emergency'>('In-Person');
  const [notes, setNotes] = useState('');

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) return;

    storage.addAppointment({
      clientId: client.id,
      clientName: client.fullName,
      psychologistId: currentUser.id,
      date,
      time,
      durationMinutes: Number(duration),
      type,
      status: 'scheduled',
      notes,
    });

    setShowAddModal(false);
    setNotes('');
    alert('Appointment scheduled successfully.');
  };

  const handleStatusChange = (
    id: string,
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ) => {
    storage.updateAppointmentStatus(id, status);
  };

  const handleDeleteAppointment = (appId: string, clientName: string, date: string, time: string) => {
    if (window.confirm(`Are you sure you want to delete the scheduled appointment with ${clientName} on ${date} at ${time}?`)) {
      storage.deleteAppointment(appId);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in pb-12">
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 shrink-0" /> Appointment Calendar & Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage clinical appointments, telehealth links, and session completions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book Session</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-semibold text-slate-400">
          <span>Scheduled Appointments ({appointments.length})</span>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No appointments booked yet. Click "Book Session" to schedule.
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="bg-slate-950/70 border border-slate-800 p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 bg-indigo-950 text-indigo-300 rounded-2xl border border-indigo-800/40 text-center font-bold text-xs shrink-0">
                    <div className="text-[10px] sm:text-xs">{app.date}</div>
                    <div className="text-sm sm:text-base text-white font-extrabold mt-0.5">{app.time}</div>
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                      <span className="truncate">{app.clientName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {app.type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span>Duration: {app.durationMinutes} mins</span>
                      {app.notes && <span className="truncate max-w-xs">• "{app.notes}"</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                  <select
                    value={app.status}
                    onChange={(e) =>
                      handleStatusChange(
                        app.id,
                        e.target.value as 'scheduled' | 'completed' | 'cancelled' | 'no-show'
                      )
                    }
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                      app.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : app.status === 'cancelled'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : 'bg-slate-900 text-indigo-300 border-slate-700'
                    }`}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No-Show</option>
                  </select>

                  <button
                    onClick={() => {
                      onSelectClient(app.clientId);
                      setActiveTab('notes');
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    SOAP Note
                  </button>

                  <button
                    onClick={() => handleDeleteAppointment(app.id, app.clientName, app.date, app.time)}
                    className="px-2.5 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white rounded-xl text-xs font-semibold border border-rose-800/80 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Delete appointment"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-white space-y-4 my-auto max-h-[90vh] overflow-y-auto cursor-default relative"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Book Therapy Session</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Patient *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none cursor-pointer"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Session Format</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none cursor-pointer"
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Telehealth">Telehealth</option>
                    <option value="Initial Intake">Initial Intake</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Session Agenda / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. CBT exposure review..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
