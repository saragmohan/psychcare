import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Building,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Smile,
  Eye,
  EyeOff,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { AVATAR_CHARACTERS } from '../../services/avatarCharacters';
import { AvatarPickerModal } from '../../components/AvatarPickerModal';
import { ForgotPasswordModal } from '../../components/ForgotPasswordModal';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [name, setName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_CHARACTERS[1].dataUrl);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Restore remembered credentials (only if user explicitly clicked remember me), flash message and prefilled email
  useEffect(() => {
    try {
      const flash = sessionStorage.getItem('psychcare_flash_msg');
      const prefillEmail = sessionStorage.getItem('psychcare_prefill_email');
      const remembered = authService.getRememberedCredentials();

      if (flash) {
        setSuccessMsg(flash);
        sessionStorage.removeItem('psychcare_flash_msg');
      }

      if (prefillEmail) {
        setEmail(prefillEmail);
        sessionStorage.removeItem('psychcare_prefill_email');
      } else if (remembered?.email && remembered?.password) {
        setEmail(remembered.email);
        setPassword(remembered.password);
        setRememberPassword(true);
      } else {
        setEmail('');
        setPassword('');
        setRememberPassword(false);
      }
    } catch (e) {
      console.warn('Session/Local storage read error:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (isSignUp) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full practitioner name.');
        setLoading(false);
        return;
      }
      const res = await authService.signUp({
        name,
        email,
        pass: password,
        clinicName,
        licenseNumber,
        avatarUrl: selectedAvatar,
      });

      if (res.success) {
        // Persist message & prefilled email across the screen refresh
        const message = 'Account created successfully! Please sign in with your password to enter your workspace.';
        setSuccessMsg(message);
        try {
          sessionStorage.setItem('psychcare_flash_msg', message);
          sessionStorage.setItem('psychcare_prefill_email', email.trim());
        } catch (err) {
          console.warn('Session storage save error:', err);
        }

        // Clean up signup state and switch tab
        setName('');
        setClinicName('');
        setLicenseNumber('');
        setPassword('');
        setIsSignUp(false);
        setLoading(false);

        // Screen refreshes back to clean login screen
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        setLoading(false);
        setErrorMsg(res.error || 'Account creation failed. Try again.');
      }
    } else {
      const res = await authService.login(email, password);
      setLoading(false);

      if (res.success) {
        if (rememberPassword) {
          authService.saveRememberedCredentials(email, password);
        } else {
          authService.clearRememberedCredentials();
        }
        onLoginSuccess();
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please check your username/email & password.');
      }
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 font-sans relative pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
      {/* Serene Ambient Background Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-3xl p-4 sm:p-8 shadow-2xl relative z-10 space-y-4 sm:space-y-6 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 bg-[#E4E0DA] rounded-3xl shadow-xl shadow-indigo-500/10 mb-1 border border-slate-700/60">
            <img
              src="/logo.png"
              alt="PsychCare Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain shadow-sm"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            PsychCare
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Clinical Psychologist OS • HIPAA & Privacy Secure
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              !isSignUp ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Practitioner Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              isSignUp ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Practitioner Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Dr. Jane Smith, PsyD"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clinic / Practice Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Beacon Ridge Psychological Services"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">License Number</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="PSY-98412"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Profile Avatar Character Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Profile Avatar Character</label>
                <div className="flex items-center gap-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="relative shrink-0">
                    <img
                      src={selectedAvatar}
                      alt="Avatar DP"
                      className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 shadow-sm object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-[9px] font-black shadow">
                      ✓
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs truncate">Character DP</div>
                    <div className="text-[11px] text-slate-400 truncate">Choose your character icon</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(true)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Smile className="w-3.5 h-3.5" />
                    <span>Choose</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {isSignUp ? 'Email Address *' : 'Username or Email Address *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={isSignUp ? 'email' : 'text'}
                required
                placeholder={isSignUp ? 'doctor@practice.com' : 'e.g. admin or doctor@practice.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Password Checkbox & Forgot Password Link */}
          {!isSignUp && (
            <div className="flex items-center justify-between pt-0.5 pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer accent-indigo-600"
                />
                <span className="text-slate-300 text-xs font-medium">Remember password</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create 3-Day Free Trial Account' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Login Screen Footer */}
      <footer className="text-center text-xs text-slate-500 mt-4 space-y-1 relative z-10">
        <div>All rights reserved to PsychCare.</div>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <span>Support & Helpdesk:</span>
          <a
            href="mailto:psychcare.support@gmail.com"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline transition"
          >
            psychcare.support@gmail.com
          </a>
        </div>
      </footer>

      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        currentAvatarUrl={selectedAvatar}
        onSelectAvatar={(url) => setSelectedAvatar(url)}
        title="Choose Your Character Avatar"
      />

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialEmail={email}
        onResetSuccess={(resetEmail, newPass) => {
          setEmail(resetEmail);
          setPassword(newPass);
          setSuccessMsg('Password reset successfully! You can now sign in with your new password.');
          if (rememberPassword) {
            authService.saveRememberedCredentials(resetEmail, newPass);
          }
        }}
      />
    </div>
  );
};
