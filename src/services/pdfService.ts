import jsPDF from 'jspdf';
import type { Client, SessionNote, User, AssessmentResult } from '../types';

export function generateSessionNotePdf(
  client: Client,
  note: SessionNote,
  psychologist: User
) {
  const doc = new jsPDF();

  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CLINICAL SESSION NOTE (SOAP)', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`CONFIDENTIAL MEDICAL RECORD`, 14, 25);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(psychologist.name, 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(psychologist.clinicName || 'PsychCare Private Practice', 14, 47);
  doc.text(`License No: ${psychologist.licenseNumber || 'N/A'}`, 14, 52);

  doc.setDrawColor(220, 225, 235);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 58, 182, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 18, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(client.fullName, 35, 65);

  doc.setFont('helvetica', 'bold');
  doc.text('DOB / Age:', 18, 72);
  doc.setFont('helvetica', 'normal');
  doc.text(`${client.age} yrs (${client.gender})`, 42, 72);

  doc.setFont('helvetica', 'bold');
  doc.text('Session Date:', 110, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(note.date, 138, 65);

  doc.setFont('helvetica', 'bold');
  doc.text('Session #:', 110, 72);
  doc.setFont('helvetica', 'normal');
  doc.text(`${note.sessionNumber}`, 138, 72);

  doc.setFont('helvetica', 'bold');
  doc.text('Mood Rating:', 110, 79);
  doc.setFont('helvetica', 'normal');
  doc.text(`${note.moodRating}/10`, 138, 79);

  let y = 92;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Diagnostic Tags (DSM-5 / ICD-11):', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(79, 70, 229);
  doc.text(note.dsm5Codes.join(' | ') || 'None specified', 14, y);
  doc.setTextColor(50, 50, 50);

  y += 12;

  const renderSection = (title: string, body: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 4, 182, 7, 'F');
    doc.text(title, 16, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const splitLines = doc.splitTextToSize(body || 'N/A', 178);
    doc.text(splitLines, 16, y);
    y += splitLines.length * 5 + 6;
  };

  renderSection('S - SUBJECTIVE', note.soap.subjective);
  renderSection('O - OBJECTIVE', note.soap.objective);
  renderSection('A - ASSESSMENT', note.soap.assessment);
  renderSection('P - PLAN', note.soap.plan);

  y = Math.max(y + 10, 260);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 90, y);
  doc.setFontSize(9);
  doc.text(`${psychologist.name}`, 14, y + 5);
  doc.text('Licensed Clinical Psychologist Signature', 14, y + 10);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated via PsychCare Practice System. Strictly confidential.', 14, 285);

  doc.save(`Session_Note_${client.fullName.replace(/\s+/g, '_')}_${note.date}.pdf`);
}

export function generateAssessmentPdf(
  client: Client,
  assessment: AssessmentResult,
  psychologist: User
) {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${assessment.type} CLINICAL ASSESSMENT REPORT`, 14, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Psychometric Scale Evaluation`, 14, 25);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 14, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(client.fullName, 32, 44);

  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Date:', 120, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(assessment.date, 158, 44);

  doc.setFont('helvetica', 'bold');
  doc.text('Clinician:', 14, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(psychologist.name, 32, 50);

  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, 58, 182, 30, 3, 3, 'FD');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text('TOTAL SCORE:', 20, 68);

  doc.setFontSize(22);
  doc.text(`${assessment.totalScore} / ${assessment.maxScore}`, 60, 71);

  doc.setFontSize(12);
  doc.text(`SEVERITY: ${assessment.severity.toUpperCase()}`, 20, 82);

  let y = 98;
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Severity & Impression:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const recLines = doc.splitTextToSize(assessment.recommendation, 180);
  doc.text(recLines, 14, y);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('PsychCare Clinical Assessment Module - Confidential', 14, 285);

  doc.save(`${assessment.type}_Report_${client.fullName.replace(/\s+/g, '_')}_${assessment.date}.pdf`);
}
