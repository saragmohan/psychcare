import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Crown,
  Clock,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  LogOut,
  Building,
  ShieldCheck,
  Smile,
} from 'lucide-react';
import type { User } from '../types';
import { storage } from '../services/storageService';
import { AvatarPickerModal } from './AvatarPickerModal';

interface NavbarProps {
  currentUser: User;
  onOpenPaywall: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenPaywall,
  onLogout,
  activeTab,
  setActiveTab,
}) => {
  const [trialTime, setTrialTime] = useState(storage.getTrialTimeRemaining(currentUser));
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTrialTime(storage.getTrialTimeRemaining(currentUser));
    }, 30000);
    return () => clearInterval(timer);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    if (showRoleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleDropdown]);

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 text-white shadow-xl">
      {/* Banned Alert Banner */}
      {currentUser.status === 'banned' && (
        <div className="bg-red-600/90 text-white text-[11px] font-semibold px-3 py-1.5 flex items-center justify-center gap-1.5 text-center">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>ACCOUNT SUSPENDED BY ADMIN. READ-ONLY ACCESS.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Clinical Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin_dashboard' : 'dashboard')}
          >
            <div className="bg-gradient-to-tr from-indigo-500 to-teal-400 p-1.5 sm:p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                PsychCare
              </span>
              <span
                className={`hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-950 text-amber-300 border-amber-800/50'
                    : 'bg-indigo-950 text-indigo-300 border-indigo-800/50'
                }`}
              >
                {currentUser.role === 'admin' ? 'Admin Console' : 'Psychologist OS'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {currentUser.role === 'psychologist' && currentUser.status !== 'banned' && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'clients'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Patients
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SOAP Notes
              </button>
              <button
                onClick={() => setActiveTab('assessments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'assessments'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Assessments
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'appointments'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Calendar
              </button>
            </nav>
          )}

          {currentUser.role === 'admin' && (
            <nav className="hidden md:flex items-center gap-1 bg-amber-950/30 p-1 rounded-xl border border-amber-800/40">
              <button
                onClick={() => setActiveTab('admin_dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'admin_dashboard' || activeTab === 'dashboard'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-amber-300 hover:bg-amber-900/40'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('admin_users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'admin_users'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-amber-300 hover:bg-amber-900/40'
                }`}
              >
                Practitioners
              </button>
              <button
                onClick={() => setActiveTab('admin_logs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'admin_logs'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-amber-300 hover:bg-amber-900/40'
                }`}
              >
                Audit Logs
              </button>
            </nav>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {currentUser.role === 'psychologist' && currentUser.status !== 'banned' && (
              <>
                {currentUser.plan === 'trial' && (
                  <button
                    onClick={onOpenPaywall}
                    className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-xl text-[11px] font-semibold"
                  >
                    <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span><strong className="text-amber-200">{trialTime.formatted}</strong></span>
                  </button>
                )}

                {currentUser.plan === 'premium' && (
                  <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-xl text-[11px] font-bold">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span className="hidden sm:inline">PREMIUM</span> PRO
                  </div>
                )}

                {currentUser.plan === 'free' && (
                  <button
                    onClick={onOpenPaywall}
                    className="flex items-center gap-1 bg-indigo-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-md shadow-indigo-600/30"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Upgrade</span>
                  </button>
                )}
              </>
            )}

            {/* Profile Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-1 sm:px-3 sm:py-1.5 rounded-xl transition-all text-xs cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover ring-2 ring-indigo-500/50"
                />
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-slate-200 line-clamp-1">{currentUser.name}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                  {/* Practitioner Card Header */}
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        setShowAvatarPicker(true);
                      }}
                      className="relative group cursor-pointer shrink-0"
                      title="Choose avatar character DP"
                    >
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/40 group-hover:ring-indigo-400 group-hover:scale-105 transition-all shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1 shadow-md border border-slate-900 group-hover:bg-indigo-500 transition">
                        <Smile className="w-2.5 h-2.5" />
                      </span>
                    </button>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        {currentUser.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🛡️ Super Admin
                          </span>
                        ) : currentUser.plan === 'premium' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ⭐ Premium Pro
                          </span>
                        ) : currentUser.plan === 'trial' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            ⏱️ 3-Day Trial
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            🏷️ Basic Plan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Practice Details */}
                  {currentUser.role !== 'admin' && (
                    <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
                      {currentUser.clinicName && (
                        <div className="flex items-center gap-2 truncate text-slate-400">
                          <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{currentUser.clinicName}</span>
                        </div>
                      )}
                      {currentUser.licenseNumber && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>License: {currentUser.licenseNumber}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        setShowAvatarPicker(true);
                      }}
                      className="w-full text-left px-3 py-2 text-indigo-300 hover:bg-slate-800 rounded-xl transition flex items-center gap-2.5 text-xs font-semibold cursor-pointer"
                    >
                      <Smile className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Choose Avatar DP</span>
                    </button>

                    {currentUser.role === 'psychologist' && currentUser.plan !== 'premium' && (
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          onOpenPaywall();
                        }}
                        className="w-full text-left px-3 py-2 text-amber-300 hover:bg-slate-800 rounded-xl transition flex items-center gap-2.5 text-xs font-semibold cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Upgrade to Premium Pro</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-xl transition flex items-center gap-2.5 text-xs font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out / Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        currentAvatarUrl={currentUser.avatarUrl}
        userName={currentUser.name}
        onSelectAvatar={(avatarUrl) => {
          storage.updateUserAvatar(currentUser.id, avatarUrl);
        }}
      />
    </header>
  );
};
