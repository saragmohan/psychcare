import React, { useState } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  Lock,
  Download,
  ShieldCheck,
  Crown,
  Sparkles,
  Copy,
  Check,
  Smartphone,
  Info,
  Clock,
} from 'lucide-react';
import type { User, PaymentInvoice } from '../types';
import { storage } from '../services/storageService';
import { generateInvoicePdf } from '../services/invoiceService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  initialBillingCycle?: 'monthly' | 'yearly';
  onSuccess?: (invoice: PaymentInvoice) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialBillingCycle = 'yearly',
  onSuccess,
}) => {
  const paymentConfig = storage.getPaymentConfig();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialBillingCycle);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<PaymentInvoice | null>(null);

  if (!isOpen) return null;

  const planPrice = billingCycle === 'yearly' ? 19999 : 2499;
  const originalYearlyValue = 2499 * 12; // 29988
  const savings = originalYearlyValue - 19999; // 9989

  const upiUrl = `upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(
    paymentConfig.payeeName
  )}&am=${planPrice}&cu=INR&tn=${encodeURIComponent(
    `PsychCare ${billingCycle === 'yearly' ? 'Annual Pass' : 'Monthly Pass'}`
  )}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUrl
  )}&margin=8`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentConfig.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter your 12-digit UPI UTR / Transaction Reference number from your payment confirmation screen.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const result = storage.processWebSubscription(currentUser.id, {
        billingCycle,
        paymentMethodType: 'upi',
        utrNumber: utrNumber.trim(),
        upiId: paymentConfig.upiId,
      });

      setIsProcessing(false);
      setSuccessInvoice(result.invoice);
    }, 800);
  };

  const handleClose = () => {
    if (successInvoice && onSuccess) {
      onSuccess(successInvoice);
    }
    setSuccessInvoice(null);
    setUtrNumber('');
    onClose();
  };

  return (
    <div
      onClick={() => {
        if (!successInvoice) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white my-auto max-h-[92vh] overflow-y-auto cursor-default flex flex-col"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>PsychCare Web Checkout</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Lock className="w-2.5 h-2.5 inline mr-1" /> 256-Bit SSL
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Official Clinical Software License Activation</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {successInvoice ? (
          /* Payment Submission & Verification Confirmation View */
          <div className="p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
              <Clock className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Awaiting Admin Bank Verification
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Payment Submitted Successfully
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                Your UPI transfer reference <strong className="text-amber-300 font-mono">{successInvoice.paymentMethod.utrNumber}</strong> has been logged. An administrator will verify the credited funds in our bank account and activate your subscription shortly.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-left space-y-3 max-w-lg mx-auto">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">Provisional Invoice:</span>
                <span className="font-mono text-xs font-bold text-white">{successInvoice.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">License Plan:</span>
                <span className="text-xs font-bold text-indigo-300">{successInvoice.planName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">Transfer Amount:</span>
                <span className="text-xs font-bold text-white">₹{successInvoice.amount.toLocaleString('en-IN')} INR</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">Payment Channel:</span>
                <span className="text-xs font-semibold text-slate-300">
                  DIRECT UPI TRANSFER
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">Transaction UTR / Ref:</span>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {successInvoice.paymentMethod.utrNumber || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Verification Status:</span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> PENDING ADMIN APPROVAL
                </span>
              </div>
            </div>

            {/* Activation Timeline & Support Instructions Card */}
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-left max-w-lg mx-auto space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Account Activation Timeline: Within 1–2 Hours</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your payment submission has been recorded. Your account will be activated with <strong className="text-amber-300">Premium membership within 1–2 hours</strong> once admin verifies bank credit confirmation.
              </p>
              <div className="pt-2.5 border-t border-amber-500/20 text-[11px] text-slate-300 leading-relaxed">
                <span className="font-semibold text-amber-300">Beyond 2 hours and membership still not granted?</span>
                <p className="mt-1">
                  Please send an email with your payment screenshot and UTR number to{' '}
                  <a
                    href={`mailto:psychcare.support@gmail.com?subject=Payment%20Verification%20Followup%20-%20Invoice%20${successInvoice.id}%20(UTR:%20${successInvoice.paymentMethod.utrNumber || ''})`}
                    className="text-amber-300 hover:text-amber-200 font-bold underline transition"
                  >
                    psychcare.support@gmail.com
                  </a>
                  . Our team will verify and activate your account immediately.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => generateInvoicePdf(successInvoice, currentUser)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Download Provisional Receipt (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
              >
                <span>Back to Workspace</span>
              </button>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-lg mx-auto">
              <span>All rights reserved to PsychCare.</span>
              <span>
                Support:{' '}
                <a href="mailto:psychcare.support@gmail.com" className="text-slate-400 hover:text-slate-300 underline font-medium">
                  psychcare.support@gmail.com
                </a>
              </span>
            </div>
          </div>
        ) : (
          /* Payment Form & Plan Selection */
          <form onSubmit={handleProcessPayment} className="p-4 sm:p-6 space-y-6">
            {/* Step 1: Billing Frequency Toggle */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Select License Pass (One-Time Direct Transfer)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 relative ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-br from-indigo-950/60 to-amber-950/30 border-amber-500/60 shadow-lg ring-1 ring-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Annual Pass (365 Days)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950">
                      SAVE ₹{savings.toLocaleString('en-IN')} (33%)
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">₹19,999 <span className="text-xs font-normal text-slate-400">/ 1-year pass</span></div>
                    <div className="text-[11px] text-amber-300/90 font-medium mt-0.5">Equals ₹1,666 / mo • No automatic renewal</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                    billingCycle === 'monthly'
                      ? 'bg-indigo-950/50 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Monthly Pass (30 Days)</span>
                    <span className="text-[11px] text-slate-400">Flexible Pass</span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">₹2,499 <span className="text-xs font-normal text-slate-400">/ 30-day pass</span></div>
                    <div className="text-[11px] text-slate-400 mt-0.5">One-time payment • No auto-debit</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: UPI Payment QR Code & Apps */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-white">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>2. Scan UPI QR Code or Tap to Pay</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Zero Gateway Fee
                </span>
              </div>

              <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Live Scannable QR Code */}
                  <div className="p-3 bg-white rounded-2xl shrink-0 shadow-lg border border-slate-700 flex flex-col items-center">
                    <img
                      src={qrImageUrl}
                      alt="PsychCare UPI QR Code"
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-lg object-contain"
                    />
                    <span className="text-[10px] font-black text-slate-800 mt-1 uppercase tracking-wider">
                      ₹{planPrice.toLocaleString('en-IN')} INR
                    </span>
                  </div>

                  {/* VPA Details & Quick Copy */}
                  <div className="space-y-3 flex-1 min-w-0 text-center sm:text-left">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Official Merchant UPI VPA
                      </span>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <code className="text-sm font-black text-amber-300 font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                          {paymentConfig.upiId}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          {copiedUpi ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      Payee: <strong className="text-white">{paymentConfig.payeeName}</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Works with Google Pay, PhonePe, Paytm, BHIM, Cred, and all mobile banking apps.
                      </div>
                    </div>

                    {/* Direct UPI Mobile Link */}
                    <a
                      href={upiUrl}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Pay in UPI App (GPay / PhonePe / Paytm)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Enter UPI UTR / Transaction Reference ID */}
            <div className="bg-slate-950/90 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>3. Enter 12-Digit UPI UTR / Ref No.</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUtrNumber(`4${Math.floor(10000000000 + Math.random() * 90000000000)}`)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                >
                  Auto-fill Test UTR
                </button>
              </div>

              <input
                type="text"
                required
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.trim())}
                placeholder="e.g. 412389104523 (12-digit UPI UTR)"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none"
              />

              <div className="flex items-start gap-1.5 text-[11px] text-slate-400 pt-0.5">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  Found in your payment confirmation screen in Google Pay, PhonePe, Paytm, or BHIM. This activates your pass immediately and generates your official receipt.
                </span>
              </div>
            </div>

            {/* Order Summary & Total Due */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>License Plan:</span>
                <span className="font-semibold text-white">
                  PsychCare Premium Pro ({billingCycle === 'yearly' ? '365-Day Annual Pass' : '30-Day Monthly Pass'})
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Direct Fee:</span>
                <span className="font-semibold text-emerald-400">One-Time Direct Transfer (No Auto-Debit)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Applicable Taxes:</span>
                <span className="font-semibold text-white">₹0.00 INR</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                <span className="font-bold text-sm text-white">Total Transfer Amount:</span>
                <span className="font-black text-lg text-emerald-400">₹{planPrice.toLocaleString('en-IN')} INR</span>
              </div>
            </div>

            {/* Submit & Guarantee */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-400 hover:to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>CONFIRM UPI PAYMENT & ACTIVATE {billingCycle === 'yearly' ? 'ANNUAL' : 'MONTHLY'} PASS</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Manual Bank Verification (1-2 Hours)
                </span>
                <span>•</span>
                <span>Official PDF Tax Receipt Issued</span>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1">
                <span>All rights reserved to PsychCare.</span>
                <span>
                  Support:{' '}
                  <a href="mailto:psychcare.support@gmail.com" className="text-slate-400 hover:text-slate-300 underline font-medium">
                    psychcare.support@gmail.com
                  </a>
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
