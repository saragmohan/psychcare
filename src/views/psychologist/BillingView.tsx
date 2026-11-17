import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  CreditCard,
  QrCode,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  ArrowRight,
} from 'lucide-react';
import type { User, PaymentInvoice } from '../../types';
import { storage } from '../../services/storageService';
import { generateInvoicePdf } from '../../services/invoiceService';
import { CheckoutModal } from '../../components/CheckoutModal';

interface BillingViewProps {
  currentUser: User;
  onOpenPaywall?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ currentUser }) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutBillingCycle, setCheckoutBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [, setRefreshKey] = useState(0);

  const forceRefresh = () => setRefreshKey((prev) => prev + 1);

  const user = currentUser || storage.getCurrentUser();
  const trialInfo = storage.getTrialTimeRemaining(user);
  const invoices = storage.getInvoices(user.id);
  const clients = storage.getClients(user.id);

  const handleCheckoutSuccess = (_invoice: PaymentInvoice) => {
    setIsCheckoutOpen(false);
    forceRefresh();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in pb-16">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>Practice Subscription & Billing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Plans, Invoices & Payment Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your PsychCare web membership, view tax receipts, and access unmetered clinical tools.
          </p>
        </div>

        {user.plan !== 'premium' && (
          <button
            type="button"
            onClick={() => {
              setCheckoutBillingCycle('yearly');
              setIsCheckoutOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Upgrade to Pro</span>
          </button>
        )}
      </div>

      {/* Current Plan Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Current Active Membership
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {user.plan === 'premium'
                  ? 'PsychCare Premium Pro'
                  : user.plan === 'trial'
                  ? '3-Day All-Access Trial'
                  : 'Basic Free Tier'}
              </h2>

              {user.plan === 'premium' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active
                </span>
              )}

              {user.plan === 'trial' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> In Trial
                </span>
              )}

              {user.plan === 'free' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Free Plan
                </span>
              )}
            </div>
          </div>

          {/* Action on Plan */}
          <div className="flex items-center gap-2">
            {user.plan === 'premium' ? (
              <button
                type="button"
                onClick={() => {
                  setCheckoutBillingCycle('yearly');
                  setIsCheckoutOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extend / Renew Pass</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCheckoutBillingCycle('yearly');
                  setIsCheckoutOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unlock Full Access</span>
              </button>
            )}
          </div>
        </div>

        {/* Plan Details & Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400">Patient Capacity</span>
            <div className="text-lg font-bold text-white mt-0.5">
              {user.plan === 'premium' ? 'Unlimited' : `${clients.length} / 3 Active`}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {user.plan === 'premium'
                ? 'No client limits or caps'
                : 'Free tier capped at 3 active clients'}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400">Renewal / Expiration</span>
            <div className="text-lg font-bold text-white mt-0.5">
              {user.plan === 'premium' && user.premiumExpiresAt
                ? new Date(user.premiumExpiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : user.plan === 'trial'
                ? `${trialInfo.days} days remaining`
                : 'Free Tier (No Expiry)'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {user.plan === 'premium'
                ? 'Direct One-Time Pass (No auto-debit)'
                : user.plan === 'trial'
                ? `Trial ends ${new Date(user.trialEndsAt).toLocaleDateString()}`
                : 'Standard access with limits'}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400">Payment Channel</span>
            <div className="text-lg font-bold text-indigo-300 mt-0.5 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Direct UPI / QR Transfer</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Google Pay • PhonePe • Paytm • Card Link
            </div>
          </div>
        </div>
      </div>

      {/* Plan Tier Pricing Comparison */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <span>Available Membership Tiers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Monthly Direct Pass (30 Days)
                </span>
                <span className="text-[11px] text-slate-400">One-Time Transfer</span>
              </div>

              <div>
                <div className="text-3xl font-black text-white">
                  ₹2,499 <span className="text-sm font-normal text-slate-400">/ 30 days</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Flexible access for private clinicians. No auto-debit.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Client Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full DSM-5 & ICD-11 Diagnostic Search</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PHQ-9 & GAD-7 Psychometric Battery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PDF Medical Report Export & Sharing</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCheckoutBillingCycle('monthly');
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
            >
              <span>Pay via UPI (₹2,499)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Annual Tier (Recommended) */}
          <div className="bg-gradient-to-b from-indigo-950/40 via-slate-900 to-amber-950/20 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-black px-4 py-1 rounded-bl-2xl shadow-md uppercase tracking-wider">
              SAVE 33% (₹9,989 OFF)
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Annual Professional Pass (365 Days)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ⭐ MOST POPULAR
                </span>
              </div>

              <div>
                <div className="text-3xl font-black text-white">
                  ₹19,999 <span className="text-sm font-normal text-slate-400">/ 1-year pass</span>
                </div>
                <p className="text-xs text-amber-200/80 mt-1">
                  Just <strong>₹1,666 / month</strong>. One-time payment, no auto-renewal.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-medium text-white">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Everything in Monthly, plus:</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority Feature Updates & Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom Practice Branding on PDF Exports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>14-Day Money Back Guarantee</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCheckoutBillingCycle('yearly');
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Pay via UPI (₹19,999)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Invoice & Payment History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Invoices & Official Tax Receipts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Download itemized PDF receipts for tax accounting and clinic business expense filing.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {invoices.length} {invoices.length === 1 ? 'receipt' : 'receipts'}
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No billing invoices recorded yet.</p>
            <p className="text-[11px] text-slate-600">
              When you activate a subscription, official receipts will be stored here for instant PDF download.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                  <th className="py-3 px-3">INVOICE ID</th>
                  <th className="py-3 px-3">DATE</th>
                  <th className="py-3 px-3">PLAN DESCRIPTION</th>
                  <th className="py-3 px-3">AMOUNT</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-white">{inv.id}</td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(inv.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-medium">
                      {inv.planName}
                      <span className="block text-[10px] text-slate-500">
                        UPI{' '}
                        {inv.paymentMethod.utrNumber ? `(UTR: ${inv.paymentMethod.utrNumber})` : inv.paymentMethod.last4 ? `(•••• ${inv.paymentMethod.last4})` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-white">₹{inv.amount.toLocaleString('en-IN')} INR</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PAID
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => generateInvoicePdf(inv, user)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        title="Download PDF Tax Invoice"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security & FAQ Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Payment Security & Tax Transparency</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          All transactions are processed through end-to-end 256-bit encrypted web gateways. PsychCare complies with strict data segregation standards. Invoices generated through PsychCare include official business details and are compliant for private practice tax deductions.
        </p>
      </div>

      {/* Web Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        currentUser={user}
        initialBillingCycle={checkoutBillingCycle}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};
