import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Fingerprint,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Inbox,
} from 'lucide-react';
import type { User } from '../types';
import { authService, maskEmail } from '../services/authService';
import { EmailViewerModal } from './EmailViewerModal';

interface ProfilePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const ProfilePasswordModal: React.FC<ProfilePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'change' | 'reset_otp'>('change');

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // OTP Reset fields
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showEmailViewer, setShowEmailViewer] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('change');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpSent(false);
      setOtpCode('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoading(false);
      setShowEmailViewer(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle direct password change with current password
  const handleChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    const res = authService.changePassword(currentUser.id, currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Failed to update password.');
    }
  };

  // Handle request for OTP confirmation code
  const handleRequestOtp = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = authService.requestPasswordResetCode(currentUser.email);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setSuccessMsg(`A 6-digit confirmation code was sent to ${maskEmail(currentUser.email)}. Please check your inbox.`);
    } else {
      setErrorMsg(res.error || 'Failed to dispatch confirmation email.');
    }
  };

  // Handle OTP verification and reset
  const handleResetWithOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedCode = otpCode.trim();
    if (!trimmedCode) {
      setErrorMsg('Please enter the 6-digit confirmation code sent to your email.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await authService.completePasswordReset(currentUser.email, trimmedCode, resetNewPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Password successfully reset!');
      setOtpCode('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Failed to reset password. Please check the confirmation code.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Account Password & Security
                </h2>
                <p className="text-xs text-slate-400">
                  Manage credentials for {currentUser.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Badge */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/40 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                currentUser.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {currentUser.role === 'admin' ? '🛡️ Admin' : '🩺 Practitioner'}
            </span>
          </div>

          {/* Tab Selection */}
          <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('change');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === 'change'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('reset_otp');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === 'reset_otp'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Forgot Password? Verify Identity
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: CHANGE PASSWORD WITH CURRENT PASSWORD */}
          {activeTab === 'change' && (
            <form onSubmit={handleChangeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your existing password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: RESET PASSWORD WITH REAL-USER OTP VERIFICATION */}
          {activeTab === 'reset_otp' && (
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Fingerprint className="w-4 h-4 text-amber-400" />
                      <span>Real-User Identity Confirmation</span>
                    </div>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed">
                      If you do not remember your current password, we will verify your identity by sending a 6-digit confirmation code to your registered email: <strong className="text-white">{maskEmail(currentUser.email)}</strong>. You will need to retrieve the code from your email to reset your password.
                    </p>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Code to Email</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetWithOtpSubmit} className="space-y-4">
                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                      <Fingerprint className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Check Your Email Inbox</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      We have sent your 6-digit confirmation code to <strong className="text-white">{maskEmail(currentUser.email)}</strong>. Please check your email inbox and enter the code below.
                    </p>
                  </div>

                  {/* Action button to open user's email client / webmail */}
                  <button
                    type="button"
                    onClick={() => setShowEmailViewer(true)}
                    className="w-full py-2.5 px-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer"
                  >
                    <Inbox className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Open / View Email Message ({currentUser.email})</span>
                  </button>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Type 6-Digit Code from Email *
                    </label>
                    <div className="relative">
                      <ShieldAlert className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit code (e.g. 849201)"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm text-center"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Re-enter new password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="hover:text-slate-200 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend Email</span>
                    </button>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otpCode.length < 6}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Verify & Reset</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <EmailViewerModal
        isOpen={showEmailViewer}
        onClose={() => setShowEmailViewer(false)}
        email={currentUser.email}
      />
    </>
  );
};
