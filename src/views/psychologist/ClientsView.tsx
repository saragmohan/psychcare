import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  FileText,
  Activity,
  X,
  Calendar,
  HeartHandshake,
  Trash2,
} from 'lucide-react';
import type { User, RiskLevel } from '../../types';
import { storage } from '../../services/storageService';

interface ClientsViewProps {
  currentUser: User;
  onOpenPaywall: () => void;
  selectedClientId?: string;
  onSelectClient: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  currentUser,
  onOpenPaywall,
  selectedClientId,
  onSelectClient,
  setActiveTab,
}) => {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyName] = useState('Primary Contact');
  const [emergencyPhone] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('Generalized Anxiety Disorder (F41.1)');
  const [notesSummary, setNotesSummary] = useState('');

  const clients = storage.getClients(currentUser.id);
  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.primaryDiagnosis.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'all' || c.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const check = storage.canAddClient(currentUser);
    if (!check.allowed) {
      alert(check.reason);
      onOpenPaywall();
      return;
    }

    const newClient = storage.addClient({
      psychologistId: currentUser.id,
      fullName,
      age: Number(age),
      gender,
      phone,
      email,
      emergencyContact: {
        name: emergencyName || 'Not specified',
        relationship: 'Primary Contact',
        phone: emergencyPhone || phone,
      },
      riskLevel,
      primaryDiagnosis,
      notesSummary,
      status: 'active',
    });

    onSelectClient(newClient.id);
    setShowAddModal(false);
    setFullName('');
    setPhone('');
    setEmail('');
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    const confirmMsg = `Are you sure you want to delete patient "${clientName}"?\n\nThis will permanently remove their profile, clinical case history, SOAP notes, appointments, and assessment records. This action cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      const success = storage.deleteClient(clientId);
      if (success) {
        const remainingClients = storage.getClients(currentUser.id);
        if (remainingClients.length > 0) {
          onSelectClient(remainingClients[0].id);
        } else {
          onSelectClient('');
        }
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 shrink-0" /> Patient Directory & Records
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Total active client profiles: <strong className="text-white">{clients.length}</strong>
          </p>
        </div>

        <button
          onClick={() => {
            const check = storage.canAddClient(currentUser);
            if (!check.allowed) {
              onOpenPaywall();
            } else {
              setShowAddModal(true);
            }
          }}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Patient Intake</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search patient name, diagnosis, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none w-full"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="severe">Severe Risk</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Client List & Client Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Client List Cards */}
        <div className="space-y-3">
          {filteredClients.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-slate-500 text-xs">
              No matching patient records found.
            </div>
          ) : (
            filteredClients.map((client) => {
              const isSelected = activeClient?.id === client.id;
              return (
                <div
                  key={client.id}
                  onClick={() => onSelectClient(client.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-white truncate pr-2">{client.fullName}</div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          client.riskLevel === 'high' || client.riskLevel === 'severe'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : client.riskLevel === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {client.riskLevel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id, client.fullName);
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
                        title="Delete patient record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {client.primaryDiagnosis}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 border-t border-slate-800/80 pt-2">
                    <span>{client.age} yrs • {client.gender}</span>
                    <span>{client.totalSessions} Sessions</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Client Overview */}
        {activeClient ? (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-white">{activeClient.fullName}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                      activeClient.riskLevel === 'high' || activeClient.riskLevel === 'severe'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : activeClient.riskLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    Risk: {activeClient.riskLevel}
                  </span>
                </div>
                <div className="text-xs text-indigo-400 mt-1 font-medium">
                  {activeClient.primaryDiagnosis}
                </div>
              </div>

              {/* Action buttons stacked on mobile */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <button
                  onClick={() => {
                    onSelectClient(activeClient.id);
                    setActiveTab('notes');
                  }}
                  className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" /> SOAP Note
                </button>
                <button
                  onClick={() => {
                    onSelectClient(activeClient.id);
                    setActiveTab('assessments');
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-400" /> PHQ-9 Test
                </button>
                <button
                  onClick={() => handleDeleteClient(activeClient.id, activeClient.fullName)}
                  className="col-span-2 sm:col-span-1 px-3 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white text-xs font-semibold border border-rose-800/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/30"
                  title="Delete patient and clinical records"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Delete Patient
                </button>
              </div>
            </div>

            {/* Demographics Card Stacked on Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> Phone: <span className="text-white font-medium truncate">{activeClient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> Email: <span className="text-white font-medium truncate">{activeClient.email}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Emergency:
                  <span className="text-white font-medium truncate">{activeClient.emergencyContact.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Sessions:
                  <span className="text-white font-bold">{activeClient.totalSessions} Sessions</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Clinical Presentation & Case History
              </div>
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {activeClient.notesSummary || 'No case history notes recorded.'}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-12 shadow-xl flex flex-col items-center justify-center text-center space-y-3">
            <Users className="w-12 h-12 text-slate-700" />
            <h3 className="text-base font-semibold text-slate-300">No Patient Record Selected</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Select a patient from the directory on the left or register a new patient intake.
            </p>
          </div>
        )}
      </div>

      {/* New Patient Intake Modal - Mobile Bounded & Scrollable */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto cursor-default my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400 shrink-0" /> New Patient Intake Registration
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-3 sm:space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Taylor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Stack on small mobile, 2 cols on tablet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Risk Level</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="severe">Severe Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Diagnosis</label>
                  <input
                    type="text"
                    value={primaryDiagnosis}
                    onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Clinical History</label>
                <textarea
                  rows={3}
                  placeholder="Chief complaint and observations..."
                  value={notesSummary}
                  onChange={(e) => setNotesSummary(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
