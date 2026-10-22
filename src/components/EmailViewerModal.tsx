import React from 'react';
import { X, Mail, Clock, ExternalLink } from 'lucide-react';
import { emailService } from '../services/emailService';

interface EmailViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const EmailViewerModal: React.FC<EmailViewerModalProps> = ({
  isOpen,
  onClose,
  email,
}) => {
  if (!isOpen) return null;

  const latestEmail = emailService.getLatestEmailFor(email);
  const normalized = email.toLowerCase().trim();

  const getWebmailUrl = (): { name: string; url: string } | null => {
    if (normalized.endsWith('@gmail.com')) {
      return { name: 'Open Gmail', url: 'https://mail.google.com' };
    }
    if (normalized.endsWith('@outlook.com') || normalized.endsWith('@hotmail.com')) {
      return { name: 'Open Outlook', url: 'https://outlook.live.com' };
    }
    if (normalized.endsWith('@yahoo.com')) {
      return { name: 'Open Yahoo Mail', url: 'https://mail.yahoo.com' };
    }
    if (normalized.endsWith('@icloud.com')) {
      return { name: 'Open iCloud Mail', url: 'https://www.icloud.com/mail' };
    }
    return null;
  };

  const webmail = getWebmailUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 overflow-hidden text-white my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                Practitioner Email Inbox
              </h3>
              <p className="text-[11px] text-slate-400">
                Viewing inbox for <strong className="text-slate-200">{email}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Webmail Shortcut Button (if Gmail / Outlook / etc.) */}
        {webmail && (
          <a
            href={webmail.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 text-indigo-300 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold transition"
          >
            <span>{webmail.name} in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Incoming Email Body */}
        {latestEmail ? (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner text-xs">
            {/* Email Meta Header */}
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white text-sm">
                  {latestEmail.subject}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {new Date(latestEmail.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <div>
                  <strong className="text-slate-300">From:</strong> PsychCare Security &lt;security@psychcare.app&gt;
                </div>
                <div>
                  <strong className="text-slate-300">To:</strong> {latestEmail.to}
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="p-4 sm:p-5 space-y-4 font-sans text-slate-200 leading-relaxed">
              <p>Dear {latestEmail.toName},</p>
              <p>
                We received a request to reset the password for your PsychCare clinical account (<strong className="text-white">{latestEmail.to}</strong>).
              </p>

              {/* Code Box Inside Email */}
              <div className="p-4 bg-indigo-950/60 border border-indigo-500/40 rounded-2xl text-center space-y-1 my-3 shadow-md">
                <div className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">
                  Your 6-Digit Confirmation Code
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-indigo-100 tracking-widest py-1 select-all">
                  {latestEmail.code}
                </div>
                <div className="text-[10px] text-slate-400">
                  Valid for 15 minutes • Do not share this code
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                To complete your password reset, return to the PsychCare screen and enter this 6-digit confirmation code.
              </p>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-0.5">
                <div>PsychCare Clinical Practice Operations</div>
                <div>HIPAA Compliant Healthcare Communications</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <Mail className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="font-semibold text-slate-300 text-sm">No Emails Yet</div>
            <p className="text-xs text-slate-500">
              When a confirmation code is dispatched, your email will appear here.
            </p>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Close & Enter Code on Screen
          </button>
        </div>
      </div>
    </div>
  );
};
