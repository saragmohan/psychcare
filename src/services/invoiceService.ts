import jsPDF from 'jspdf';
import type { PaymentInvoice, User } from '../types';

export function generateInvoicePdf(invoice: PaymentInvoice, user: User): void {
  const doc = new jsPDF();
  const isPending = invoice.status === 'pending_verification';

  // Primary Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 36, 'F');

  // PsychCare Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('PsychCare Clinical OS', 16, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Official Subscription Receipt & Tax Invoice', 16, 28);

  // Status Badge
  if (isPending) {
    doc.setFillColor(217, 119, 6); // amber-600
    doc.roundedRect(150, 12, 45, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('UNDER REVIEW', 155, 20);
  } else {
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(165, 12, 30, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PAID', 174, 20);
  }

  // Invoice Details Section
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE DETAILS', 16, 48);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`Invoice ID: ${invoice.id}`, 16, 56);
  doc.text(`Date of Issue: ${new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 16, 62);
  doc.text(`Payment Status: ${isPending ? 'Pending Admin Verification' : 'Completed / Successful'}`, 16, 68);

  // Billed To Section
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text('BILLED TO (PRACTITIONER)', 115, 48);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`Name: ${user.name || invoice.userName}`, 115, 56);
  doc.text(`Email: ${user.email || invoice.userEmail}`, 115, 62);
  if (user.clinicName) {
    doc.text(`Clinic: ${user.clinicName}`, 115, 68);
  }
  if (user.licenseNumber) {
    doc.text(`License No: ${user.licenseNumber}`, 115, 74);
  }

  // Divider Line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(16, 84, 194, 84);

  // Line Items Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(16, 90, 178, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text('DESCRIPTION / SERVICE', 20, 96);
  doc.text('BILLING CYCLE', 105, 96);
  doc.text('AMOUNT', 165, 96);

  // Item Row
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.text(invoice.planName, 20, 108);
  doc.text(invoice.billingCycle === 'yearly' ? 'Annual (365 Days)' : 'Monthly (30 Days)', 105, 108);
  doc.text(`INR ${invoice.amount.toLocaleString('en-IN')}`, 165, 108);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Full access to clinical records, DSM-5 diagnostic library, unlimited patients & PDF exports', 20, 114);

  // Subtotal & Totals Box
  doc.setDrawColor(226, 232, 240);
  doc.line(16, 122, 194, 122);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text('Subtotal:', 135, 132);
  doc.text(`INR ${invoice.amount.toLocaleString('en-IN')}`, 165, 132);

  doc.text('GST / Tax (0%):', 135, 138);
  doc.text('INR 0.00', 165, 138);

  doc.setFillColor(238, 242, 255); // indigo-50
  doc.rect(130, 144, 64, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202); // indigo-700
  doc.setFontSize(11);
  doc.text('Total Paid:', 135, 152);
  doc.text(`INR ${invoice.amount.toLocaleString('en-IN')}`, 165, 152);

  // Status Badge on PDF
  doc.setFontSize(10);
  if (invoice.status === 'paid') {
    doc.setTextColor(22, 163, 74); // emerald-600
    doc.text('STATUS: PAID & VERIFIED', 16, 152);
  } else if (invoice.status === 'pending_verification') {
    doc.setTextColor(202, 138, 4); // amber-600
    doc.text('STATUS: PENDING ADMIN VERIFICATION', 16, 152);
  } else {
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text('STATUS: REJECTED', 16, 152);
  }

  // Payment Method Details
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text('PAYMENT METHOD', 16, 170);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  if (invoice.paymentMethod.type === 'card') {
    doc.text(`Credit Card: ${invoice.paymentMethod.brand || 'Card'} ending in •••• ${invoice.paymentMethod.last4 || '4242'}`, 16, 178);
    doc.text('Payment Gateway Reference: Direct Card Processing (INR)', 16, 184);
  } else if (invoice.paymentMethod.type === 'upi') {
    doc.text(`UPI / QR Payment: ${invoice.paymentMethod.upiId || 'Direct UPI Transfer'}`, 16, 178);
    doc.text(`Bank Ref / UTR No: ${invoice.paymentMethod.utrNumber || 'Verified Instant Transfer'}`, 16, 184);
  } else {
    doc.text(`Payment Channel: ${invoice.paymentMethod.type.toUpperCase()} Direct Transfer`, 16, 178);
    doc.text(`Bank Ref / UTR No: ${invoice.paymentMethod.utrNumber || 'Verified Instant Transfer'}`, 16, 184);
  }

  // Footer notes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400

  if (isPending) {
    doc.text('Account will be activated with premium membership within 1-2 hours upon admin bank verification.', 16, 244);
    doc.text('Beyond that hour if still not granted, please email payment screenshot to support@psychcare.app.', 16, 250);
  } else {
    doc.text('Thank you for partnering with PsychCare Clinical OS to power your therapy practice.', 16, 250);
  }

  doc.text('For billing inquiries or tax documentation assistance, contact support@psychcare.app.', 16, 256);
  doc.text('All rights reserved to PsychCare. • Support: support@psychcare.app', 16, 262);

  doc.save(`PsychCare_Invoice_${invoice.id}.pdf`);
}
