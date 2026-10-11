import React, { useState } from 'react';
import {
  Activity,
  Download,
  Play,
  FileText,
  Trash2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { User } from '../../types';
import { storage } from '../../services/storageService';
import {
  PHQ9_QUESTIONS,
  GAD7_QUESTIONS,
  evaluatePHQ9,
  evaluateGAD7,
} from '../../services/assessmentData';
import { generateAssessmentPdf } from '../../services/pdfService';

interface AssessmentsViewProps {
  currentUser: User;
  selectedClientId?: string;
  onOpenPaywall: () => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  currentUser,
  selectedClientId,
  onOpenPaywall,
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

  const [testType, setTestType] = useState<'PHQ-9' | 'GAD-7'>('PHQ-9');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isTestRunning, setIsTestRunning] = useState(false);

  const selectedClient = clients.find((c) => c.id === activeClientId);
  const pastAssessments = activeClientId
    ? storage.getAssessmentsForClient(activeClientId, currentUser.id)
    : [];

  const currentQuestions = testType === 'PHQ-9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;

  const handleSelectOption = (questionId: number, score: number) => {
    setAnswers({ ...answers, [questionId]: score });
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((a, b) => a + b, 0);
  };

  const handleSaveAssessment = () => {
    if (!activeClientId) return;

    const total = calculateScore();
    const evaluation =
      testType === 'PHQ-9' ? evaluatePHQ9(total) : evaluateGAD7(total);
    const max = testType === 'PHQ-9' ? 27 : 21;

    storage.addAssessmentResult({
      clientId: activeClientId,
      psychologistId: currentUser.id,
      type: testType,
      date: new Date().toISOString().split('T')[0],
      totalScore: total,
      maxScore: max,
      severity: evaluation.severity,
      recommendation: evaluation.recommendation,
      answers,
    });

    setIsTestRunning(false);
    setAnswers({});
    alert(`${testType} Assessment Saved. Score: ${total}/${max} (${evaluation.severity})`);
  };

  const chartData = pastAssessments
    .filter((a) => a.type === testType)
    .map((a) => ({
      date: a.date,
      score: a.totalScore,
      severity: a.severity,
    }));

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 shrink-0" /> Psychometric Testing (PHQ-9 & GAD-7)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized clinical outcome tracking with score trends & diagnostic evaluators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <select
            value={activeClientId}
            onChange={(e) => setActiveClientId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-semibold text-white px-3 py-2.5 rounded-xl focus:outline-none w-full sm:w-auto cursor-pointer"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsTestRunning(!isTestRunning)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            {isTestRunning ? 'Cancel Test' : 'Run New Assessment'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Test Runner or Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <button
              onClick={() => setTestType('PHQ-9')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                testType === 'PHQ-9'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              PHQ-9 (Depression)
            </button>
            <button
              onClick={() => setTestType('GAD-7')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                testType === 'GAD-7'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              GAD-7 (Anxiety)
            </button>
          </div>

          {isTestRunning ? (
            <div className="space-y-5">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{testType} Questionnaire</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Over the last 2 weeks, how often have you been bothered by:
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-teal-400">{calculateScore()}</span>
                  <span className="text-slate-500 font-normal"> / {testType === 'PHQ-9' ? 27 : 21}</span>
                </div>
              </div>

              <div className="space-y-4">
                {currentQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3"
                  >
                    <div className="text-xs font-semibold text-slate-200">
                      {q.id}. {q.text}
                    </div>

                    {/* Staked grid on mobile for easy touch targets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {q.options.map((opt) => {
                        const isSelected = answers[q.id] === opt.score;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.score)}
                            className={`p-3 sm:p-2.5 rounded-xl text-xs font-medium text-center border transition-all flex sm:block items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span>{opt.label}</span>
                            <span className="text-[10px] text-slate-400 font-bold sm:mt-0.5">+{opt.score}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveAssessment}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/30 transition-all"
              >
                Complete & Save {testType} Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Longitudinal {testType} Score Progression
                </h3>
                <span className="text-xs text-slate-400">
                  {chartData.length} records
                </span>
              </div>

              {chartData.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No {testType} assessments logged yet for this patient. Click "Run New Assessment" to start.
                </div>
              ) : (
                <div className="h-64 w-full bg-slate-950/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, testType === 'PHQ-9' ? 27 : 21]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#2dd4bf"
                        strokeWidth={3}
                        dot={{ fill: '#2dd4bf', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Clinical Test History
            </h3>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {pastAssessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No past assessment reports.
              </div>
            ) : (
              pastAssessments.map((ass) => (
                <div
                  key={ass.id}
                  className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-white">{ass.type} Assessment</span>
                      <div className="text-[10px] text-slate-400">{ass.date}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          if (!storage.canAccessPremiumFeature(currentUser)) {
                            onOpenPaywall();
                            return;
                          }
                          if (selectedClient) {
                            generateAssessmentPdf(selectedClient, ass, currentUser);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Report
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete this ${ass.type} assessment record?`)) {
                            storage.deleteAssessmentResult(ass.id);
                          }
                        }}
                        title="Delete Assessment Record"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-lg font-black text-teal-400">
                      {ass.totalScore} <span className="text-xs text-slate-500 font-normal">/ {ass.maxScore}</span>
                    </span>
                    <span className="text-xs font-semibold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                      {ass.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 italic line-clamp-2">
                    "{ass.recommendation}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
