import React, { useState } from 'react';
import {
  FileText,
  Download,
  Smile,
  Search,
  Lock,
  Calendar,
  ShieldCheck,
  UserCheck,
  Trash2,
  Tag,
} from 'lucide-react';
import type { User as UserType, SessionNote } from '../../types';
import { storage } from '../../services/storageService';
import { DSM5_DATABASE } from '../../services/dsmData';
import { generateSessionNotePdf } from '../../services/pdfService';

interface NotesViewProps {
  currentUser: UserType;
  selectedClientId?: string;
  onOpenPaywall: () => void;
  setActiveTab?: (tab: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  currentUser,
  selectedClientId,
  onOpenPaywall,
  setActiveTab,
}) => {
  const clients = storage.getClients(currentUser.id);
  const [activeClientId, setActiveClientId] = useState<string>(() => {
    const initialClient = clients.find((c) => c.id === selectedClientId);
    return initialClient ? initialClient.id : clients[0]?.id || '';
  });

  React.useEffect(() => {
    const currentClients = storage.getClients(currentUser.id);
    const validClient = currentClients.find((c) => c.id === selectedClientId);
    setActiveClientId(validClient ? validClient.id : currentClients[0]?.id || '');
  }, [currentUser.id, selectedClientId]);

  const selectedClient = clients.find((c) => c.id === activeClientId);
  const clientNotes = activeClientId ? storage.getNotesForClient(activeClientId, currentUser.id) : [];

  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [moodRating, setMoodRating] = useState<number>(6);
  const [selectedDsmCodes, setSelectedDsmCodes] = useState<string[]>([
    'F41.1 Generalized Anxiety Disorder',
  ]);
  const [dsmSearch, setDsmSearch] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!activeClientId) {
      setClientError('Mandatory: Please select a patient to record this SOAP note.');
      return;
    }

    if (!subjective.trim() && !objective.trim() && !assessment.trim() && !plan.trim()) {
      alert('Please fill out at least one SOAP section (Subjective, Objective, Assessment, or Plan) before saving.');
      return;
    }

    storage.addSessionNote({
      clientId: activeClientId,
      psychologistId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      sessionNumber: (clientNotes.length || 0) + 1,
      soap: {
        subjective,
        objective,
        assessment,
        plan,
      },
      dsm5Codes: selectedDsmCodes,
      moodRating,
      isPrivate: false,
    });

    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    alert('Session SOAP Note saved securely.');
  };

  const handleExportPdf = (note: SessionNote) => {
    if (!storage.canAccessPremiumFeature(currentUser)) {
      onOpenPaywall();
      return;
    }
    if (selectedClient) {
      generateSessionNotePdf(selectedClient, note, currentUser);
    }
  };

  const filteredDsm = DSM5_DATABASE.filter(
    (d) =>
      d.name.toLowerCase().includes(dsmSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(dsmSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header with Mandatory Patient Selector */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 shrink-0" /> Clinical SOAP Note Editor
          </h1>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1 sm:line-clamp-none">
            Structured clinical progress notes with DSM-5 diagnostic tags & PDF exports.
          </p>
        </div>

        {/* Mandatory Patient Select Dropdown */}
        <div className="flex flex-col gap-1 w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-indigo-500/50 w-full sm:max-w-xs">
            <UserCheck className="w-4 h-4 text-indigo-400 shrink-0 ml-1" />
            <span className="text-xs font-bold text-slate-200 shrink-0">Patient <span className="text-rose-400">*</span>:</span>
            <select
              required
              value={activeClientId}
              onChange={(e) => {
                setActiveClientId(e.target.value);
                setClientError(null);
              }}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none w-full truncate pr-2 cursor-pointer"
            >
              {clients.length === 0 ? (
                <option value="" className="bg-slate-900 text-rose-400">-- No Patients Available --</option>
              ) : (
                clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.fullName} ({c.primaryDiagnosis.split('(')[0].trim()})
                  </option>
                ))
              )}
            </select>
          </div>
          {clientError && (
            <span className="text-[11px] font-semibold text-rose-400 px-1">{clientError}</span>
          )}
        </div>
      </div>

      {/* No Patients Available Banner */}
      {clients.length === 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-200 text-xs">
          <span>⚠️ You currently have 0 patients registered. A patient is required before creating a SOAP note.</span>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('clients')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shrink-0 transition cursor-pointer"
            >
              + Register Patient First
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOAP Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
          <form onSubmit={handleSaveNote} className="space-y-5">
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-300">Mood:</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodRating}
                  onChange={(e) => setMoodRating(Number(e.target.value))}
                  className="w-28 sm:w-24 accent-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-indigo-400 w-6 text-right">{moodRating}/10</span>
              </div>
            </div>

            {/* S: Subjective */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider">
                S - Subjective (Client's Reported Symptoms & Mood)
              </label>
              <textarea
                rows={3}
                placeholder="Client reports feeling anxious before meetings, difficulty sleeping..."
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* O: Objective */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider">
                O - Objective (Practitioner Observations & Affect)
              </label>
              <textarea
                rows={2}
                placeholder="Client appeared attentive, eye contact steady, mild psychomotor agitation..."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* A: Assessment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                A - Assessment (Clinical Impression & DSM Progress)
              </label>
              <textarea
                rows={2}
                placeholder="GAD symptoms progressing with CBT exposure exercises..."
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* P: Plan */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">
                P - Plan (Treatment Strategy, Homework & Next Session)
              </label>
              <textarea
                rows={2}
                placeholder="Continue weekly CBT. Homework: Box breathing twice daily..."
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* DSM-5 / ICD-11 Diagnostic Tags */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> DSM-5 / ICD-11 Diagnostic Tags
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedDsmCodes.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-xl text-[11px] font-medium"
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedDsmCodes(selectedDsmCodes.filter((c) => c !== code))
                      }
                      className="text-indigo-400 hover:text-white ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search DSM-5 code library (e.g. F41.1 Anxiety)..."
                  value={dsmSearch}
                  onChange={(e) => setDsmSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              {dsmSearch && (
                <div className="max-h-36 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-1 space-y-1">
                  {filteredDsm.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        const tag = `${item.code} ${item.name}`;
                        if (!selectedDsmCodes.includes(tag)) {
                          setSelectedDsmCodes([...selectedDsmCodes, tag]);
                        }
                        setDsmSearch('');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors flex justify-between gap-2 cursor-pointer"
                    >
                      <span className="truncate"><strong>{item.code}</strong> - {item.name}</span>
                      <span className="text-[10px] text-indigo-400 shrink-0">{item.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Save Encrypted SOAP Note
              </button>
            </div>
          </form>
        </div>

        {/* Historical SOAP Notes Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" /> Historical SOAP Notes
            </h3>
            <span className="text-xs text-slate-400">{clientNotes.length} Saved</span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {clientNotes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No past notes for this patient. Complete the form to record session #1.
              </div>
            ) : (
              clientNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">
                        Session #{note.sessionNumber} ({note.date})
                      </div>
                      <div className="text-[10px] text-indigo-400">Mood: {note.moodRating}/10</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleExportPdf(note)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> PDF
                        {!storage.canAccessPremiumFeature(currentUser) && (
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete SOAP Note for Session #${note.sessionNumber}?`)) {
                            storage.deleteSessionNote(note.id);
                          }
                        }}
                        title="Delete SOAP Note"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="font-bold text-indigo-300">S: </span>
                      <span className="text-slate-300">{note.soap.subjective}</span>
                    </div>
                    <div>
                      <span className="font-bold text-teal-300">O: </span>
                      <span className="text-slate-300">{note.soap.objective}</span>
                    </div>
                    <div>
                      <span className="font-bold text-amber-300">A: </span>
                      <span className="text-slate-300">{note.soap.assessment}</span>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-300">P: </span>
                      <span className="text-slate-300">{note.soap.plan}</span>
                    </div>
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
