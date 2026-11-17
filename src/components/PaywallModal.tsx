import React, { useState } from 'react';
import {
  X,
  Crown,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Tag,
  Users,
  ArrowRight,
} from 'lucide-react';
import type { User, PaymentInvoice } from '../types';
import { storage } from '../services/storageService';
import { CheckoutModal } from './CheckoutModal';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpgradeSuccess: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpgradeSuccess,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  const trialInfo = storage.getTrialTimeRemaining(currentUser);

  const handleCheckoutSuccess = (_invoice: PaymentInvoice) => {
    setIsCheckoutOpen(false);
    onUpgradeSuccess();
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in cursor-pointer overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white my-auto max-h-[92vh] overflow-y-auto cursor-default"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer z-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Header */}
          <div className="p-6 sm:p-8 text-center relative z-10 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>PSYCHCARE CLINICAL OS FOR WEB</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Unlock Unlimited Practice Growth
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {trialInfo.expired
                ? 'Your 3-day trial period has concluded. Upgrade now to keep managing patient records and exporting session notes.'
                : `Your 3-Day Free Trial is Active (${trialInfo.formatted} left). Lock in your practitioner rate today.`}
            </p>

            {/* Billing Cycle Switcher */}
            <div className="mt-5 inline-flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly (₹2,499/mo)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-indigo-600 to-amber-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual (₹19,999/yr)</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  SAVE 33%
                </span>
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-indigo-400 uppercase tracking-wider">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Unlimited Client Profiles</span>
              </div>
              <p className="text-xs text-slate-300">
                Remove the 3-patient free limit. Manage comprehensive intakes and therapy case files.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-400 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Complete DSM-5 & ICD-11 Suite</span>
              </div>
              <p className="text-xs text-slate-300">
                Searchable diagnostic database with 1-click tagging directly into clinical progress notes.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 uppercase tracking-wider">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>PDF Reports & Outcome Graphs</span>
              </div>
              <p className="text-xs text-slate-300">
                Download beautifully formatted medical summary PDFs for SOAP session notes and assessments.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-purple-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Encrypted Web Security</span>
              </div>
              <p className="text-xs text-slate-300">
                Strict practitioner role segregation. Private client data is never sold or shared with third parties.
              </p>
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-white">
                {billingCycle === 'yearly' ? '₹19,999' : '₹2,499'}
                <span className="text-xs text-slate-400 font-normal">
                  /{billingCycle === 'yearly' ? 'year (₹1,666/mo)' : 'month'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Instant web activation • Direct UPI (Google Pay / PhonePe / Paytm) • One-time transfer
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                <span>UPGRADE NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Web Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        currentUser={currentUser}
        initialBillingCycle={billingCycle}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
};
