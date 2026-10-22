import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Fingerprint,
  Inbox,
} from 'lucide-react';
import { authService } from '../services/authService';
import { EmailViewerModal } from './EmailViewerModal';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onResetSuccess: (email: string, newPassword: string) => void;
}

type ResetStep = 'identify' | 'confirm_otp' | 'new_password';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onResetSuccess,
}) => {
  const [step, setStep] = useState<ResetStep>('identify');
  const [email, setEmail] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [targetUserName, setTargetUserName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailViewer, setShowEmailViewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('identify');
      setEmail(initialEmail);
      setTargetEmail('');
      setMaskedEmail('');
      setTargetUserName('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessInfo(null);
      setLoading(false);
      setShowEmailViewer(false);
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  // Step 1: Request confirmation code
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessInfo(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your practitioner email or username.');
      return;
    }

    setLoading(true);
    const res = authService.requestPasswordResetCode(trimmed);
    setLoading(false);

    if (res.success) {
      setMaskedEmail(res.maskedEmail || trimmed);
      setTargetEmail(res.targetEmail || trimmed);
      setTargetUserName(res.targetUserName || 'Practitioner');
      setStep('confirm_otp');
      setSuccessInfo(`A 6-digit confirmation code has been dispatched to your email address: ${res.maskedEmail || trimmed}. Please check your inbox.`);
    } else {
      setErrorMsg(res.error || 'Failed to locate account. Please verify your email.');
    }
  };

  // Step 2: Confirm real-user identity with OTP code entered from email
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = otpCode.trim();
    if (!trimmedCode) {
      setErrorMsg('Please enter the 6-digit confirmation code sent to your email.');
      return;
    }

    setLoading(true);
    const res = authService.verifyResetCode(email, trimmedCode);
    setLoading(false);

    if (res.success) {
      setStep('new_password');
      setErrorMsg(null);
      setSuccessInfo(null);
    } else {
      setErrorMsg(res.error || 'Invalid confirmation code. Please check your email and try again.');
    }
  };

  // Resend OTP code to email
  const handleResendCode = () => {
    setErrorMsg(null);
    const res = authService.requestPasswordResetCode(email);
    if (res.success) {
      setSuccessInfo(`A fresh 6-digit confirmation code was sent to your email (${res.maskedEmail || email}).`);
    } else {
      setErrorMsg(res.error || 'Failed to resend confirmation email.');
    }
  };

  // Step 3: Complete password reset
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    const res = await authService.completePasswordReset(email, otpCode, newPassword);
    setLoading(false);

    if (res.success) {
      onResetSuccess(email, newPassword);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {step === 'identify' && 'Reset Password'}
                  {step === 'confirm_otp' && 'Verify Account Identity'}
                  {step === 'new_password' && 'Create New Password'}
                </h2>
                <p className="text-xs text-slate-400">
                  {step === 'identify' && 'Step 1 of 3: Identify your account'}
                  {step === 'confirm_otp' && 'Step 2 of 3: Enter security code sent to email'}
                  {step === 'new_password' && 'Step 3 of 3: Set secure clinical credentials'}
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

          {/* Progress Step Indicators */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step === 'identify'
                  ? 'bg-indigo-500'
                  : 'bg-emerald-500'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step === 'confirm_otp'
                  ? 'bg-indigo-500'
                  : step === 'new_password'
                  ? 'bg-emerald-500'
                  : 'bg-slate-800'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step === 'new_password' ? 'bg-indigo-500' : 'bg-slate-800'
              }`}
            />
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Info Alert */}
          {successInfo && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* STEP 1: IDENTIFY ACCOUNT */}
          {step === 'identify' && (
            <form onSubmit={handleRequestCode} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-400 text-[11px] leading-relaxed">
                To protect confidential patient records, a <strong>6-digit security code</strong> will be sent to your registered email address. You will need to take the code from your email to verify your identity.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Registered Email or Username *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="sarah.jenkins@mindcare.com or admin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      <span>Send Code to Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REAL-USER CONFIRMATION (CODE SENT TO EMAIL) */}
          {step === 'confirm_otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Fingerprint className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Check Your Email Inbox</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We have sent your 6-digit confirmation code to <strong className="text-white">{maskedEmail}</strong>. Please check your email inbox and enter the code below.
                </p>
              </div>

              {/* Action button to open user's email client / webmail */}
              <button
                type="button"
                onClick={() => setShowEmailViewer(true)}
                className="w-full py-2.5 px-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer"
              >
                <Inbox className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Open / View Email Message ({maskedEmail})</span>
              </button>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Type 6-Digit Code from Email *
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
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

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('identify')}
                  className="hover:text-slate-200 cursor-pointer"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
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
                  className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {step === 'new_password' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Identity Verified! You may now set your new password for {targetUserName}.</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    type={showPassword ? 'text' : 'password'}
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
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Save & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <EmailViewerModal
        isOpen={showEmailViewer}
        onClose={() => setShowEmailViewer(false)}
        email={targetEmail || email}
      />
    </>
  );
};
