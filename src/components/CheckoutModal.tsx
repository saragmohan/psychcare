import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  Download,
  ShieldCheck,
  Crown,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { User, PaymentInvoice, PaymentMethodType } from '../types';
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialBillingCycle);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardName, setCardName] = useState(currentUser.name || 'Dr. Therapist');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [upiId, setUpiId] = useState('psychologist@upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<PaymentInvoice | null>(null);

  if (!isOpen) return null;

  const planPrice = billingCycle === 'yearly' ? 249 : 29;
  const originalYearlyValue = 29 * 12; // 348
  const savings = originalYearlyValue - 249; // 99

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardExpiry(val);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const result = storage.processWebSubscription(currentUser.id, {
        billingCycle,
        paymentMethodType: paymentMethod,
        cardNumber,
        cardName,
        cardExpiry,
        cardCvc,
        upiId: paymentMethod === 'upi' ? upiId : undefined,
      });

      setIsProcessing(false);
      setSuccessInvoice(result.invoice);
      if (onSuccess) {
        onSuccess(result.invoice);
      }
    }, 1200);
  };

  const handleClose = () => {
    setSuccessInvoice(null);
    onClose();
  };

  return (
    <div
      onClick={handleClose}
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
          /* Payment Success Confirmation View */
          <div className="p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Payment Confirmed & Verified
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Welcome to PsychCare Premium Pro!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
                Your professional license is now active. All limitations (patient caps, DSM-5 coding locks, and export restrictions) have been instantly lifted.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-left space-y-3 max-w-lg mx-auto">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">Invoice Number:</span>
                <span className="font-mono text-xs font-bold text-white">{successInvoice.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">License Plan:</span>
                <span className="text-xs font-bold text-indigo-300">{successInvoice.planName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs text-slate-400">Amount Charged:</span>
                <span className="text-xs font-bold text-white">${successInvoice.amount}.00 USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Payment Channel:</span>
                <span className="text-xs font-semibold text-slate-300">
                  {successInvoice.paymentMethod.type.toUpperCase()}{' '}
                  {successInvoice.paymentMethod.last4 ? `(•••• ${successInvoice.paymentMethod.last4})` : ''}
                </span>
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
                <span>Download Tax Invoice / Receipt (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <span>Launch Clinical OS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form & Plan Selection */
          <form onSubmit={handleProcessPayment} className="p-4 sm:p-6 space-y-6">
            {/* Step 1: Billing Frequency Toggle */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Select Subscription Frequency</span>
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
                    <span className="font-bold text-sm text-white">Annual Membership</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950">
                      SAVE ${savings} (28%)
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">$249 <span className="text-xs font-normal text-slate-400">/ year</span></div>
                    <div className="text-[11px] text-amber-300/90 font-medium mt-0.5">Equals $20.75 / month (Billed yearly)</div>
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
                    <span className="font-bold text-sm text-white">Monthly Plan</span>
                    <span className="text-[11px] text-slate-400">Flexibility</span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">$29 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Billed monthly, cancel anytime</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Payment Gateway & Method Selector */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>2. Select Payment Method</span>
                <span className="text-[11px] text-slate-500 font-normal">Instant activation</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'paypal'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>PayPal</span>
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <div className="absolute right-3 top-2.5 flex items-center gap-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40">
                          VISA
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-600/30 text-orange-300 border border-orange-500/40">
                          MC
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Dr. Full Name"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          placeholder="CVC"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI / QR Form */}
              {paymentMethod === 'upi' && (
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shrink-0 shadow-md">
                      <QrCode className="w-16 h-16 text-slate-900" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-white">Scan with any UPI App</div>
                      <div className="text-[11px] text-slate-400">
                        Supports Google Pay, PhonePe, Paytm, and BHIM UPI.
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Zero transaction surcharges
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Or Pay via UPI Virtual Address (VPA)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* PayPal / Express Form */}
              {paymentMethod === 'paypal' && (
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2 text-center animate-in fade-in">
                  <p className="text-xs text-slate-300">
                    You will be securely routed through PayPal Express web authentication to complete this subscription order.
                  </p>
                  <div className="text-[11px] text-amber-400 font-medium">
                    1-Click authorization with Buyer Protection
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary & Total Due */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Plan:</span>
                <span className="font-semibold text-white">
                  PsychCare Premium Pro ({billingCycle === 'yearly' ? 'Annual' : 'Monthly'})
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Access:</span>
                <span className="font-semibold text-emerald-400">Unlimited Patients & Full DSM-5 Suite</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Applicable Taxes:</span>
                <span className="font-semibold text-white">$0.00 USD</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                <span className="font-bold text-sm text-white">Total Due Today:</span>
                <span className="font-black text-lg text-emerald-400">${planPrice}.00 USD</span>
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
                    <span>AUTHORIZE & PAY ${planPrice}.00 USD</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> 14-Day Money Back Guarantee
                </span>
                <span>•</span>
                <span>Cancel Anytime with 1 Click</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
